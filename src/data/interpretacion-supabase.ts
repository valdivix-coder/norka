import type { ColaInterpretacion,ReservaInterpretacion,ResultadoInterpretacion } from "../core/ports/interpretacion";
type Config={url:string;claveServicio:string;familiaId:string;cuentaId:string;capturaId:string;solicitar?:typeof fetch};
type Fila={id:string;familia_id:string;nombre:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Exclusivo de servidor. El llamador obtiene cuentaId de la sesión, no de la petición.
// El RPC comprueba consentimiento y pertenencia ANTES de reservar y cada vez que aplica.
// Esta cola NO se conecta al proveedor gratuito ni a una acción de navegador.
export function crearColaInterpretacionSupabase({url,claveServicio,familiaId,cuentaId,capturaId,solicitar=fetch}:Config):ColaInterpretacion{
  if(typeof window!=="undefined"||new URL(url).protocol!=="https:"||!claveServicio||
    ![familiaId,cuentaId,capturaId].every(id=>uuid.test(id)))throw new Error("CONFIGURACION_INVALIDA");
  const base={p_familia:familiaId,p_cuenta:cuentaId,p_captura:capturaId};
  async function pedir(ruta:string,filtros:Record<string,string>,cuerpo?:unknown):Promise<unknown>{
    const u=new URL("/rest/v1/"+ruta,url);
    u.search=new URLSearchParams(filtros).toString();
    const r=await solicitar(u,{method:cuerpo===undefined?"GET":"POST",cache:"no-store",redirect:"error",
      signal:AbortSignal.timeout(10000),headers:{apikey:claveServicio,"Content-Type":"application/json"},
      body:cuerpo===undefined?undefined:JSON.stringify(cuerpo)});
    if(!r.ok)throw new Error("COLA_NO_DISPONIBLE");
    return r.json();
  }
  async function filas<T extends {familia_id:string}>(ruta:string,filtros:Record<string,string>):Promise<T[]>{
    const r=await pedir(ruta,{...filtros,familia_id:"eq."+familiaId});
    if(!Array.isArray(r)||r.some(x=>!x||x.familia_id!==familiaId))throw new Error("RESPUESTA_FUERA_DE_FAMILIA");
    return r as T[];
  }
  let reservaActual:ReservaInterpretacion|null=null;
  return {
    async reservar(){
      reservaActual=null;
      const v=await pedir("rpc/reservar_interpretacion",{},base) as {revision:number;intentos:number}|null;
      if(v===null)return null;
      if(!Number.isSafeInteger(v.revision)||v.revision<0||![1,2].includes(v.intentos))throw new Error("RESERVA_INVALIDA");
      const [autor]=await filas<{id:string;familia_id:string;cuenta_id:string;consentimiento_ia:boolean}>("integrantes",{
        select:"id,familia_id,cuenta_id,consentimiento_ia",cuenta_id:"eq."+cuentaId,estado:"eq.activo",consentimiento_ia:"eq.true"});
      if(!autor||autor.cuenta_id!==cuentaId||autor.consentimiento_ia!==true)throw new Error("SIN_CONSENTIMIENTO");
      const [captura]=await filas<{id:string;familia_id:string;autor_id:string;texto_original:string;estado:string}>("capturas",{
        select:"id,familia_id,autor_id,texto_original,estado",id:"eq."+capturaId,autor_id:"eq."+autor.id,estado:"eq.pendiente"});
      if(!captura||captura.id!==capturaId||captura.autor_id!==autor.id||captura.estado!=="pendiente"||typeof captura.texto_original!=="string")throw new Error("CAPTURA_NO_DISPONIBLE");
      const [personas,ambitos,integrantes]=await Promise.all([
        filas<Fila>("personas_a_cargo",{select:"id,familia_id,nombre",archivada_en:"is.null"}),
        filas<Fila>("ambitos",{select:"id,familia_id,nombre"}),
        filas<{id:string;familia_id:string;cuentas:{nombre:string}|null}>("integrantes",{select:"id,familia_id,cuentas(nombre)",estado:"eq.activo"})
      ]);
      reservaActual={revision:v.revision,intentos:v.intentos,contexto:{texto:captura.texto_original,autorId:autor.id,
        personas:personas.map(({id,nombre})=>({id,nombre})),ambitos:ambitos.map(({id,nombre})=>({id,nombre})),
        integrantes:integrantes.flatMap(({id,cuentas})=>cuentas?.nombre?[{id,nombre:cuentas.nombre}]:[])}};
      return reservaActual;
    },
    async aplicar(reserva,plan,fallida){
      if(reserva!==reservaActual)throw new Error("RESERVA_INVALIDA");
      const r=await pedir("rpc/aplicar_interpretacion",{},{
        ...base,p_revision:reserva.revision,p_plan:plan,p_fallida:fallida}) as ResultadoInterpretacion;
      if(!r||!["aplicada","ya_aplicada","reintentar","sin_clasificar"].includes(r.estado))throw new Error("RESULTADO_INVALIDO");
      reservaActual=null;return r;
    }
  };
}
