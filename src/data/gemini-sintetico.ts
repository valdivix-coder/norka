// Adaptador del servidor para el corpus sintético. No acepta contextos de Supabase.
import { z } from "zod";
import {revisarInterpretacion,type AjusteInterpretacion} from "../core/usecases/revisar-interpretacion";
import {instruccionesCaptura} from "./prompt-captura";
import {instruccionesCapturaV7,sufijoLoteV7,sufijoIndividualV7} from "./prompt-captura-v7";
import {contratoInternoV7,contratoLoteInternoV7} from "../core/contracts/interpretacion-interna-v7";
import {calendarioContexto,validarV7,type SalidaInterna} from "../core/usecases/validar-interpretacion-v7";
import { contratoInterpretacion, type Interpretacion } from "../core/contracts/interpretacion";

export type CasoSintetico={id:number;texto:string};
export type ContextoSintetico={fecha:string;zona_horaria:string;personas_a_cargo:string[];integrantes:string[];autor:string;ambitos:string[];casos:CasoSintetico[]};

export const MODELOS_GEMINI = ["gemini-4-hydrogen","gemini-3.8-flash","gemini-3.5-flash-lite","gemma-4-26b-a4b-it"] as const;
export class ErrorGemini extends Error {
  constructor(public readonly estado:number){super("GEMINI_HTTP_"+estado);}
}
export class SinModelosDisponibles extends Error { constructor(){super("SIN_MODELOS_DISPONIBLES");} }
const contratoLote=z.strictObject({resultados:z.array(z.strictObject({id:z.number().int(),elementos:contratoInterpretacion.shape.elementos})).min(1).max(5)});
export type IntentoGemini={modelo:string;resultado:string;ms:number;motivo?:string;tokensEntrada?:number;tokensSalida?:number;tokensRazonamiento?:number;finishReason?:string};
export function crearGeminiSintetico({clave,modelo,corpus,respaldos=[],version="6.0",solicitar=fetch,observar=()=>{}}:{
  clave:string;modelo:string;corpus:ContextoSintetico;respaldos?:readonly string[];version?:"6.0"|"7.0";solicitar?:typeof fetch;observar?:(dato:IntentoGemini)=>void;
}){
  if(version!=="6.0"&&version!=="7.0")throw new Error("VERSION_PROMPT_INVALIDA");
  const esV7=version==="7.0";
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
  let internas=new Map<number,SalidaInterna>();
  let ajustes=new Map<number,AjusteInterpretacion[]>();
  async function evaluarGrupo(ids:readonly number[]):Promise<Map<number,Interpretacion>>{
    ultimoModelo=null;brutas=new Map();internas=new Map();ajustes=new Map();
    if(ids.length<1||ids.length>5||new Set(ids).size!==ids.length)throw new Error("LOTE_INVALIDO");
    const entradas=ids.map(id=>{const texto=casos.get(id);if(!texto)throw new Error("CASO_FUERA_DEL_CORPUS");return {id,texto};});
    const lote=ids.length>1;
    const instruccion=esV7?instruccionesCapturaV7+"\n"+(lote?sufijoLoteV7:sufijoIndividualV7):instruccionesCaptura+(lote?"\nCada entrada es completamente independiente. No compartas información entre entradas. Devuelve {resultados:[{id,elementos:[...]}]}, exactamente un resultado por id, sin omitir ni duplicar.":"\nDevuelve {elementos:[...]}.");
    const input=JSON.stringify(esV7?{contexto:{...contexto,calendario:calendarioContexto(contexto.fecha)},...(lote?{entradas}:{texto:entradas[0].texto})}:{contexto,entradas:lote?entradas:entradas[0]});
    if(orden.every(m=>suspendidos.has(m)))throw new SinModelosDisponibles();
    let ultimo:unknown=new SinModelosDisponibles();
    for(const elegido of orden){
      if(suspendidos.has(elegido))continue;
      const inicio=Date.now();
      let etapa="red";let finishReason:string|undefined;
      try{
    const esGemma=elegido==="gemma-4-26b-a4b-it";
    // Gemma recibe instrucciones de JSON como texto, no depende de responseMimeType.
    const schema=esV7?z.toJSONSchema(lote?contratoLoteInternoV7:contratoInternoV7):z.toJSONSchema(lote?contratoLote:contratoInterpretacion);
    const limite=esV7?{maxOutputTokens:lote?4096:1024}:{};
    const generationConfig=esGemma?{temperature:0,thinkingConfig:{thinkingLevel:"minimal"},...limite}:{responseMimeType:"application/json",responseJsonSchema:schema,temperature:0,...limite};
    const r=await solicitar("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(elegido)+":generateContent",{
      method:"POST",cache:"no-store",redirect:"error",
      headers:{"Content-Type":"application/json","x-goog-api-key":clave},
      body:JSON.stringify({...(esGemma?{}:{systemInstruction:{parts:[{text:instruccion}]}}),contents:[{parts:[{text:esGemma?instruccion+(esV7?"\nEsquema exacto: "+JSON.stringify(schema):"")+"\n"+input:input}]}],generationConfig}),
      signal:AbortSignal.timeout(lote?45000:20000),
    });
    if(!r.ok)throw new ErrorGemini(r.status);
    etapa="respuesta_http";
    const respuesta=await r.json() as {usageMetadata?:{promptTokenCount?:number;candidatesTokenCount?:number;thoughtsTokenCount?:number};candidates?:{finishReason?:string;content?:{parts?:{text?:string;thought?:boolean}[]}}[]};
    finishReason=respuesta.candidates?.[0]?.finishReason;
    if(esV7&&finishReason!=="STOP"){etapa="finish_reason";throw new Error("FINISH_REASON_NO_STOP");}
    const textoRespuesta=(respuesta.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text??"").join("")??"").trim();
    // Aceptar únicamente JSON completo, opcionalmente dentro de un único bloque Markdown.
    const bloque=esGemma?textoRespuesta.match(/^```(?:json)?\s*\n([\s\S]*?)\n?```$/i):null;
    etapa=textoRespuesta?"json":"sin_texto";
    if(!textoRespuesta)throw new Error("SIN_TEXTO");
    const objeto=JSON.parse(bloque?.[1]??textoRespuesta);
    etapa=esV7?"contrato_interno_v7":"contrato_zod";
    const salidas=new Map<number,Interpretacion>();
    const originales=new Map<number,Interpretacion>();
    if(esV7){
      const filas=lote?contratoLoteInternoV7.parse(objeto).resultados:[{id:ids[0],...contratoInternoV7.parse(objeto)}];
      if(filas.length!==ids.length||new Set(filas.map(f=>f.id)).size!==ids.length||filas.some(f=>!ids.includes(f.id))){etapa="lote_incompleto";throw new Error("LOTE_INCOMPLETO");}
      const internasLocales=new Map<number,SalidaInterna>();
      // Zod valida antes de guardar; el JSON original conserva orden y espacios de cadenas para auditoría.
      type InternaValidada=z.infer<typeof contratoInternoV7>;
      const filasOriginales=lote?(objeto as {resultados:({id:number}&InternaValidada)[]}).resultados:[{id:ids[0],...(objeto as InternaValidada)}];
      for(const f of filas){
        const interna={descartes:f.descartes,elementos:f.elementos};
        const original=filasOriginales.find(x=>x.id===f.id)!;
        internasLocales.set(f.id,structuredClone({descartes:original.descartes,elementos:original.elementos}));
        etapa="contrato_publico_v7";
        const bruta={elementos:original.elementos.map(e=>({tipo:e.tipo,titulo:e.titulo,persona_a_cargo:e.persona_a_cargo,ambito:e.ambito,plazo_fecha:e.plazo_fecha,plazo_hora:e.plazo_hora,recurrencia:e.recurrencia,dirigida_a:e.dirigida_a,confianza:e.confianza}))};
        contratoInterpretacion.parse(bruta);
        originales.set(f.id,bruta);
        const revisada=validarV7(interna,{fecha:contexto.fecha,texto:casos.get(f.id)!,personas:contexto.personas_a_cargo,integrantes:contexto.integrantes,ambitos:contexto.ambitos,autor:contexto.autor});
        salidas.set(f.id,contratoInterpretacion.parse(revisada.publica));ajustes.set(f.id,revisada.ajustes);
      }
      internas=internasLocales;
    }else{
    const filas=lote?contratoLote.parse(objeto).resultados:[{id:ids[0],...contratoInterpretacion.parse(objeto)}];
    if(filas.length!==ids.length||new Set(filas.map(f=>f.id)).size!==ids.length||filas.some(f=>!ids.includes(f.id)))throw new Error("LOTE_INCOMPLETO");
    for(const f of filas){
      const salida={elementos:f.elementos};
      originales.set(f.id,structuredClone(salida));
      const revisada=revisarInterpretacion(salida,{texto:casos.get(f.id)!,personas:contexto.personas_a_cargo,integrantes:contexto.integrantes,ambitos:contexto.ambitos,autor:contexto.autor});
      salidas.set(f.id,revisada.salida);ajustes.set(f.id,revisada.ajustes);
    }
    }
    brutas=originales;
    const u=respuesta.usageMetadata;
    const tokens=(n:unknown)=>typeof n==="number"&&Number.isSafeInteger(n)&&n>=0?n:undefined;
    observar({modelo:elegido,resultado:"valida",ms:Date.now()-inicio,tokensEntrada:tokens(u?.promptTokenCount),tokensSalida:tokens(u?.candidatesTokenCount),tokensRazonamiento:tokens(u?.thoughtsTokenCount),...(finishReason!==undefined?{finishReason}:{})});
    fallosTransitorios.delete(elegido);ultimoModelo=elegido;return salidas;
      }catch(error){
        ultimo=error;
        const motivo=error instanceof ErrorGemini?"HTTP "+error.estado:error instanceof Error&&["TimeoutError","AbortError"].includes(error.name)?"timeout":etapa;
        observar({modelo:elegido,resultado:"fallida",ms:Date.now()-inicio,motivo,...(finishReason!==undefined?{finishReason}:{})});
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
  return {version,brutaInterna:(id:number)=>internas.get(id),modeloUsado:()=>ultimoModelo,bruta:(id:number)=>brutas.get(id),ajustes:(id:number)=>ajustes.get(id)??[],evaluarLote:evaluarGrupo,async evaluar(id:number):Promise<Interpretacion>{return (await evaluarGrupo([id])).get(id)!;}};
}
