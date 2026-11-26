import { contratoInterpretacion,type ElementoInterpretado } from "../contracts/interpretacion";
export type ContextoInterpretacion={
  texto:string;autorId:string;
  personas:readonly {id:string;nombre:string}[];
  ambitos:readonly {id:string;nombre:string}[];
  integrantes:readonly {id:string;nombre:string}[];
};
export type ElementoAplicable={
  tipo:"tarea"|"responsabilidad"|"propuesta";
  titulo:string;persona_a_cargo_id:string|null;ambito_id:string|null;
  plazo_fecha:string|null;plazo_hora:string|null;
  recurrencia:ElementoInterpretado["recurrencia"];
  dirigida_a_id:string|null;ejecutor_id:null;por_revisar:boolean;
};
export function sinClasificar(texto:string):ElementoAplicable {
  return {tipo:"tarea",titulo:texto,persona_a_cargo_id:null,ambito_id:null,plazo_fecha:null,
    plazo_hora:null,recurrencia:null,dirigida_a_id:null,ejecutor_id:null,por_revisar:true};
}
function idExacto(lista:readonly {id:string;nombre:string}[],nombre:string|null):string|null {
  const candidatos=lista.filter(x=>x.nombre===nombre);
  return candidatos.length===1?candidatos[0].id:null;
}
// El modelo nunca asigna un ejecutor. La propuesta queda pendiente de aceptación.
export function planInterpretacion(dato:unknown,contexto:ContextoInterpretacion):ElementoAplicable[]|null {
  const r=contratoInterpretacion.safeParse(dato);
  if(!r.success)return null;
  return r.data.elementos.map(e=>{
    if(e.tipo==="nota")return sinClasificar(contexto.texto);
    const persona=idExacto(contexto.personas,e.persona_a_cargo);
    const ambito=idExacto(contexto.ambitos,e.ambito);
    const destinatario=idExacto(contexto.integrantes,e.dirigida_a);
    const otro=destinatario!==null&&destinatario!==contexto.autorId;
    // Si se identifica a otro integrante, se propone incluso si el modelo etiquetó mal.
    if(e.tipo==="propuesta"&&!otro || e.dirigida_a!==null&&!destinatario)
      return sinClasificar(contexto.texto);
    const revisar=e.confianza==="baja"||!persona||!ambito;
    const tipo=otro?"propuesta":e.tipo==="responsabilidad"&&e.recurrencia&&persona&&ambito?"responsabilidad":"tarea";
    return {tipo,titulo:e.titulo,persona_a_cargo_id:persona,ambito_id:ambito,
      plazo_fecha:e.plazo_fecha,plazo_hora:e.plazo_fecha?e.plazo_hora:null,
      recurrencia:tipo==="responsabilidad"||tipo==="propuesta"?e.recurrencia:null,
      dirigida_a_id:otro?destinatario:null,ejecutor_id:null,
      por_revisar:revisar||(e.tipo==="responsabilidad"&&tipo==="tarea")||(!e.plazo_fecha&&!!e.plazo_hora)};
  });
}
export async function interpretarConReintento(contexto:ContextoInterpretacion,interpretar:()=>Promise<unknown>){
  for(let i=0;i<2;i++){
    try{const plan=planInterpretacion(await interpretar(),contexto);if(plan)return {plan,intentos:i+1,fallida:false};}
    catch{/* no registrar texto ni respuesta del modelo */}
  }
  return {plan:[sinClasificar(contexto.texto)],intentos:2,fallida:true};
}
