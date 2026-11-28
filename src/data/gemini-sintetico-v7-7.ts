// Adaptador del candidato 7.7 y selector explícito de versión (6.0 | 7.0 | 7.1 | 7.2 | 7.7; 6.0 por defecto).
// Copia de gemini-sintetico-v7-2.ts (intacto). Mismo contrato interno de 7.1. Selector anterior reutilizado sin cambios. Exclusivamente corpus sintético.
// No modifica gemini-sintetico.ts: V6 (predeterminada) y V7.0 conservan su solicitud byte a byte.
import { z } from "zod";
import { ErrorGemini, SinModelosDisponibles, MODELOS_GEMINI, type ContextoSintetico, type IntentoGemini } from "./gemini-sintetico";
import { instruccionesCapturaV75 as instruccionesCapturaV77, sufijoIndividualV75 as sufijoIndividualV77, sufijoLoteV75 as sufijoLoteV77 } from "./prompt-captura-v7-5";
import { contratoInternoV71 as contratoInternoV72, contratoLoteInternoV71 as contratoLoteInternoV72, type SalidaInternaV71 as SalidaInternaV72 } from "../core/contracts/interpretacion-interna-v7-1";
import {crearGeminiPorVersion as crearHasta76} from "./gemini-sintetico-v7-6";
import { calendarioContextoV74 as calendarioContextoV77, type AjusteV74 as AjusteV77 } from "../core/usecases/validar-interpretacion-v7-4";
import {validarV77} from "../core/usecases/validar-interpretacion-v7-7";
import { contratoInterpretacion, type Interpretacion } from "../core/contracts/interpretacion";

export type VersionCaptura = "6.0" | "7.0" | "7.1" | "7.2" | "7.3" | "7.4" | "7.5" | "7.6" | "7.7";
export type ContextoV77 = ContextoSintetico & {tipos_persona?: Record<string,"hijo"|"mascota"|"hogar">};
export const VERSION_PREDETERMINADA: VersionCaptura = "6.0";

export function solicitudV77(corpus: ContextoV77, entradas: { id: number; texto: string }[]) {
  const lote = entradas.length > 1;
  const contexto = { fecha: corpus.fecha, zona_horaria: corpus.zona_horaria, personas_a_cargo: corpus.personas_a_cargo, integrantes: corpus.integrantes, autor: corpus.autor, ambitos: corpus.ambitos };
  const instruccion = instruccionesCapturaV77 + "\n" + (lote ? sufijoLoteV77 : sufijoIndividualV77);
  const tipos=corpus.tipos_persona;
  if(tipos && (Object.keys(tipos).length!==corpus.personas_a_cargo.length || Object.entries(tipos).some(([n,t])=>!corpus.personas_a_cargo.includes(n)||!["hijo","mascota","hogar"].includes(t))))throw new Error("TIPOS_SINTETICOS_INVALIDOS");
  const input = JSON.stringify({ contexto: { ...contexto, ...(tipos?{tipos_persona:tipos}:{}), calendario: calendarioContextoV77(contexto.fecha) }, ...(lote ? { entradas } : { texto: entradas[0].texto }) });
  const schema = z.toJSONSchema(lote ? contratoLoteInternoV72 : contratoInternoV72);
  return {
    contexto,
    cuerpo: {
      systemInstruction: { parts: [{ text: instruccion }] },
      contents: [{ parts: [{ text: input }] }],
      generationConfig: { responseMimeType: "application/json", responseJsonSchema: schema, temperature: 0, maxOutputTokens: lote ? 4096 : 1024 },
    },
  };
}

