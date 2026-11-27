// Evaluador pareado V6 (control) vs 7.2 (candidato). Nuevo archivo: comparacion-v7.ts queda intacto.
// Cambios auditados frente al evaluador 7.0:
// - orden de brazos por caso con mezcla balanceada y reproducible (semilla → Fisher-Yates sobre 50/50 órdenes),
//   en vez de alternar paridad (la semilla antes solo invertía la paridad);
// - alerta automática de invención (fecha sin ningún marcador temporal en el texto, nombre no mencionado,
//   número de título ausente del texto) que detiene la corrida; la confirmación sigue siendo humana;
// - modo «desarrollo» sin puertas de aceptación (cobertura completa salvo 429), nunca usado como aceptación;
// - registro por solicitud de finishReason, tokens y latencia (ya presente en IntentoGemini).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { ErrorGemini, SinModelosDisponibles, type IntentoGemini } from "../src/data/gemini-sintetico";
import { crearGeminiPorVersion, type ContextoV72 } from "../src/data/gemini-sintetico-v7-2";
import { instruccionesCaptura } from "../src/data/prompt-captura";
import { instruccionesCapturaV72, sufijoIndividualV72, sufijoLoteV72 } from "../src/data/prompt-captura-v7-2";
import { contratoInternoV71 as contratoInternoV72, contratoLoteInternoV71 as contratoLoteInternoV72 } from "../src/core/contracts/interpretacion-interna-v7-1";
import type { Interpretacion } from "../src/core/contracts/interpretacion";
import { auditarAcciones } from "./auditar-acciones";

export type VersionAB = "6.0" | "7.2";
export type CasoEvaluable = { id: number; texto: string; esperado: Interpretacion };
export type CorpusEvaluable = Omit<ContextoV72, "casos"> & { casos: CasoEvaluable[] };
export const MODELO_AB = "gemini-3.5-flash-lite";
const sha = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");

export function huellasV72() {
  return {
    "6.0": { instruccion: sha(instruccionesCaptura), validador: sha(readFileSync("src/core/usecases/revisar-interpretacion.ts")) },
    "7.2": {
      instruccion: sha(instruccionesCapturaV72), individual: sha(sufijoIndividualV72), lote: sha(sufijoLoteV72),
      esquema: sha(JSON.stringify(z.toJSONSchema(contratoInternoV72))), esquemaLote: sha(JSON.stringify(z.toJSONSchema(contratoLoteInternoV72))),
      validador: sha(readFileSync("src/core/usecases/validar-interpretacion-v7-2.ts")),
      validadorBase70: sha(readFileSync("src/core/usecases/validar-interpretacion-v7.ts")),
      adaptador: sha(readFileSync("src/data/gemini-sintetico-v7-2.ts")),
    },
  };
}

const campos = ["tipo", "persona_a_cargo", "ambito", "plazo_fecha", "plazo_hora", "recurrencia", "dirigida_a"] as const;
const principales = ["persona_a_cargo", "ambito", "plazo_fecha", "plazo_hora"] as const;
type Elemento = Interpretacion["elementos"][number];
const firma = (e: Elemento, ks: readonly (typeof campos[number])[]) => JSON.stringify(ks.map(k => k === "recurrencia" && e.recurrencia ? { ...e.recurrencia, dias: [...e.recurrencia.dias].sort() } : e[k]));
const igual = (a: Interpretacion, b: Interpretacion, ks: readonly (typeof campos[number])[]) => JSON.stringify(a.elementos.map(e => firma(e, ks)).sort()) === JSON.stringify(b.elementos.map(e => firma(e, ks)).sort());

