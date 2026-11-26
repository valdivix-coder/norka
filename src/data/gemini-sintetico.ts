// Adaptador del servidor para el corpus sintético. No acepta contextos de Supabase.
import { contratoInterpretacion, type Interpretacion } from "../core/contracts/interpretacion";

export type CasoSintetico={id:number;texto:string};
export type ContextoSintetico={fecha:string;zona_horaria:string;personas_a_cargo:string[];integrantes:string[];autor:string;ambitos:string[];casos:CasoSintetico[]};

export const MODELOS_GEMINI = ["gemini-4-hydrogen","gemini-3.8-flash","gemini-3.5-flash-lite"] as const;
export class ErrorGemini extends Error {
  constructor(public readonly estado:number){super("GEMINI_HTTP_"+estado);}
}
export function crearGeminiSintetico({clave,modelo,corpus,respaldos=[],solicitar=fetch}:{
  clave:string;modelo:string;corpus:ContextoSintetico;respaldos?:readonly string[];solicitar?:typeof fetch;
}){
  if(typeof window!=="undefined")throw new Error("SOLO_SERVIDOR");
  if(!clave||![modelo,...respaldos].every(m=>MODELOS_GEMINI.some(permitido=>permitido===m)))throw new Error("CONFIGURACION_GEMINI_INVALIDA");
  // Solo se proyectan campos explícitos. No se adjuntan expectativas ni IDs privados.
  const contexto={fecha:corpus.fecha,zona_horaria:corpus.zona_horaria,
    personas_a_cargo:corpus.personas_a_cargo,integrantes:corpus.integrantes,
    autor:corpus.autor,ambitos:corpus.ambitos};
  const casos=new Map(corpus.casos.map(c=>[c.id,c.texto]));
  const orden=[...new Set([modelo,...respaldos])];
  const suspendidos=new Set<string>();
  let ultimoModelo:string|null=null;
  return {modeloUsado:()=>ultimoModelo,async evaluar(id:number):Promise<Interpretacion>{
    ultimoModelo=null;
    const texto=casos.get(id);
    if(!texto)throw new Error("CASO_FUERA_DEL_CORPUS");
    const input="Interpreta la frase familiar chilena. No inventes personas, plazos, horas ni montos. Una solicitud a otro integrante es propuesta, nunca asignación. Usa null cuando falte información. Devuelve solo JSON con elementos: tipo (tarea, responsabilidad, propuesta, nota), titulo, persona_a_cargo, ambito, plazo_fecha ISO, plazo_hora HH:MM, recurrencia (null o {tipo: diaria,semanal,mensual,anual,cada_n; cada: entero positivo; dias: nombres de días}), dirigida_a, confianza (alta,baja). Contexto: "+JSON.stringify(contexto)+"\nFrase: "+texto;
    let ultimo:unknown=new ErrorGemini(429);
    for(const elegido of orden){
      if(suspendidos.has(elegido))continue;
      try{
    const r=await solicitar("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(elegido)+":generateContent",{
      method:"POST",cache:"no-store",redirect:"error",
      headers:{"Content-Type":"application/json","x-goog-api-key":clave},
      body:JSON.stringify({contents:[{parts:[{text:input}]}],generationConfig:{responseMimeType:"application/json",temperature:0}}),
      signal:AbortSignal.timeout(20000),
    });
    if(!r.ok)throw new ErrorGemini(r.status);
    const respuesta=await r.json() as {candidates?:{content?:{parts?:{text?:string}[]}}[]};
    const salida=contratoInterpretacion.parse(JSON.parse(respuesta.candidates?.[0]?.content?.parts?.map(p=>p.text??"").join("")??""));
    ultimoModelo=elegido;return salida;
      }catch(error){
        ultimo=error;
        // Autenticación y errores de solicitud no se arreglan cambiando modelo.
        if(error instanceof ErrorGemini&&![404,408,429,500,502,503,504].includes(error.estado))throw error;
        // No insistir contra una cuota agotada ni un modelo ausente durante esta corrida.
        if(error instanceof ErrorGemini&&[404,429].includes(error.estado))suspendidos.add(elegido);
      }
    }
    throw ultimo;
  }};
}
