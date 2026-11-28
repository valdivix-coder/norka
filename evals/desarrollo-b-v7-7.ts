// Dedicated one-arm synthetic development B. No official corpus, no fallback, no automatic transport.
import {prepararDesarrollo77} from "./preparar-desarrollo-v7-7";
import {crearGeminiPorVersion,solicitudV77} from "../src/data/gemini-sintetico-v7-7";
import {ErrorGemini,type IntentoGemini} from "../src/data/gemini-sintetico";
import {contratoInternoV71,type SalidaInternaV71} from "../src/core/contracts/interpretacion-interna-v7-1";
import {validarV76} from "../src/core/usecases/validar-interpretacion-v7-6";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
import {capa,alertasInvencion} from "./comparacion-v7-2";
import {medirAcciones77,medirProhibidos77,medirListas77,alertasFecha77} from "./metricas-acciones-v7-7";
import {hogarSinRespaldo} from "../src/core/usecases/validar-interpretacion-v7-4";
import {planInterpretacion} from "../src/core/usecases/interpretacion";
import {debeOmitirIA} from "../src/core/usecases/prefiltro-ia";
import {iniciarRevision} from "../src/laboratorio/motor-revision-universal";
import {preseleccionV77} from "../src/laboratorio/preseleccion-v7-7";
const MODELO="gemini-3.5-flash-lite",URL="https://generativelanguage.googleapis.com/v1beta/models/"+MODELO+":generateContent";
type Entrada=ReturnType<typeof prepararDesarrollo77>["entradas"][number];
function medir(x:Entrada,s:Interpretacion){
 const e=x.corpus.casos[0].esperado,m=capa(s,e);
 return {principal:m.principal,estricta:m.estricta,acciones:medirAcciones77(s,e),prohibidos:medirProhibidos77(s,x.corpus.casos[0].prohibido),campos:m.porCampo,omitidas:m.audit.omitidas,extras:m.audit.extras};
}
function aplicacion(x:Entrada,s:Interpretacion){
 const c=x.corpus,ids=(xs:readonly string[],p:string)=>xs.map((nombre,i)=>({nombre,id:p+i})),integrantes=ids(c.integrantes,"i"),autorId=integrantes.find(z=>z.nombre===c.autor)!.id;
 const ctx={texto:c.casos[0].texto,autorId,personas:ids(c.personas_a_cargo,"p"),ambitos:ids(c.ambitos,"a"),integrantes};
 const p=planInterpretacion(s,ctx);if(!p)throw Error("PLAN_INVALIDO");
 const nombre=(xs:{id:string;nombre:string}[],id:string|null)=>xs.find(z=>z.id===id)?.nombre??null;
 const propuesta:Interpretacion={elementos:p.map(e=>({tipo:e.tipo,titulo:e.titulo,persona_a_cargo:nombre(ctx.personas,e.persona_a_cargo_id),ambito:nombre(ctx.ambitos,e.ambito_id),plazo_fecha:e.plazo_fecha,plazo_hora:e.plazo_hora,recurrencia:e.recurrencia,dirigida_a:nombre(integrantes,e.dirigida_a_id),confianza:e.por_revisar?"baja":"alta"}))};
 const rev=iniciarRevision(s,ctx);if(!rev)throw Error("REVISION_INVALIDA");
 return {propuesta,medicion:medir(x,propuesta),listas:medirListas77(s,c.casos[0].esperado,ctx),preseleccion:preseleccionV77(rev),pendientes:rev.items.map(i=>({id:i.id,campos:i.borrador.pendientes})),horaPerdida:s.elementos.filter((e,i)=>e.plazo_hora&&!p[i].plazo_hora).length,responsabilidadDegradada:s.elementos.filter((e,i)=>e.tipo==="responsabilidad"&&p[i].tipo==="tarea").length,notaSinClasificar:s.elementos.filter(e=>e.tipo==="nota").length};
}
type Medidas=ReturnType<typeof medir>;
type Valida={bruta:Interpretacion;v76:Interpretacion;v77:Interpretacion;interna:SalidaInternaV71;ajustes76:ReturnType<typeof validarV76>["ajustes"];ajustes77:{indice:number;campo:string;motivo:string}[];medidas:{bruta:Medidas;v76:Medidas;v77:Medidas;aplicacion:Medidas};aplicacion:ReturnType<typeof aplicacion>;alertas:string[]};
type Fila={id:string;grupo:string;decision:string|null;capa:string;soloDiagnostico:boolean;estado:"no_ejecutada"|"local"|"valida"|"fallida";causa?:string;datos?:Valida;intentos:IntentoGemini[]};
const capas=["bruta","v76","v77","aplicacion"] as const;
export function resumirB(filas:Fila[]){
 const val=filas.filter(f=>f.estado==="valida"&&f.datos);
 const resumir=(fs:typeof val)=>Object.fromEntries(capas.map(k=>{
  const m=fs.map(f=>f.datos!.medidas[k]),esperadas=m.reduce((n,x)=>n+x.acciones.esperadas,0),entregadas=m.reduce((n,x)=>n+x.acciones.entregadas,0),correctas=m.reduce((n,x)=>n+x.acciones.correctas,0);
  return [k,{n:m.length,principal:m.filter(x=>x.principal).length,estricta:m.filter(x=>x.estricta).length,esperadas,entregadas,correctas,precision:entregadas?correctas/entregadas:null,recuperacion:esperadas?correctas/esperadas:null,sustituidas:m.reduce((n,x)=>n+x.acciones.sustituidas,0),omitidas:m.reduce((n,x)=>n+x.omitidas,0),extras:m.reduce((n,x)=>n+x.extras,0),prohibidos:m.reduce((n,x)=>n+x.prohibidos.length,0)}];
 }));
 const intentos=filas.flatMap(f=>f.intentos),lat=intentos.filter(i=>i.resultado==="valida").map(i=>i.ms).sort((a,b)=>a-b);
 const lista=val.map(f=>f.datos!.aplicacion);
 const clases=[{clase:"realizadas",ids:["F04","F05","S04"]},{clase:"consulta_navegacion_modificacion_completar",ids:["N01","N02","N03","N04"]},{clase:"condicion",ids:["F11"]},{clase:"varios_destinatarios",ids:["S08"]}].map(x=>({...x,evaluados:val.filter(f=>x.ids.includes(f.id)).length,discrepancias:val.filter(f=>x.ids.includes(f.id)&&(!f.datos!.medidas.bruta.estricta||f.datos!.medidas.bruta.prohibidos.length||f.datos!.medidas.bruta.acciones.sustituidas)).map(f=>f.id)}));
 return {validas:val.length,locales:filas.filter(f=>f.estado==="local").length,fallidas:filas.filter(f=>f.estado==="fallida").length,noEjecutadas:filas.filter(f=>f.estado==="no_ejecutada").length,solicitudes:intentos.length,medidas:resumir(val),sinDecision:resumir(val.filter(f=>!f.decision&&!f.soloDiagnostico)),conDecision:resumir(val.filter(f=>f.decision&&!f.soloDiagnostico)),diagnostico:resumir(val.filter(f=>f.soloDiagnostico)),porGrupo:Object.fromEntries([...new Set(filas.map(f=>f.grupo))].map(g=>[g,resumir(val.filter(f=>f.grupo===g))])),listas:{listas:lista.reduce((n,x)=>n+x.listas.listas,0),errores:lista.reduce((n,x)=>n+x.listas.listasConError,0),pendientes:lista.reduce((n,x)=>n+x.listas.pendientes,0),preseleccionadas:lista.reduce((n,x)=>n+x.preseleccion.length,0),horaPerdida:lista.reduce((n,x)=>n+x.horaPerdida,0),responsabilidadDegradada:lista.reduce((n,x)=>n+x.responsabilidadDegradada,0),notaSinClasificar:lista.reduce((n,x)=>n+x.notaSinClasificar,0)},tokens:{entrada:intentos.reduce((n,x)=>n+(x.tokensEntrada??0),0),salida:intentos.reduce((n,x)=>n+(x.tokensSalida??0),0),razonamiento:intentos.reduce((n,x)=>n+(x.tokensRazonamiento??0),0),sinMedicion:intentos.filter(x=>x.tokensEntrada===undefined||x.tokensSalida===undefined).length},medianaMs:lat.length?(lat[Math.floor((lat.length-1)/2)]+lat[Math.floor(lat.length/2)])/2:null,p95Ms:lat.length?lat[Math.ceil(lat.length*.95)-1]:null,clases};
}
export async function ejecutarB77({clave,transporte,esperar,progreso=()=>{}}:{clave:string;transporte:typeof fetch;esperar:(ms:number)=>Promise<void>;progreso?:(x:{filas:Fila[];parada:string|null;resumen:ReturnType<typeof resumirB>})=>void}){
 if(!clave||typeof transporte!=="function")throw Error("TRANSPORTE_EXPLICITO_OBLIGATORIO");
 const p=prepararDesarrollo77();
 if(p.enviables!==52||p.locales.join(",")!=="N06,N07"||p.entradas.some(x=>x.local&&!x.prefiltro.omitir))throw Error("PREFILTRO_INVALIDO");
 const filas:Fila[]=p.entradas.map(x=>({id:x.id,grupo:x.grupo,capa:x.capa,decision:x.decision,soloDiagnostico:x.soloDiagnostico,estado:x.local?"local":"no_ejecutada",intentos:[]}));
 let parada:string|null=null,solicitudes=0;
 const publicar=()=>{const r={filas,parada,resumen:resumirB(filas)};progreso(r);return r;};
 publicar();
 for(const [i,x] of p.entradas.entries()){
  const f=filas[i],c=x.corpus,q=c.casos[0];if(x.local)continue;
  if(debeOmitirIA(q.texto).omitir){parada="prefiltro:"+x.id;break;}
  const esperado=JSON.stringify(solicitudV77(c,[{id:q.id,texto:q.texto}]).cuerpo);
  const protegido:typeof fetch=async(u,init)=>{
   if(String(u)!==URL||init?.method!=="POST"||init.body!==esperado||solicitudes>=104||f.intentos.length>=2)throw Error("SOLICITUD_NO_AUTORIZADA");
   solicitudes++;return transporte(u,init);
  };
  const ia=crearGeminiPorVersion({clave,modelo:MODELO,corpus:c,version:"7.7",solicitar:protegido,observar:d=>f.intentos.push(d)});
  let salida:Interpretacion|undefined;
  for(let k=0;k<2;k++){
   try{if(solicitudes>0)await esperar(4500);salida=await ia.evaluar(q.id);break;}
   catch(err){const causa=err instanceof ErrorGemini?"HTTP "+err.estado:f.intentos.at(-1)?.motivo??"sin_salida_valida";
    if(k===0&&(causa==="HTTP 503"||causa==="timeout"))continue;
    f.estado="fallida";f.causa=causa;parada=x.id+":"+causa;break;
   }
  }
  if(!salida){publicar();break;}
  try{
   const bruta=ia.bruta(q.id)!,interna=contratoInternoV71.parse(ia.brutaInterna(q.id));
   const ctx={fecha:c.fecha,texto:q.texto,personas:c.personas_a_cargo,integrantes:c.integrantes,autor:c.autor,ambitos:c.ambitos};
   const anterior=validarV76(structuredClone(interna),ctx),v76=contratoInterpretacion.parse(anterior.publica),v77=salida;
   const ap=aplicacion(x,v77);
   const alertas=[...alertasInvencion(q.texto,bruta,c.personas_a_cargo,c.integrantes).map(a=>"bruta:"+a),...alertasInvencion(q.texto,v77,c.personas_a_cargo,c.integrantes).map(a=>"v77:"+a),...alertasFecha77(q.texto,bruta).map(a=>"bruta:"+a),...alertasFecha77(q.texto,v77).map(a=>"v77:"+a),...bruta.elementos.flatMap((e,j)=>e.persona_a_cargo==="El hogar"&&hogarSinRespaldo(q.texto,e.titulo,interna.elementos[j]?.persona_base)?["bruta:"+j+":hogar_sin_respaldo"]:[])];
   f.estado="valida";f.datos={bruta,v76,v77,interna,ajustes76:anterior.ajustes,ajustes77:ia.ajustes(q.id),medidas:{bruta:medir(x,bruta),v76:medir(x,v76),v77:medir(x,v77),aplicacion:ap.medicion},aplicacion:ap,alertas};
   // Explicit corpus prohibitions are diagnostic in development; independent invention alerts stop.
   if(alertas.length)parada=x.id+":alerta_candidata";
   else if(f.intentos.some(t=>t.tokensEntrada===undefined||t.tokensSalida===undefined))parada=x.id+":medicion_incompleta";
  }catch{f.estado="fallida";f.causa="evaluacion_local";parada=x.id+":evaluacion_local";}
  publicar();if(parada)break;
 }
 return publicar();
}