export function capa(a: Interpretacion, e: Interpretacion) {
  const audit = auditarAcciones(a, e); const porCampo: Record<string, number> = {};
  let accionesConDiscrepancia = audit.omitidas + audit.extras;
  for (const p of audit.pares) { const dif = [...p.campos]; if (a.elementos[p.actual].tipo !== e.elementos[p.esperado].tipo) { porCampo.tipo = (porCampo.tipo ?? 0) + 1; accionesConDiscrepancia++; } else if (dif.length) accionesConDiscrepancia++; for (const k of dif) porCampo[k] = (porCampo[k] ?? 0) + 1; }
  let discrepanciasGlobales = 0;
  for (const el of a.elementos) for (const k of ["persona_a_cargo", "ambito", "dirigida_a", "plazo_fecha", "plazo_hora"] as const) if (el[k] !== null && !e.elementos.some(x => x[k] === el[k])) discrepanciasGlobales++;
  return { principal: igual(a, e, principales), estricta: igual(a, e, campos), audit, porCampo, accionesConDiscrepancia, discrepanciasGlobales };
}

const sinTilde = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const MARCA_TEMPORAL = /\b(hoy|manana|pasado|ayer|tiro|lunes|martes|miercoles|jueves|viernes|sabado|domingo|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|semana|mes|dias?|antes|vence|hasta|\d{1,2})\b|\ba las?\b/;
// Alerta automática (no confirmación): datos de la salida normalizada sin ningún apoyo posible en el texto.
export function alertasInvencion(texto: string, salida: Interpretacion, personas: readonly string[], integrantes: readonly string[]) {
  const t = sinTilde(texto), alertas: string[] = [];
  const nombrado = (n: string) => new RegExp("(^|[^\\p{L}])" + sinTilde(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^\\p{L}])", "u").test(t);
  salida.elementos.forEach((e, i) => {
    if ((e.plazo_fecha || e.plazo_hora) && !MARCA_TEMPORAL.test(t)) alertas.push(i + ":plazo_sin_marcador");
    if (e.persona_a_cargo && e.persona_a_cargo !== "El hogar" && (!personas.includes(e.persona_a_cargo) || !nombrado(e.persona_a_cargo))) alertas.push(i + ":persona_no_mencionada");
    if (e.dirigida_a && (!integrantes.includes(e.dirigida_a) || !nombrado(e.dirigida_a))) alertas.push(i + ":destinatario_no_mencionado");
    const numeros = new Set(t.replace(/(\d)[.\s](?=\d{3}\b)/g, "$1").match(/\d+/g) ?? []);
    for (const n of sinTilde(e.titulo).replace(/(\d)[.\s](?=\d{3}\b)/g, "$1").match(/\d+/g) ?? []) if (!numeros.has(n)) alertas.push(i + ":numero_no_respaldado");
  });
  return alertas;
}

// PRNG reproducible (mulberry32) y mezcla balanceada: mitad de los casos con control primero.
function mulberry32(a: number) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function ordenesBalanceados(n: number, semilla: number): boolean[] { // true = control (6.0) primero
  const r = mulberry32(semilla), o = Array.from({ length: n }, (_, i) => i < Math.ceil(n / 2));
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}

type Metricas = { bruta: ReturnType<typeof capa>; normalizada: ReturnType<typeof capa> };
type Detalle = { id: number; version: VersionAB; estado: "no_ejecutada" | "fallida" | "valida"; causa?: string; brutaInterna?: unknown; bruta?: Interpretacion; resultado?: Interpretacion; ajustes?: { indice: number; campo: string; motivo: string }[]; metricas?: Metricas; alertas?: string[] };
type Solicitud = { version: VersionAB; id: number; intento: IntentoGemini; repeticion?: boolean };

