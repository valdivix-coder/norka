import type {Interpretacion,ElementoInterpretado} from "../src/core/contracts/interpretacion";
import {auditarAcciones} from "./auditar-acciones";
import {iniciarRevision} from "../src/laboratorio/motor-revision-universal";
import type {ContextoInterpretacion} from "../src/core/usecases/interpretacion";
const tokens=(s:string)=>new Set(s.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().match(/[a-z0-9]+/g)?.filter(x=>x.length>=3&&!["para","del","los","las","una","con","que","por","comprar","pagar","hacer","llevar","retirar","llamar","enviar","transferir","ordenar"].includes(x))??[]);
export function tituloCompatible(a:string,b:string){const x=tokens(a),y=tokens(b),n=[...x].filter(k=>y.has(k)).length;return a.trim().toLowerCase()===b.trim().toLowerCase()||n/Math.max(1,x.size+y.size-n)>=.3;}
export function medirAcciones77(a:Interpretacion,e:Interpretacion){
 const audit=auditarAcciones(a,e);
 const pares=audit.pares.map(p=>{const x=a.elementos[p.actual],y=e.elementos[p.esperado];const campos=p.campos.length===0&&x.tipo===y.tipo,titulo=tituloCompatible(x.titulo,y.titulo);const firma=(q:ElementoInterpretado)=>JSON.stringify([q.tipo,q.persona_a_cargo,q.ambito,q.plazo_fecha,q.plazo_hora,q.dirigida_a,q.recurrencia&&{...q.recurrencia,dias:[...q.recurrencia.dias].sort()}]);
 const alternativas=e.elementos.filter(z=>firma(z)===firma(x));const cruzado=!campos&&alternativas.length===1&&!tituloCompatible(x.titulo,alternativas[0].titulo);return {...p,camposCorrectos:campos,tituloCompatible:titulo,cruzado,correcta:campos&&titulo};});
 const correctas=pares.filter(p=>p.correcta).length,esperadas=e.elementos.length,entregadas=a.elementos.length;
 return {esperadas,entregadas,correctas,sustituidas:pares.filter(p=>!p.tituloCompatible||p.cruzado).length,sinPar:entregadas-pares.length,omitidas:esperadas-pares.length,precision:entregadas?correctas/entregadas:null,recuperacion:esperadas?correctas/esperadas:null,pares};
}
export type Prohibido={indice?:number;campo:string;valor?:unknown;contiene?:string};
export function medirProhibidos77(a:Interpretacion,reglas:readonly Prohibido[]=[]){return reglas.flatMap((r,k)=>a.elementos.flatMap((e,i)=>{if(r.indice!==undefined&&r.indice!==i)return [];const v=e[r.campo as keyof ElementoInterpretado];return (r.valor!==undefined&&v===r.valor)||(r.contiene!==undefined&&String(v).toLowerCase().includes(r.contiene.toLowerCase()))?[{regla:k,indice:i,campo:r.campo}]:[];}));}
export function medirListas77(a:Interpretacion,e:Interpretacion,ctx:ContextoInterpretacion){
 const s=iniciarRevision(a,ctx);if(!s)throw Error("REVISION_INVALIDA");
 const m=medirAcciones77(a,e);
 let listas=0,listasErrorCampos=0,listasErrorTitulo=0,listasConError=0,pendientes=0,pendientesCoincidentes=0;
 for(const i of s.items){const p=m.pares.find(p=>p.actual===i.id),ok=!!p?.correcta;if(i.borrador.estado==="lista"){listas++;if(!p?.camposCorrectos)listasErrorCampos++;if(p&&!p.tituloCompatible)listasErrorTitulo++;if(!ok)listasConError++;}else{pendientes++;if(ok)pendientesCoincidentes++;}}
 return {listas,listasErrorCampos,listasErrorTitulo,listasConError,pendientes,pendientesCoincidentes};
}
// Diagnostic only: lexical compatibility is not semantic proof. Manual review remains mandatory.
export function alertasFecha77(texto:string,a:Interpretacion){
 const t=texto.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase();
 const marca=/\b(?:hoy|manana|ayer|lunes|martes|miercoles|jueves|viernes|sabado|domingo|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|al tiro|fin de mes|proxima semana|otra semana|semana que viene|esta semana)\b|\b(?:el|del|al|hasta el|antes del|para el|vence el)\s+\d{1,2}\b|\b(?:en|dentro de)\s+\d+\s+(?:dias?|semanas?)\b/;
 return a.elementos.flatMap((x,i)=>x.plazo_fecha&&!marca.test(t)?[i+":fecha_sin_marcador_especifico"]:[]);
}