function crearV77({ clave, modelo, corpus, solicitar = fetch, observar = () => {} }: { clave: string; modelo: string; corpus: ContextoV77; solicitar?: typeof fetch; observar?: (d: IntentoGemini) => void }) {
  if (typeof window !== "undefined") throw new Error("SOLO_SERVIDOR");
  // Gemma no participa en 7.7: requiere esquema por texto y no forma parte del A/B.
  if (!clave || !MODELOS_GEMINI.some(m => m === modelo) || modelo.startsWith("gemma")) throw new Error("CONFIGURACION_GEMINI_INVALIDA");
  const casos = new Map(corpus.casos.map(c => [c.id, c.texto]));
  let suspendido = false; let ultimoModelo: string | null = null;
  let brutas = new Map<number, Interpretacion>(), internas = new Map<number, SalidaInternaV72>(), ajustes = new Map<number, AjusteV77[]>();
  async function evaluarGrupo(ids: readonly number[]): Promise<Map<number, Interpretacion>> {
    ultimoModelo = null; brutas = new Map(); internas = new Map(); ajustes = new Map();
    if (ids.length < 1 || ids.length > 5 || new Set(ids).size !== ids.length) throw new Error("LOTE_INVALIDO");
    const entradas = ids.map(id => { const texto = casos.get(id); if (!texto) throw new Error("CASO_FUERA_DEL_CORPUS"); return { id, texto }; });
    if (suspendido) throw new SinModelosDisponibles();
    const { contexto, cuerpo } = solicitudV77(corpus, entradas);
    const lote = ids.length > 1, inicio = Date.now();
    let etapa = "red"; let finishReason: string | undefined;
    try {
      const r = await solicitar("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelo) + ":generateContent", {
        method: "POST", cache: "no-store", redirect: "error",
        headers: { "Content-Type": "application/json", "x-goog-api-key": clave },
        body: JSON.stringify(cuerpo), signal: AbortSignal.timeout(lote ? 45000 : 20000),
      });
      if (!r.ok) throw new ErrorGemini(r.status);
      etapa = "respuesta_http";
      const respuesta = await r.json() as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number }; candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
      finishReason = respuesta.candidates?.[0]?.finishReason;
      if (finishReason !== "STOP") { etapa = "finish_reason"; throw new Error("FINISH_REASON_NO_STOP"); }
      const texto = (respuesta.candidates?.[0]?.content?.parts?.filter(p => !p.thought).map(p => p.text ?? "").join("") ?? "").trim();
      etapa = texto ? "json" : "sin_texto"; if (!texto) throw new Error("SIN_TEXTO");
      const objeto = JSON.parse(texto);
      etapa = "contrato_interno_v72";
      const filas = lote ? contratoLoteInternoV72.parse(objeto).resultados : [{ id: ids[0], ...contratoInternoV72.parse(objeto) }];
      if (filas.length !== ids.length || new Set(filas.map(f => f.id)).size !== ids.length || filas.some(f => !ids.includes(f.id))) { etapa = "lote_incompleto"; throw new Error("LOTE_INCOMPLETO"); }
      const salidas = new Map<number, Interpretacion>(), b = new Map<number, Interpretacion>(), n = new Map<number, SalidaInternaV72>(), a = new Map<number, AjusteV77[]>();
      for (const f of filas) {
        const interna: SalidaInternaV72 = { descartes: f.descartes, elementos: f.elementos };
        const original = (lote ? (objeto as {resultados:({id:number}&SalidaInternaV72)[]}).resultados.find(x=>x.id===f.id)! : objeto as SalidaInternaV72);
        n.set(f.id, structuredClone({descartes:original.descartes,elementos:original.elementos}));
        etapa = "contrato_publico_v72";
        const bruta = { elementos: original.elementos.map(e => ({ tipo: e.tipo, titulo: e.titulo, persona_a_cargo: e.persona_a_cargo, ambito: e.ambito, plazo_fecha: e.plazo_fecha, plazo_hora: e.plazo_hora, recurrencia: e.recurrencia, dirigida_a: e.dirigida_a, confianza: e.confianza })) };
        contratoInterpretacion.parse(bruta); b.set(f.id, bruta);
        const revisada = validarV77(interna, { fecha: contexto.fecha, texto: casos.get(f.id)!, personas: contexto.personas_a_cargo, integrantes: contexto.integrantes, ambitos: contexto.ambitos, autor: contexto.autor });
        salidas.set(f.id, contratoInterpretacion.parse(revisada.publica)); a.set(f.id, revisada.ajustes);
      }
      brutas = b; internas = n; ajustes = a;
      const u = respuesta.usageMetadata, tk = (x: unknown) => typeof x === "number" && Number.isSafeInteger(x) && x >= 0 ? x : undefined;
      observar({ modelo, resultado: "valida", ms: Date.now() - inicio, tokensEntrada: tk(u?.promptTokenCount), tokensSalida: tk(u?.candidatesTokenCount), tokensRazonamiento: tk(u?.thoughtsTokenCount), finishReason });
      ultimoModelo = modelo; return salidas;
    } catch (error) {
      const motivo = error instanceof ErrorGemini ? "HTTP " + error.estado : error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name) ? "timeout" : etapa;
      observar({ modelo, resultado: "fallida", ms: Date.now() - inicio, motivo, ...(finishReason !== undefined ? { finishReason } : {}) });
      if (error instanceof ErrorGemini && [404, 429].includes(error.estado)) suspendido = true;
      throw error;
    }
  }
  return { version: "7.7" as const, brutaInterna: (id: number) => internas.get(id), modeloUsado: () => ultimoModelo, bruta: (id: number) => brutas.get(id), ajustes: (id: number) => ajustes.get(id) ?? [], evaluarLote: evaluarGrupo, async evaluar(id: number) { return (await evaluarGrupo([id])).get(id)!; } };
}

// Selector explícito. Sin versión → 6.0. Cualquier otro valor se rechaza.
export function crearGeminiPorVersion(o: { clave: string; modelo: string; corpus: ContextoV77; respaldos?: readonly string[]; version?: VersionCaptura; solicitar?: typeof fetch; observar?: (d: IntentoGemini) => void }) {
  const version = o.version ?? VERSION_PREDETERMINADA;
  if (version === "7.7") { if (o.respaldos?.length) throw new Error("RESPALDOS_NO_PERMITIDOS_7_7"); return crearV77(o); }
  if (version === "6.0" || version === "7.0" || version === "7.1" || version === "7.2" || version === "7.3" || version === "7.4" || version === "7.5" || version === "7.6") return crearHasta76({ ...o, version });
  throw new Error("VERSION_PROMPT_INVALIDA");
}