function resumenBrazo(det: Detalle[], solicitudes: Solicitud[]) {
  const validas = det.filter(x => x.estado === "valida"), fallidas = det.filter(x => x.estado === "fallida");
  const s = { principalBruta: 0, estrictaBruta: 0, principalNormalizada: 0, estrictaNormalizada: 0, porAccionBruta: 0, porAccion: 0, camposBrutosDiscrepantes: 0, camposInventados: 0, omitidasBrutas: 0, extrasBrutas: 0, omitidasNormalizadas: 0, extrasNormalizadas: 0, porCampoBruta: {} as Record<string, number>, porCampoNormalizada: {} as Record<string, number>, ajustesPorMotivo: {} as Record<string, number>, casosCorregidos: [] as number[], casosEmpeorados: [] as number[], alertas: [] as string[], fallosPorCausa: {} as Record<string, number>, finishReason: {} as Record<string, number>, totalElementos: 0, porRevisar: 0 };
  const sum = (d: Record<string, number>, x: Record<string, number>) => { for (const [k, v] of Object.entries(x)) d[k] = (d[k] ?? 0) + v; };
  for (const d of validas) {
    const { bruta: b, normalizada: n } = d.metricas!;
    s.principalBruta += +b.principal; s.estrictaBruta += +b.estricta; s.principalNormalizada += +n.principal; s.estrictaNormalizada += +n.estricta;
    s.porAccionBruta += b.audit.discrepancias; s.porAccion += n.audit.discrepancias; s.camposBrutosDiscrepantes += b.discrepanciasGlobales; s.camposInventados += n.discrepanciasGlobales;
    s.omitidasBrutas += b.audit.omitidas; s.extrasBrutas += b.audit.extras; s.omitidasNormalizadas += n.audit.omitidas; s.extrasNormalizadas += n.audit.extras;
    sum(s.porCampoBruta, b.porCampo); sum(s.porCampoNormalizada, n.porCampo);
    for (const a of d.ajustes ?? []) s.ajustesPorMotivo[a.motivo] = (s.ajustesPorMotivo[a.motivo] ?? 0) + 1;
    if ((!b.principal && n.principal) || (!b.estricta && n.estricta)) s.casosCorregidos.push(d.id);
    if ((b.principal && !n.principal) || (b.estricta && !n.estricta)) s.casosEmpeorados.push(d.id);
    for (const a of d.alertas ?? []) s.alertas.push(d.id + ":" + a);
    for (const e of d.resultado!.elementos) { s.totalElementos++; if (e.confianza === "baja" || e.persona_a_cargo === null || e.ambito === null) s.porRevisar++; }
  }
  for (const q of solicitudes) { if (q.intento.resultado !== "valida") s.fallosPorCausa[q.intento.motivo ?? "desconocida"] = (s.fallosPorCausa[q.intento.motivo ?? "desconocida"] ?? 0) + 1; if (q.intento.finishReason) s.finishReason[q.intento.finishReason] = (s.finishReason[q.intento.finishReason] ?? 0) + 1; }
  const lat = solicitudes.filter(x => x.intento.resultado === "valida").map(x => x.intento.ms).sort((a, b) => a - b);
  const consumo = { entrada: 0, salida: 0, razonamiento: 0, sinMedicion: 0 };
  for (const q of solicitudes) { const i = q.intento; if (i.tokensEntrada === undefined || i.tokensSalida === undefined) consumo.sinMedicion++; consumo.entrada += i.tokensEntrada ?? 0; consumo.salida += i.tokensSalida ?? 0; consumo.razonamiento += i.tokensRazonamiento ?? 0; }
  return { ...s, total: det.length, validas: validas.length, fallidas: fallidas.length, noEjecutadas: det.length - validas.length - fallidas.length, tasaPorRevisar: s.totalElementos ? s.porRevisar / s.totalElementos : null, solicitudes: solicitudes.length, consumo, medianaMs: lat.length ? (lat[Math.floor((lat.length - 1) / 2)] + lat[Math.floor(lat.length / 2)]) / 2 : null, p95Ms: lat.length ? lat[Math.ceil(lat.length * .95) - 1] : null };
}

