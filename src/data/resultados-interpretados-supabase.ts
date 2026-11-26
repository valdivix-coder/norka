import { cambiosResultados, respuestaResultados, type CambiosResultados } from "../core/contracts/resultados-interpretados";
import { ErrorEdicionCaptura } from "./capturas-supabase";
export async function gestionarResultadosInterpretados({url,claveServicio,familiaId,cuentaId,solicitar=fetch}:{
 url:string;claveServicio:string;familiaId:string;cuentaId:string;solicitar?:typeof fetch;
},datos:CambiosResultados){
 if(typeof window!=="undefined"||new URL(url).protocol!=="https:"||!claveServicio)throw new Error("CONFIGURACION_INVALIDA");
 const entrada=cambiosResultados.parse(datos);
 const r=await solicitar(new URL("/rest/v1/rpc/gestionar_resultados_interpretados",url),{
  method:"POST",cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000),
  headers:{apikey:claveServicio,"Content-Type":"application/json"},
  body:JSON.stringify({p_familia:familiaId,p_cuenta:cuentaId,p_captura:entrada.capturaId,p_cambios:entrada.cambios,p_deshacer:entrada.deshacer})
 });
 if(!r.ok){
  let mensaje:unknown;try{mensaje=(await r.json() as {message?:unknown}).message;}catch{/* no registrar cuerpo */}
  throw new ErrorEdicionCaptura(mensaje==="CONFLICTO_REVISION"?"conflicto":["FUERA_DE_FAMILIA","CAPTURA_NO_EDITABLE"].includes(String(mensaje))?"no_editable":"conexion");
 }
 const respuesta=respuestaResultados.parse(await r.json());
 const esperadas=new Map(entrada.cambios.map(c=>[c.id,c]));
 if(respuesta.length!==esperadas.size)throw new ErrorEdicionCaptura("respuesta");
 for(const c of respuesta){
  const anterior=esperadas.get(c.id);
  if(!anterior||anterior.tipo!==c.tipo||c.revision!==anterior.revision+1)throw new ErrorEdicionCaptura("respuesta");
  esperadas.delete(c.id);
 }
 if(esperadas.size)throw new ErrorEdicionCaptura("respuesta");
 return respuesta;
}
