import type { AlmacenCaptura } from "../core/ports/captura";
import type { CapturaGuardada } from "../core/domain/captura";
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