export async function ejecutarComparacionV72({ clave, corpus, modo = "aceptacion", semilla = 20261128, solicitar, esperar = ms => new Promise<void>(r => setTimeout(r, ms)), registrar = () => {} }: {
  clave: string; corpus: CorpusEvaluable; modo?: "aceptacion" | "desarrollo"; semilla?: number; solicitar?: typeof fetch; esperar?: (ms: number) => Promise<void>; registrar?: (linea: string) => void;
}) {
  if (!Number.isSafeInteger(semilla) || (modo !== "aceptacion" && modo !== "desarrollo")) throw new Error("CONFIG_AB_INVALIDA");
  if (new Set(corpus.casos.map(c => c.id)).size !== corpus.casos.length) throw new Error("CORPUS_AB_INVALIDO");
  const versiones: VersionAB[] = ["6.0", "7.2"];
  const detalle: Detalle[] = versiones.flatMap(version => corpus.casos.map(c => ({ id: c.id, version, estado: "no_ejecutada" as const })));
  const solicitudes: Solicitud[] = []; let idActual = 0; let primera = true; let repitiendo=false;
  const repeticiones:{id:number;detalle:Detalle[];clasificacion:string}[]=[];
  const ia = new Map(versiones.map(version => [version, crearGeminiPorVersion({ clave, modelo: MODELO_AB, version, corpus, solicitar, observar: intento => solicitudes.push({ version, id: idActual, intento, ...(repitiendo?{repeticion:true}:{}) }) })]));
  const registro = (id: number, v: VersionAB) => detalle.find(d => d.id === id && d.version === v)!;
  const ordenes = ordenesBalanceados(corpus.casos.length, semilla);
  let parada: { motivo: string; version?: VersionAB; id: number } | null = null;
  externo: for (const [k, caso] of corpus.casos.entries()) {
    idActual = caso.id;
    for (const version of ordenes[k] ? versiones : [...versiones].reverse()) {
      const a = ia.get(version)!; const antes = solicitudes.length;
      for (let intento = 0; intento < 2; intento++) {
        if (!primera) await esperar(4500); primera = false;
        try {
          const resultado = (await a.evaluarLote([caso.id])).get(caso.id)!, bruta = a.bruta(caso.id)!;
          Object.assign(registro(caso.id, version), { estado: "valida", brutaInterna: a.brutaInterna(caso.id), bruta, resultado, ajustes: a.ajustes(caso.id), metricas: { bruta: capa(bruta, caso.esperado), normalizada: capa(resultado, caso.esperado) }, alertas: [...alertasInvencion(caso.texto, bruta, corpus.personas_a_cargo, corpus.integrantes).map(x=>"bruta:"+x),...alertasInvencion(caso.texto, resultado, corpus.personas_a_cargo, corpus.integrantes).map(x=>"normalizada:"+x)] });
          break;
        } catch (error) {
          const ultimo = solicitudes.length > antes ? solicitudes.at(-1)?.intento : undefined;
          const causa = error instanceof ErrorGemini ? "HTTP " + error.estado : ultimo?.motivo ?? (error instanceof SinModelosDisponibles ? "sin_modelos" : "sin_salida_valida");
          if (intento === 0 && (causa === "HTTP 503" || causa === "timeout")) continue;
          Object.assign(registro(caso.id, version), { estado: "fallida", causa });
          if (causa === "HTTP 429" || modo === "aceptacion" || version === "7.2") { parada = { motivo: causa === "HTTP 429" ? "cuota_429" : "cobertura_incompleta:" + causa, version, id: caso.id }; break externo; }
          break;
        }
      }
    }
    const c6 = registro(caso.id, "6.0"), c7 = registro(caso.id, "7.2");
    const marca = (d: Detalle) => d.metricas ? `${+d.metricas.bruta.principal}${+d.metricas.bruta.estricta}/${+d.metricas.normalizada.principal}${+d.metricas.normalizada.estricta}` : d.estado;
    registrar(`caso ${caso.id} · 6.0 ${marca(c6)} · 7.2 ${marca(c7)}${c7.alertas?.length ? " · alertas " + c7.alertas.join(",") : ""}`);
    if(modo==="desarrollo" && (c7.alertas?.length||c6.alertas?.length)){parada={motivo:"alerta_invencion",version:c7.alertas?.length?"7.2":"6.0",id:caso.id};break;}
    if (modo === "aceptacion" && c6.metricas && c7.metricas) {
      const a = c6.metricas, b = c7.metricas;
      const regresion = (["bruta", "normalizada"] as const).some(k => (["principal", "estricta"] as const).some(m => a[k][m] && !b[k][m]));
      const empeora = (b.bruta.estricta && !b.normalizada.estricta) || (b.bruta.principal && !b.normalizada.principal);
      if (empeora || c7.alertas?.length || c6.alertas?.length) {
        parada={motivo:empeora?"validador_empeora":"alerta_invencion",version:empeora||c7.alertas?.length?"7.2":"6.0",id:caso.id};break;
      }
      if(regresion){
        // D-19: pausa el examen, una repetición diagnóstica por brazo, sin sustituir el resultado inicial.
        repitiendo=true;
        const repetidos:Detalle[]=[];
        for(const version of ordenes[k]?[...versiones].reverse():versiones){
          const adapter=ia.get(version)!;
          await esperar(4500);
          try {
            const resultado=await adapter.evaluar(caso.id),bruta=adapter.bruta(caso.id)!;
            const alertas=[...alertasInvencion(caso.texto,bruta,corpus.personas_a_cargo,corpus.integrantes).map(x=>"bruta:"+x),...alertasInvencion(caso.texto,resultado,corpus.personas_a_cargo,corpus.integrantes).map(x=>"normalizada:"+x)];
            repetidos.push({id:caso.id,version,estado:"valida",brutaInterna:adapter.brutaInterna(caso.id),bruta,resultado,ajustes:adapter.ajustes(caso.id),metricas:{bruta:capa(bruta,caso.esperado),normalizada:capa(resultado,caso.esperado)},alertas});
            if(alertas.length){parada={motivo:"alerta_invencion_en_repeticion",version,id:caso.id};break;}
          }catch(error){
            const causa=error instanceof ErrorGemini?"HTTP "+error.estado:solicitudes.at(-1)?.intento.motivo??"sin_salida_valida";
            repetidos.push({id:caso.id,version,estado:"fallida",causa});
            parada={motivo:causa==="HTTP 429"?"cuota_429":"cobertura_incompleta_repeticion:"+causa,version,id:caso.id};break;
          }
        }
        const ra=repetidos.find(d=>d.version==="6.0")?.metricas,rb=repetidos.find(d=>d.version==="7.2")?.metricas;
        const reproduce=ra&&rb&&(["bruta","normalizada"] as const).some(k=>(["principal","estricta"] as const).some(m=>ra[k][m]&&!rb[k][m]));
        const clasificacion=parada?"repeticion_interrumpida":reproduce?"regresion_reproducida":"regresion_no_reproducida";
        repeticiones.push({id:caso.id,detalle:repetidos,clasificacion});
        parada=parada??{motivo:clasificacion,version:"7.2",id:caso.id};
        repitiendo=false;break;
      }
    }
  }
  const brazos = { "6.0": resumenBrazo(detalle.filter(d => d.version === "6.0"), solicitudes.filter(q => q.version === "6.0"&&!q.repeticion)), "7.2": resumenBrazo(detalle.filter(d => d.version === "7.2"), solicitudes.filter(q => q.version === "7.2"&&!q.repeticion)) };
  const pares = corpus.casos.flatMap(c => { const a = registro(c.id, "6.0"), b = registro(c.id, "7.2"); return a.metricas && b.metricas ? [{ id: c.id, v6: { bruta: [a.metricas.bruta.principal, a.metricas.bruta.estricta], normalizada: [a.metricas.normalizada.principal, a.metricas.normalizada.estricta] }, v72: { bruta: [b.metricas.bruta.principal, b.metricas.bruta.estricta], normalizada: [b.metricas.normalizada.principal, b.metricas.normalizada.estricta] } }] : []; });
  return { resumen: { modo, semilla, modelo: MODELO_AB, respaldos: [], versiones, huellas: huellasV72(), parada, brazos, paresCompletos: pares.length, comparacionCompleta: pares.length === corpus.casos.length, revisionManual: "Pendiente; discrepancia no equivale a invención; alertas automáticas no son confirmación." }, detalle, solicitudes, pares, repeticiones };
}
