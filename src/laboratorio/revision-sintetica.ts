// Prototipo puro y sintético: no es contrato público, no guarda ni ejecuta.
import { contratoInterpretacion,type ElementoInterpretado } from "../core/contracts/interpretacion";
import { planInterpretacion,type ContextoInterpretacion,type ElementoAplicable } from "../core/usecases/interpretacion";
export type BorradorSintetico={indice:number;reconocido:ElementoInterpretado;propuesta:ElementoAplicable;pendientes:string[];estado:"lista"|"por_completar"};
const igual=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function prepararRevisionSintetica(dato:unknown,ctx:ContextoInterpretacion):{original:string;acciones:BorradorSintetico[]}|null {
 const r=contratoInterpretacion.safeParse(dato);
 if(!r.success)return null;
 const plan=planInterpretacion(r.data,ctx);
 if(!plan||plan.length!==r.data.elementos.length)return null;
 const acciones=r.data.elementos.map((e,i):BorradorSintetico=>{
  const p=plan[i],pendientes:string[]=[];
  if(!p.persona_a_cargo_id)pendientes.push("beneficiario");
  if(!p.ambito_id)pendientes.push("ambito");
  if(e.plazo_hora&&!e.plazo_fecha)pendientes.push("fecha_para_hora");
  if(e.recurrencia&&!igual(e.recurrencia,p.recurrencia))pendientes.push("recurrencia");
  if(e.dirigida_a&&!p.dirigida_a_id||e.tipo==="propuesta"&&!p.dirigida_a_id)pendientes.push("destinatario");
  if(e.tipo!==p.tipo)pendientes.push("tipo");
  if(e.titulo!==p.titulo)pendientes.push("titulo");
  if(e.confianza==="baja")pendientes.push("interpretacion");
  return {indice:i,reconocido:structuredClone(e),propuesta:structuredClone(p),pendientes,estado:pendientes.length||p.por_revisar?"por_completar":"lista"};
 });
 return {original:ctx.texto,acciones};
}
