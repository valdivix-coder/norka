// Adaptador del servidor para el corpus sintético. No acepta contextos de Supabase.
import { z } from "zod";
import {instruccionesCaptura} from "./prompt-captura";
import { contratoInterpretacion, type Interpretacion } from "../core/contracts/interpretacion";

export type CasoSintetico={id:number;texto:string};
export type ContextoSintetico={fecha:string;zona_horaria:string;personas_a_cargo:string[];integrantes:string[];autor:string;ambitos:string[];casos:CasoSintetico[]};

export const MODELOS_GEMINI = ["gemini-4-hydrogen","gemini-3.8-flash","gemini-3.5-flash-lite","gemma-4-26b-a4b-it"] as const;
export class ErrorGemini extends Error {
  constructor(public readonly estado:number){super("GEMINI_HTTP_"+estado);}
}
export class SinModelosDisponibles extends Error { constructor(){super("SIN_MODELOS_DISPONIBLES");} }
const contratoLote=z.strictObject({resultados:z.array(z.strictObject({id:z.number().int(),elementos:contratoInterpretacion.shape.elementos})).min(1).max(5)});
export type IntentoGemini={modelo:string;resultado:string;ms:number;motivo?:string;tokensEntrada?:number;tokensSalida?:number;tokensRazonamiento?:number};
export function crearGeminiSintetico({clave,modelo,corpus,respaldos=[],solicitar=fetch,observar=()=>{}}:{
  clave:string;modelo:string;corpus:ContextoSintetico;respaldos?:readonly string[];solicitar?:typeof fetch;observar?:(dato:IntentoGemini)=>void;
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
  const fallosTransitorios=new Map<string,number>();
  let ultimoModelo:string|null=null;
  let brutas=new Map<number,Interpretacion>();
  async function evaluarGrupo(ids:readonly number[]):Promise<Map<number,Interpretacion>>{
    ultimoModelo=null;brutas=new Map();
    if(ids.length<1||ids.length>5||new Set(ids).size!==ids.length)throw new Error("LOTE_INVALIDO");
    const entradas=ids.map(id=>{const texto=casos.get(id);if(!texto)throw new Error("CASO_FUERA_DEL_CORPUS");return {id,texto};});
    const lote=ids.length>1;
    const instruccion=instruccionesCaptura+(lote?"\nCada entrada es completamente independiente. No compartas información entre entradas. Devuelve {resultados:[{id,elementos:[...]}]}, exactamente un resultado por id, sin omitir ni duplicar.":"\nDevuelve {elementos:[...]}.");
    const input=JSON.stringify({contexto,entradas:lote?entradas:entradas[0]});
    if(orden.every(m=>suspendidos.has(m)))throw new SinModelosDisponibles();
    let ultimo:unknown=new SinModelosDisponibles();
    for(const elegido of orden){
      if(suspendidos.has(elegido))continue;
      const inicio=Date.now();
      let etapa="red";
      try{
    const esGemma=elegido==="gemma-4-26b-a4b-it";
    // Gemma recibe instrucciones de JSON como texto, no depende de responseMimeType.
    const generationConfig=esGemma?{temperature:0,thinkingConfig:{thinkingLevel:"minimal"}}:{responseMimeType:"application/json",responseJsonSchema:z.toJSONSchema(lote?contratoLote:contratoInterpretacion),temperature:0};
    const r=await solicitar("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(elegido)+":generateContent",{
      method:"POST",cache:"no-store",redirect:"error",
      headers:{"Content-Type":"application/json","x-goog-api-key":clave},
      body:JSON.stringify({...(esGemma?{}:{systemInstruction:{parts:[{text:instruccion}]}}),contents:[{parts:[{text:esGemma?instruccion+"\n"+input:input}]}],generationConfig}),
      signal:AbortSignal.timeout(lote?45000:20000),
    });
    if(!r.ok)throw new ErrorGemini(r.status);
    etapa="respuesta_http";
    const respuesta=await r.json() as {usageMetadata?:{promptTokenCount?:number;candidatesTokenCount?:number;thoughtsTokenCount?:number};candidates?:{finishReason?:string;content?:{parts?:{text?:string;thought?:boolean}[]}}[]};
    const textoRespuesta=(respuesta.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text??"").join("")??"").trim();
    // Aceptar únicamente JSON completo, opcionalmente dentro de un único bloque Markdown.
    const bloque=esGemma?textoRespuesta.match(/^```(?:json)?\s*\n([\s\S]*?)\n?```$/i):null;
    etapa=textoRespuesta?"json":"sin_texto";
    if(!textoRespuesta)throw new Error("SIN_TEXTO");
    const objeto=JSON.parse(bloque?.[1]??textoRespuesta);
    etapa="contrato_zod";
    const filas=lote?contratoLote.parse(objeto).resultados:[{id:ids[0],...contratoInterpretacion.parse(objeto)}];
    if(filas.length!==ids.length||new Set(filas.map(f=>f.id)).size!==ids.length||filas.some(f=>!ids.includes(f.id)))throw new Error("LOTE_INCOMPLETO");
    const salidas=new Map<number,Interpretacion>();
    const originales=new Map<number,Interpretacion>();
    for(const f of filas){
      const salida={elementos:f.elementos};
      originales.set(f.id,structuredClone(salida));
      // Registrar la respuesta bruta sintética antes de normalizar catálogos.
      for(const e of salida.elementos){
        if(e.persona_a_cargo!==null&&!contexto.personas_a_cargo.includes(e.persona_a_cargo)){e.persona_a_cargo=null;e.confianza="baja";}
        if(e.ambito!==null&&!contexto.ambitos.includes(e.ambito)){e.ambito=null;e.confianza="baja";}
        if(e.dirigida_a!==null&&(!contexto.integrantes.includes(e.dirigida_a)||e.dirigida_a===contexto.autor)){e.dirigida_a=null;e.confianza="baja";if(e.tipo==="propuesta")e.tipo="nota";}
      }
      salidas.set(f.id,salida);
    }
    brutas=originales;
    const u=respuesta.usageMetadata;
    const tokens=(n:unknown)=>typeof n==="number"&&Number.isSafeInteger(n)&&n>=0?n:undefined;
    observar({modelo:elegido,resultado:"valida",ms:Date.now()-inicio,tokensEntrada:tokens(u?.promptTokenCount),tokensSalida:tokens(u?.candidatesTokenCount),tokensRazonamiento:tokens(u?.thoughtsTokenCount)});
    fallosTransitorios.delete(elegido);ultimoModelo=elegido;return salidas;
      }catch(error){
        ultimo=error;
        const motivo=error instanceof ErrorGemini?"HTTP "+error.estado:error instanceof Error&&["TimeoutError","AbortError"].includes(error.name)?"timeout":etapa;
        observar({modelo:elegido,resultado:"fallida",ms:Date.now()-inicio,motivo});
        // Autenticación y errores de solicitud no se arreglan cambiando modelo.
        if(error instanceof ErrorGemini&&![404,408,429,500,502,503,504].includes(error.estado))throw error;
        // No insistir contra una cuota agotada ni un modelo ausente durante esta corrida.
        if(error instanceof ErrorGemini&&[404,429].includes(error.estado))suspendidos.add(elegido);
        else {
          const n=(fallosTransitorios.get(elegido)??0)+1;fallosTransitorios.set(elegido,n);
          // Dos fallos consecutivos de cualquier tipo transitorio: evitar repetir solicitudes improductivas en este lote.
          if(n>=2)suspendidos.add(elegido);
        }
      }
    }
    throw ultimo;
  }
  return {modeloUsado:()=>ultimoModelo,bruta:(id:number)=>brutas.get(id),evaluarLote:evaluarGrupo,async evaluar(id:number):Promise<Interpretacion>{return (await evaluarGrupo([id])).get(id)!;}};
}
