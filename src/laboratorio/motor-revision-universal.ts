// Experimental in-memory review only. No persistence, network, UI side effects or actual execution.
import {elementoInterpretado,type ElementoInterpretado} from "../core/contracts/interpretacion";
import type {ContextoInterpretacion,ElementoAplicable} from "../core/usecases/interpretacion";
import {prepararRevisionSintetica,type BorradorSintetico} from "./revision-sintetica";
type Item={id:number;original:ElementoInterpretado;actual:ElementoInterpretado;borrador:BorradorSintetico;estado:"pendiente"|"confirmada"|"descartada"};
export type RevisionUniversal={original:string;contexto:ContextoInterpretacion;revision:number;items:Item[];recibos:{revision:number;ids:number[];propuestas:ElementoAplicable[]}[]};
const copiar=<T>(x:T):T=>structuredClone(x);
export function iniciarRevision(dato:unknown,ctx:ContextoInterpretacion):RevisionUniversal|null{
 const p=prepararRevisionSintetica(dato,ctx);
 if(!p)return null;
 return {original:p.original,contexto:copiar(ctx),revision:0,items:p.acciones.map(a=>({id:a.indice,original:copiar(a.reconocido),actual:copiar(a.reconocido),borrador:copiar(a),estado:"pendiente"})),recibos:[]};
}
function exigirRevision(s:RevisionUniversal,revision:number){if(s.revision!==revision)throw Error("REVISION_DESACTUALIZADA");}
export function editarRevision(s:RevisionUniversal,revision:number,id:number,dato:unknown):RevisionUniversal{
 exigirRevision(s,revision);const e=elementoInterpretado.parse(dato);
 const p=prepararRevisionSintetica({elementos:[e]},s.contexto);
 if(!p)throw Error("DATOS_INVALIDOS");
 const n=copiar(s),i=n.items.find(x=>x.id===id);
 if(!i||i.estado!=="pendiente")throw Error("ACCION_NO_EDITABLE");
 i.actual=copiar(e);i.borrador={...p.acciones[0],indice:id};n.revision++;return n;
}
export function descartarRevision(s:RevisionUniversal,revision:number,id:number):RevisionUniversal{
 exigirRevision(s,revision);const n=copiar(s),i=n.items.find(x=>x.id===id);
 if(!i||i.estado!=="pendiente")throw Error("ACCION_NO_EDITABLE");
 i.estado="descartada";n.revision++;return n;
}
export function confirmarRevision(s:RevisionUniversal,revision:number,ids:number[]):RevisionUniversal{
 exigirRevision(s,revision);
 if(!ids.length||new Set(ids).size!==ids.length)throw Error("SELECCION_INVALIDA");
 const items=ids.map(id=>s.items.find(x=>x.id===id));
 if(items.some(i=>!i||i.estado!=="pendiente"||i.borrador.estado!=="lista"||i.borrador.propuesta.ejecutor_id!==null))throw Error("ACCIONES_PENDIENTES");
 const n=copiar(s);
 for(const i of n.items)if(ids.includes(i.id))i.estado="confirmada";
 n.revision++;n.recibos.push({revision:n.revision,ids:[...ids],propuestas:items.map(i=>copiar(i!.borrador.propuesta))});return n;
}
export function deshacerConfirmacion(s:RevisionUniversal,revision:number):RevisionUniversal{
 exigirRevision(s,revision);const n=copiar(s),r=n.recibos.at(-1);
 if(!r||r.revision!==revision)throw Error("NO_SE_PUEDE_DESHACER");
 for(const i of n.items)if(r.ids.includes(i.id))i.estado="pendiente";
 n.recibos.pop();n.revision++;return n;
}
