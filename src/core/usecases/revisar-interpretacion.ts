import type {Interpretacion,ElementoInterpretado} from "../contracts/interpretacion";
export type ContextoRevision={texto:string;personas:readonly string[];integrantes:readonly string[];ambitos:readonly string[];autor:string};
export type AjusteInterpretacion={indice:number;campo:string;motivo:string};
const normal=(s:string)=>s.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase();
function menciona(texto:string,nombre:string):boolean{
 const n=normal(nombre).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 return n.length>0&&new RegExp("(^|[^\\p{L}\\p{N}])"+n+"($|[^\\p{L}\\p{N}])","u").test(normal(texto));
}
const numeros:Record<string,number>={un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,quince:15};
export function intervaloExplicito(texto:string):{tipo:"diaria"|"semanal"|"mensual"|"anual";cada:number}|null{
 const s=normal(texto);
 const m=[...s.matchAll(/\bcada\s+(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince)\s+)?(dias?|semanas?|mes(?:es)?|anos?)\b/g)];
 if(m.length!==1)return null;
 const n=m[0][1]?(numeros[m[0][1]]??Number(m[0][1])):1;
 if(!Number.isSafeInteger(n)||n<1)return null;
 const u=m[0][2];return {tipo:u.startsWith("dia")?"diaria":u.startsWith("semana")?"semanal":u.startsWith("mes")?"mensual":"anual",cada:n};
}
// No se inventan entidades, no se rellenan null ni se agregan acciones.
// Los límites de esta revisión se documentan; no sustituye revisión semántica humana.
export function revisarInterpretacion(bruta:Interpretacion,c:ContextoRevision):{salida:Interpretacion;ajustes:AjusteInterpretacion[]}{
 const ajustes:AjusteInterpretacion[]=[];
 const salida={elementos:bruta.elementos.map((origen,indice)=>{
  const e:ElementoInterpretado={...origen,recurrencia:origen.recurrencia?{...origen.recurrencia,dias:[...origen.recurrencia.dias]}:null};
  const marcar=(campo:string,motivo:string)=>{ajustes.push({indice,campo,motivo});e.confianza="baja";};
  if(e.persona_a_cargo!==null&&(!c.personas.includes(e.persona_a_cargo)||(e.persona_a_cargo!=="El hogar"&&!menciona(c.texto,e.persona_a_cargo)))){
   e.persona_a_cargo=null;marcar("persona_a_cargo","sin_evidencia_nombre");
  }
  if(e.ambito!==null&&!c.ambitos.includes(e.ambito)){e.ambito=null;marcar("ambito","fuera_catalogo");}
  if(e.dirigida_a!==null&&(!c.integrantes.includes(e.dirigida_a)||e.dirigida_a===c.autor||!menciona(c.texto,e.dirigida_a))){
   e.dirigida_a=null;marcar("dirigida_a","sin_evidencia_destinatario");if(e.tipo==="propuesta")e.tipo="nota";
  }
  // Solo normalizar unidad inequívoca de una única acción recurrente ya detectada.
  if(bruta.elementos.length===1&&e.recurrencia&&(e.tipo==="responsabilidad"||e.tipo==="propuesta")){
   const i=intervaloExplicito(c.texto);
   if(i&&(e.recurrencia.tipo!==i.tipo||e.recurrencia.cada!==i.cada)){
    e.recurrencia={...i,dias:i.tipo==="semanal"?e.recurrencia.dias:[]};marcar("recurrencia","unidad_explicita");
   }
  }
  return e;
 })};
 return {salida,ajustes};
}
