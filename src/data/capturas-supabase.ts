import type { AlmacenCaptura } from "../core/ports/captura";
import type { CapturaGuardada, TareaCapturada } from "../core/domain/captura";
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

export async function listarCapturasPendientes({url,claveServicio,familiaId,solicitar=fetch}:{
  url:string;claveServicio:string;familiaId:string;solicitar?:typeof fetch;
}):Promise<TareaCapturada[]>{
  if(typeof window!=="undefined"||new URL(url).protocol!=="https:"||!claveServicio) throw new Error("CONFIGURACION_INVALIDA");
  const destino=new URL("/rest/v1/tareas",url);
  destino.search=new URLSearchParams({familia_id:"eq."+familiaId,estado:"eq.pendiente",por_revisar:"eq.true",
    captura_id:"not.is.null",select:"id,familia_id,titulo,revision,captura_id",order:"creado_en.desc,id.desc",limit:"100"}).toString();
  const r=await solicitar(destino,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000),headers:{apikey:claveServicio}});
  if(!r.ok)throw new Error("CAPTURAS_NO_DISPONIBLES");
  const filas=await r.json() as TareaCapturada[];
  if(!Array.isArray(filas)||filas.some(f=>f.familia_id!==familiaId))throw new Error("RESPUESTA_INVALIDA");
  return filas;
}
