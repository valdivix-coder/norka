import type { AlmacenCaptura } from "../core/ports/captura";
import type { CapturaGuardada, TareaCapturada, TareaCapturadaVisible } from "../core/domain/captura";
// Adaptador exclusivamente de servidor. El RPC revalida pertenencia y autor en la transacción.
export function crearAlmacenCaptura({url,claveServicio,familiaId,cuentaId,solicitar=fetch}:{
  url:string;claveServicio:string;familiaId:string;cuentaId:string;solicitar?:typeof fetch;
}):AlmacenCaptura {
  if(typeof window!=="undefined") throw new Error("SOLO_SERVIDOR");
  if(new URL(url).protocol!=="https:"||!claveServicio) throw new Error("CONFIGURACION_INVALIDA");
  return {async guardar(dato){
    const r=await solicitar(new URL("/rest/v1/rpc/guardar_captura",url),{
      method:"POST",cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000),
      headers:{apikey:claveServicio,"Content-Type":"application/json"},
      body:JSON.stringify({p_familia:familiaId,p_cuenta:cuentaId,p_captura:dato.id,p_texto:dato.texto,p_origen:dato.origen}),
    });
    if(!r.ok) throw new Error("CAPTURA_NO_GUARDADA");
    const d=await r.json() as CapturaGuardada;
    if(d.captura_id!==dato.id||typeof d.tarea_id!=="string") throw new Error("RESPUESTA_INVALIDA");
    return d;
  }};
}

export async function listarCapturasPendientes({url,claveServicio,familiaId,integranteId,solicitar=fetch}:{
  url:string;claveServicio:string;familiaId:string;integranteId:string;solicitar?:typeof fetch;
}):Promise<TareaCapturadaVisible[]>{
  if(typeof window!=="undefined"||new URL(url).protocol!=="https:"||!claveServicio) throw new Error("CONFIGURACION_INVALIDA");
  const destino=new URL("/rest/v1/tareas",url);
  destino.search=new URLSearchParams({familia_id:"eq."+familiaId,estado:"eq.pendiente",por_revisar:"eq.true",
    captura_id:"not.is.null",select:"id,familia_id,titulo,revision,captura_id,capturas(autor_id,estado)",order:"creado_en.desc,id.desc",limit:"100"}).toString();
  const r=await solicitar(destino,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000),headers:{apikey:claveServicio}});
  if(!r.ok)throw new Error("CAPTURAS_NO_DISPONIBLES");
  const filas=await r.json() as (TareaCapturada & {capturas?:{autor_id:string;estado:string}|null})[];
  if(!Array.isArray(filas)||filas.some(f=>f.familia_id!==familiaId))throw new Error("RESPUESTA_INVALIDA");
  return filas.map(({id,familia_id,titulo,revision,captura_id,capturas})=>({id,familia_id,titulo,revision,captura_id,editable:capturas?.autor_id===integranteId&&capturas?.estado==="pendiente"}));
}

export async function editarResultadoCaptura({url,claveServicio,familiaId,cuentaId,solicitar=fetch}:{
  url:string;claveServicio:string;familiaId:string;cuentaId:string;solicitar?:typeof fetch;
},dato:{capturaId:string;tareaId:string;revision:number;titulo:string|null;descartar:boolean}):Promise<TareaCapturada & {estado:string}>{
  if(typeof window!=="undefined"||new URL(url).protocol!=="https:"||!claveServicio)throw new Error("CONFIGURACION_INVALIDA");
  const r=await solicitar(new URL("/rest/v1/rpc/editar_resultado_captura",url),{method:"POST",cache:"no-store",redirect:"error",
    signal:AbortSignal.timeout(10000),headers:{apikey:claveServicio,"Content-Type":"application/json"},
    body:JSON.stringify({p_familia:familiaId,p_cuenta:cuentaId,p_captura:dato.capturaId,p_tarea:dato.tareaId,p_revision:dato.revision,p_titulo:dato.titulo,p_descartar:dato.descartar})});
  if(!r.ok)throw new Error("CAPTURA_NO_EDITADA");
  const v=await r.json() as TareaCapturada & {estado:string};
  if(v.familia_id!==familiaId||v.id!==dato.tareaId||v.captura_id!==dato.capturaId||v.revision!==dato.revision+1)throw new Error("RESPUESTA_INVALIDA");
  return v;
}
