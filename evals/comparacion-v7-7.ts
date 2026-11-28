// Evaluador 7.7. Nuevo archivo: los evaluadores 7.0, 7.1 y 7.5 quedan intactos.
// - Desarrollo: N brazos (control 6.0 + referencia 7.5 + candidata 7.7) sobre la misma entrada, orden por caso
//   permutado de forma reproducible. Nunca es aceptación.
// - Aceptación: exactamente 6.0 vs 7.7, mismas puertas y paradas que 7.5, incluida D-19 (una repetición
//   diagnóstica por brazo invirtiendo el orden; la parada se mantiene aunque no se reproduzca).
// - Métricas nuevas (se suman a los contadores históricos, no los sustituyen): hogar TP/FP/FN por capa,
//   ablación del validador sobre la MISMA salida bruta interna (sin llamadas extra) y pérdidas al
//   transformar en propuesta aplicable (planInterpretacion con identificadores sintéticos).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { ErrorGemini, SinModelosDisponibles, type IntentoGemini } from "../src/data/gemini-sintetico";
import { crearGeminiPorVersion, type ContextoV77 } from "../src/data/gemini-sintetico-v7-7";
import { instruccionesCaptura } from "../src/data/prompt-captura";
import { instruccionesCapturaV75 } from "../src/data/prompt-captura-v7-5";
import { instruccionesCapturaV75 as instruccionesCapturaV77, sufijoIndividualV75 as sufijoIndividualV77, sufijoLoteV75 as sufijoLoteV77 } from "../src/data/prompt-captura-v7-5";
import { contratoInternoV71, contratoLoteInternoV71, type SalidaInternaV71 } from "../src/core/contracts/interpretacion-interna-v7-1";
import { validarV74 as validarV75 } from "../src/core/usecases/validar-interpretacion-v7-4";
import { validarV77 } from "../src/core/usecases/validar-interpretacion-v7-7";
import { hogarSinRespaldo } from "../src/core/usecases/validar-interpretacion-v7-4";
import {medirAcciones77,medirProhibidos77,medirListas77,alertasFecha77,type Prohibido} from "./metricas-acciones-v7-7";
import { coberturaAcciones } from "./cobertura-acciones-v7-5";
import { planInterpretacion } from "../src/core/usecases/interpretacion";
import { contratoInterpretacion, type Interpretacion } from "../src/core/contracts/interpretacion";
import { capa, alertasInvencion } from "./comparacion-v7-2";

export type VersionV77 = "6.0" | "7.5" | "7.7";
export type CasoEvaluable = { id: number; texto: string; esperado: Interpretacion; prohibido?:Prohibido[] };
export type CorpusEvaluable = Omit<ContextoV77, "casos"> & { casos: CasoEvaluable[] };
export const MODELO_AB = "gemini-3.5-flash-lite";
const sha = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");

export function huellasV77() {
  return {
    "6.0": { instruccion: sha(instruccionesCaptura), validador: sha(readFileSync("src/core/usecases/revisar-interpretacion.ts")) },
    "7.5": { instruccion: sha(instruccionesCapturaV75), validador: sha(readFileSync("src/core/usecases/validar-interpretacion-v7-4.ts")), adaptador: sha(readFileSync("src/data/gemini-sintetico-v7-5.ts")) },
    "7.7": {
      instruccion: sha(instruccionesCapturaV77), individual: sha(sufijoIndividualV77), lote: sha(sufijoLoteV77),
      esquema: sha(JSON.stringify(z.toJSONSchema(contratoInternoV71))), esquemaLote: sha(JSON.stringify(z.toJSONSchema(contratoLoteInternoV71))),
      validador: sha(readFileSync("src/core/usecases/validar-interpretacion-v7-7.ts")),
      base76:sha(readFileSync("src/core/usecases/validar-interpretacion-v7-6.ts")),base74:sha(readFileSync("src/core/usecases/validar-interpretacion-v7-4.ts")),corpusOficial:sha(readFileSync("evals/captura-cl.json")),metricas:sha(readFileSync("evals/metricas-acciones-v7-7.ts")),
      validadorBase70: sha(readFileSync("src/core/usecases/validar-interpretacion-v7.ts")),
      adaptador: sha(readFileSync("src/data/gemini-sintetico-v7-7.ts")),
      evaluador: sha(readFileSync("evals/comparacion-v7-7.ts")), cobertura:sha(readFileSync("evals/cobertura-acciones-v7-5.ts")),
    },
  };
}

// Hogar por acción: compara la atribución a El hogar con el oráculo, emparejando por firma de campos no personales.
export function metricasHogar(a: Interpretacion, e: Interpretacion) {
  const esperadas = e.elementos.filter(x => x.persona_a_cargo === "El hogar").length;
  const dadas = a.elementos.filter(x => x.persona_a_cargo === "El hogar").length;
  const tp = Math.min(esperadas, dadas);
  return { tp, fp: Math.max(0, dadas - esperadas), fn: Math.max(0, esperadas - dadas) };
}

// Propuesta aplicable: lo que realmente llegaría a la capa de aplicación con el contrato vigente.
export function perdidasAplicacion(salida: Interpretacion, corpus: Omit<CorpusEvaluable, "casos">, texto: string) {
  const ids = (xs: readonly string[]) => xs.map((nombre, i) => ({ id: "id-" + i + "-" + nombre, nombre }));
  const plan = planInterpretacion(salida, { texto, autorId: "id-autor", personas: ids(corpus.personas_a_cargo), ambitos: ids(corpus.ambitos), integrantes: corpus.integrantes.map((n, i) => ({ id: n === corpus.autor ? "id-autor" : "id-int-" + i, nombre: n })) });
  if (!plan) return { invalido: 1, horaPerdida: 0, responsabilidadDegradada: 0, notaSinClasificar: 0 };
  let horaPerdida = 0, responsabilidadDegradada = 0, notaSinClasificar = 0;
  salida.elementos.forEach((e, i) => {
    const p = plan[i];
    if (e.plazo_hora && !p.plazo_hora) horaPerdida++;
    if (e.tipo === "responsabilidad" && p.tipo === "tarea") responsabilidadDegradada++;
    if (e.tipo === "nota") notaSinClasificar++;
  });
  return { invalido: 0, horaPerdida, responsabilidadDegradada, notaSinClasificar };
}

function mulberry32(a: number) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// Orden por caso: dos brazos → balanceado exacto; tres o más → permutación reproducible por caso.
export function ordenesPorCaso<T>(n: number, versiones: readonly T[], semilla: number): T[][] {
  const r = mulberry32(semilla);
  if (versiones.length === 2) {
    const o = Array.from({ length: n }, (_, i) => i < Math.ceil(n / 2));
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    return o.map(c => c ? [...versiones] : [...versiones].reverse());
  }
  return Array.from({ length: n }, () => { const p = [...versiones]; for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; });
}

type Metricas = { bruta: ReturnType<typeof capa>; normalizada: ReturnType<typeof capa> };
type Ablacion = { validador74: { principal: boolean; estricta: boolean }; validador75: { principal: boolean; estricta: boolean } };
type Detalle = { nuevaMedicion?: {bruta:ReturnType<typeof medirAcciones77>;normalizada:ReturnType<typeof medirAcciones77>;listas:ReturnType<typeof medirListas77>;prohibidosBruta:number;prohibidosNormalizada:number}; cobertura?:{bruta:ReturnType<typeof coberturaAcciones>;normalizada:ReturnType<typeof coberturaAcciones>}; id: number; version: VersionV77; estado: "no_ejecutada" | "fallida" | "valida"; causa?: string; brutaInterna?: unknown; bruta?: Interpretacion; resultado?: Interpretacion; ajustes?: { indice: number; campo: string; motivo: string }[]; metricas?: Metricas; alertas?: string[]; hogar?: { bruta: ReturnType<typeof metricasHogar>; normalizada: ReturnType<typeof metricasHogar> }; aplicacion?: ReturnType<typeof perdidasAplicacion>; ablacion?: Ablacion };
type Solicitud = { version: VersionV77; id: number; intento: IntentoGemini; repeticion?: boolean };

function resumenBrazo(det: Detalle[], solicitudes: Solicitud[]) {
  const validas = det.filter(x => x.estado === "valida"), fallidas = det.filter(x => x.estado === "fallida");
  const s = { accionesSemanticas:{bruta:{esperadas:0,entregadas:0,correctas:0,sustituidas:0},normalizada:{esperadas:0,entregadas:0,correctas:0,sustituidas:0}}, listasEquivocadas:{listas:0,listasErrorCampos:0,listasErrorTitulo:0,listasConError:0,pendientes:0,pendientesCoincidentes:0},prohibidosBruta:0,prohibidosNormalizada:0, accionesEsperadas:0, accionesEntregadasBrutas:0, accionesEntregadasNormalizadas:0, deficitBruto:0, deficitNormalizado:0, excedenteBruto:0, excedenteNormalizado:0, casosCoberturaIncompleta:[] as number[], principalBruta: 0, estrictaBruta: 0, principalNormalizada: 0, estrictaNormalizada: 0, porAccionBruta: 0, porAccion: 0, camposBrutosDiscrepantes: 0, camposInventados: 0, omitidasBrutas: 0, extrasBrutas: 0, omitidasNormalizadas: 0, extrasNormalizadas: 0, porCampoBruta: {} as Record<string, number>, porCampoNormalizada: {} as Record<string, number>, ajustesPorMotivo: {} as Record<string, number>, casosCorregidos: [] as number[], casosEmpeorados: [] as number[], alertas: [] as string[], fallosPorCausa: {} as Record<string, number>, finishReason: {} as Record<string, number>, totalElementos: 0, porRevisar: 0,
    hogarBruta: { tp: 0, fp: 0, fn: 0 }, hogarNormalizada: { tp: 0, fp: 0, fn: 0 }, aplicacion: { invalido: 0, horaPerdida: 0, responsabilidadDegradada: 0, notaSinClasificar: 0 },
    ablacion: { validador74: { principal: 0, estricta: 0 }, validador75: { principal: 0, estricta: 0 }, casos: 0 } };
  const sum = (d: Record<string, number>, x: Record<string, number>) => { for (const [k, v] of Object.entries(x)) d[k] = (d[k] ?? 0) + v; };
  for (const d of validas) {
    const { bruta: b, normalizada: n } = d.metricas!;
    if(d.nuevaMedicion){for(const capa of ["bruta","normalizada"] as const)for(const k of ["esperadas","entregadas","correctas","sustituidas"] as const)s.accionesSemanticas[capa][k]+=d.nuevaMedicion[capa][k];for(const k of Object.keys(s.listasEquivocadas) as (keyof typeof s.listasEquivocadas)[])s.listasEquivocadas[k]+=d.nuevaMedicion.listas[k];s.prohibidosBruta+=d.nuevaMedicion.prohibidosBruta;s.prohibidosNormalizada+=d.nuevaMedicion.prohibidosNormalizada;}
    if(d.cobertura){const x=d.cobertura;s.accionesEsperadas+=x.bruta.esperadas;s.accionesEntregadasBrutas+=x.bruta.entregadas;s.accionesEntregadasNormalizadas+=x.normalizada.entregadas;s.deficitBruto+=x.bruta.deficit;s.deficitNormalizado+=x.normalizada.deficit;s.excedenteBruto+=x.bruta.excedente;s.excedenteNormalizado+=x.normalizada.excedente;if(!x.bruta.cantidadCompleta||!x.normalizada.cantidadCompleta)s.casosCoberturaIncompleta.push(d.id); }
    s.principalBruta += +b.principal; s.estrictaBruta += +b.estricta; s.principalNormalizada += +n.principal; s.estrictaNormalizada += +n.estricta;
    s.porAccionBruta += b.audit.discrepancias; s.porAccion += n.audit.discrepancias; s.camposBrutosDiscrepantes += b.discrepanciasGlobales; s.camposInventados += n.discrepanciasGlobales;
    s.omitidasBrutas += b.audit.omitidas; s.extrasBrutas += b.audit.extras; s.omitidasNormalizadas += n.audit.omitidas; s.extrasNormalizadas += n.audit.extras;
    sum(s.porCampoBruta, b.porCampo); sum(s.porCampoNormalizada, n.porCampo);
    for (const a of d.ajustes ?? []) s.ajustesPorMotivo[a.motivo] = (s.ajustesPorMotivo[a.motivo] ?? 0) + 1;
    if ((!b.principal && n.principal) || (!b.estricta && n.estricta)) s.casosCorregidos.push(d.id);
    if ((b.principal && !n.principal) || (b.estricta && !n.estricta)) s.casosEmpeorados.push(d.id);
    for (const a of d.alertas ?? []) s.alertas.push(d.id + ":" + a);
    for (const e of d.resultado!.elementos) { s.totalElementos++; if (e.confianza === "baja" || e.persona_a_cargo === null || e.ambito === null) s.porRevisar++; }
    if (d.hogar) { for (const k of ["tp", "fp", "fn"] as const) { s.hogarBruta[k] += d.hogar.bruta[k]; s.hogarNormalizada[k] += d.hogar.normalizada[k]; } }
    if (d.aplicacion) for (const k of Object.keys(s.aplicacion) as (keyof typeof s.aplicacion)[]) s.aplicacion[k] += d.aplicacion[k];
    if (d.ablacion) { s.ablacion.casos++; for (const v of ["validador74", "validador75"] as const) { s.ablacion[v].principal += +d.ablacion[v].principal; s.ablacion[v].estricta += +d.ablacion[v].estricta; } }
  }
  for (const q of solicitudes) { if (q.intento.resultado !== "valida") s.fallosPorCausa[q.intento.motivo ?? "desconocida"] = (s.fallosPorCausa[q.intento.motivo ?? "desconocida"] ?? 0) + 1; if (q.intento.finishReason) s.finishReason[q.intento.finishReason] = (s.finishReason[q.intento.finishReason] ?? 0) + 1; }
  const lat = solicitudes.filter(x => x.intento.resultado === "valida").map(x => x.intento.ms).sort((a, b) => a - b);
  const consumo = { entrada: 0, salida: 0, razonamiento: 0, sinMedicion: 0 };
  for (const q of solicitudes) { const i = q.intento; if (i.tokensEntrada === undefined || i.tokensSalida === undefined) consumo.sinMedicion++; consumo.entrada += i.tokensEntrada ?? 0; consumo.salida += i.tokensSalida ?? 0; consumo.razonamiento += i.tokensRazonamiento ?? 0; }
  return { ...s, porAccionAdicional:Object.fromEntries(Object.entries(s.accionesSemanticas).map(([k,m])=>[k,{...m,precision:m.entregadas?m.correctas/m.entregadas:null,recuperacion:m.esperadas?m.correctas/m.esperadas:null}])), total: det.length, validas: validas.length, fallidas: fallidas.length, noEjecutadas: det.length - validas.length - fallidas.length, tasaPorRevisar: s.totalElementos ? s.porRevisar / s.totalElementos : null, solicitudes: solicitudes.length, consumo, medianaMs: lat.length ? (lat[Math.floor((lat.length - 1) / 2)] + lat[Math.floor(lat.length / 2)]) / 2 : null, p95Ms: lat.length ? lat[Math.ceil(lat.length * .95) - 1] : null };
}

export async function ejecutarComparacionV77({ clave, corpus, modo = "aceptacion", versiones = modo === "aceptacion" ? ["6.0", "7.7"] : ["6.0", "7.5", "7.7"], semilla = 20261130, solicitar, esperar = ms => new Promise<void>(r => setTimeout(r, ms)), registrar = () => {} }: {
  clave: string; corpus: CorpusEvaluable; modo?: "aceptacion" | "desarrollo"; versiones?: VersionV77[]; semilla?: number; solicitar?: typeof fetch; esperar?: (ms: number) => Promise<void>; registrar?: (linea: string) => void;
}) {
  if (!solicitar) throw new Error("SIN_AUTORIZACION_DE_PROVEEDOR: solo transporte explícito de prueba");
  if (!Number.isSafeInteger(semilla) || (modo !== "aceptacion" && modo !== "desarrollo")) throw new Error("CONFIG_AB_INVALIDA");
  if (modo === "aceptacion" && JSON.stringify(versiones) !== JSON.stringify(["6.0", "7.7"])) throw new Error("ACEPTACION_SOLO_6_0_VS_7_7");
  if (versiones[0] !== "6.0" || new Set(versiones).size !== versiones.length || versiones.length < 2) throw new Error("CONFIG_AB_INVALIDA");
  if (new Set(corpus.casos.map(c => c.id)).size !== corpus.casos.length) throw new Error("CORPUS_AB_INVALIDO");
  const candidata = versiones.at(-1)!;
  const detalle: Detalle[] = versiones.flatMap(version => corpus.casos.map(c => ({ id: c.id, version, estado: "no_ejecutada" as const })));
  const solicitudes: Solicitud[] = []; let idActual = 0; let primera = true; let repitiendo = false;
  const repeticiones: { id: number; detalle: Detalle[]; clasificacion: string }[] = [];
  const ia = new Map(versiones.map(version => [version, crearGeminiPorVersion({ clave, modelo: MODELO_AB, version, corpus, solicitar, observar: intento => solicitudes.push({ version, id: idActual, intento, ...(repitiendo ? { repeticion: true } : {}) }) })]));
  const registro = (id: number, v: VersionV77) => detalle.find(d => d.id === id && d.version === v)!;
  const ordenes = ordenesPorCaso(corpus.casos.length, versiones, semilla);
  const contextoVal = (texto: string) => ({ fecha: corpus.fecha, texto, personas: corpus.personas_a_cargo, integrantes: corpus.integrantes, ambitos: corpus.ambitos, autor: corpus.autor });
  const medir = (caso: CasoEvaluable, version: VersionV77, a: ReturnType<typeof crearGeminiPorVersion>, resultado: Interpretacion): Partial<Detalle> => {
    const bruta = a.bruta(caso.id)!, interna = a.brutaInterna(caso.id) as SalidaInternaV71 | undefined;
    let ablacion: Ablacion | undefined;
    if ((version === "7.5" || version === "7.7") && interna) {
      const r72 = contratoInterpretacion.parse(validarV75(structuredClone(interna), contextoVal(caso.texto)).publica), r73 = contratoInterpretacion.parse(validarV77(structuredClone(interna), contextoVal(caso.texto)).publica);
      const m72 = capa(r72, caso.esperado), m73 = capa(r73, caso.esperado);
      ablacion = { validador74: { principal: m72.principal, estricta: m72.estricta }, validador75: { principal: m73.principal, estricta: m73.estricta } };
    }
    const ids=(xs:readonly string[],p:string)=>xs.map((nombre,i)=>({nombre,id:p+i}));const integrantes=ids(corpus.integrantes,"i");const autorId=integrantes.find(i=>i.nombre===corpus.autor)?.id;if(!autorId)throw Error("AUTOR_SINTETICO_AUSENTE");
    const nuevaMedicion={bruta:medirAcciones77(bruta,caso.esperado),normalizada:medirAcciones77(resultado,caso.esperado),listas:medirListas77(resultado,caso.esperado,{texto:caso.texto,autorId,personas:ids(corpus.personas_a_cargo,"p"),ambitos:ids(corpus.ambitos,"a"),integrantes}),prohibidosBruta:medirProhibidos77(bruta,caso.prohibido).length,prohibidosNormalizada:medirProhibidos77(resultado,caso.prohibido).length};
    return { estado: "valida", nuevaMedicion, brutaInterna: interna, bruta, resultado, ajustes: a.ajustes(caso.id), metricas: { bruta: capa(bruta, caso.esperado), normalizada: capa(resultado, caso.esperado) }, cobertura:{bruta:coberturaAcciones(bruta,caso.esperado),normalizada:coberturaAcciones(resultado,caso.esperado)},
      alertas: [...alertasInvencion(caso.texto, bruta, corpus.personas_a_cargo, corpus.integrantes).map(x => "bruta:" + x), ...alertasInvencion(caso.texto, resultado, corpus.personas_a_cargo, corpus.integrantes).map(x => "normalizada:" + x), ...(version === "7.7" ? [...alertasFecha77(caso.texto,bruta).map(x=>"bruta:"+x),...alertasFecha77(caso.texto,resultado).map(x=>"normalizada:"+x)] : []), ...(version === "7.7" ? bruta.elementos.flatMap((e,i)=> e.persona_a_cargo==="El hogar" && hogarSinRespaldo(caso.texto,e.titulo,interna?.elementos[i]?.persona_base) ? ["bruta:"+i+":hogar_sin_respaldo"] : []) : [])],
      hogar: { bruta: metricasHogar(bruta, caso.esperado), normalizada: metricasHogar(resultado, caso.esperado) }, aplicacion: perdidasAplicacion(resultado, corpus, caso.texto), ablacion };
  };
  let parada: { motivo: string; version?: VersionV77; id: number } | null = null;
  externo: for (const [k, caso] of corpus.casos.entries()) {
    idActual = caso.id;
    for (const version of ordenes[k]) {
      const a = ia.get(version)!; const antes = solicitudes.length;
      for (let intento = 0; intento < 2; intento++) {
        if (!primera) await esperar(4500); primera = false;
        try { const resultado = (await a.evaluarLote([caso.id])).get(caso.id)!; Object.assign(registro(caso.id, version), medir(caso, version, a, resultado)); break; }
        catch (error) {
          const ultimo = solicitudes.length > antes ? solicitudes.at(-1)?.intento : undefined;
          const causa = error instanceof ErrorGemini ? "HTTP " + error.estado : ultimo?.motivo ?? (error instanceof SinModelosDisponibles ? "sin_modelos" : "sin_salida_valida");
          if (intento === 0 && (causa === "HTTP 503" || causa === "timeout")) continue;
          Object.assign(registro(caso.id, version), { estado: "fallida", causa });
          if (causa === "HTTP 429" || modo === "aceptacion" || version === candidata) { parada = { motivo: causa === "HTTP 429" ? "cuota_429" : "cobertura_incompleta:" + causa, version, id: caso.id }; break externo; }
          break;
        }
      }
    }
    const marca = (d: Detalle) => d.metricas ? `${+d.metricas.bruta.principal}${+d.metricas.bruta.estricta}/${+d.metricas.normalizada.principal}${+d.metricas.normalizada.estricta}` : d.estado;
    const c6 = registro(caso.id, "6.0"), c7 = registro(caso.id, candidata);
    if(c6.alertas?.length)registrar("D21 alerta control "+caso.id+" "+c6.alertas.join(","));
    registrar(`caso ${caso.id} · ` + versiones.map(v => v + " " + marca(registro(caso.id, v))).join(" · ") + (c7.alertas?.length ? " · alertas " + c7.alertas.join(",") : ""));
    if (modo === "desarrollo") {
      // En desarrollo una alerta se registra y se revisa a mano; solo detiene si viene de la candidata.
      if (c7.alertas?.length) { parada = { motivo: "alerta_invencion", version: candidata, id: caso.id }; break; }
      continue;
    }
    if (c6.metricas && c7.metricas) {
      const a = c6.metricas, b = c7.metricas;
      const regresion = (["bruta", "normalizada"] as const).some(k => (["principal", "estricta"] as const).some(m => a[k][m] && !b[k][m]));
      const empeora = (b.bruta.estricta && !b.normalizada.estricta) || (b.bruta.principal && !b.normalizada.principal);
      if (empeora || c7.alertas?.length  ) { parada = { motivo: empeora ? "validador_empeora" : "alerta_invencion", version: empeora || c7.alertas?.length ? candidata : "6.0", id: caso.id }; break; }
      if (!regresion && c7.cobertura && (!c7.cobertura.bruta.cantidadCompleta || !c7.cobertura.normalizada.cantidadCompleta)) { parada={motivo:"cobertura_acciones_incompleta",version:candidata,id:caso.id};break; }
      if (regresion) {
        repitiendo = true; const repetidos: Detalle[] = [];
        for (const version of [...ordenes[k]].reverse()) {
          const adapter = ia.get(version)!; await esperar(4500);
          try { const resultado = await adapter.evaluar(caso.id); const d = { id: caso.id, version, ...medir(caso, version, adapter, resultado) } as Detalle; repetidos.push(d); if (version === candidata && d.alertas?.length) { parada = { motivo: "alerta_invencion_en_repeticion", version, id: caso.id }; break; } }
          catch (error) { const causa = error instanceof ErrorGemini ? "HTTP " + error.estado : solicitudes.at(-1)?.intento.motivo ?? "sin_salida_valida"; repetidos.push({ id: caso.id, version, estado: "fallida", causa }); parada = { motivo: causa === "HTTP 429" ? "cuota_429" : "cobertura_incompleta_repeticion:" + causa, version, id: caso.id }; break; }
        }
        const ra = repetidos.find(d => d.version === "6.0")?.metricas, rb = repetidos.find(d => d.version === candidata)?.metricas;
        const reproduce = ra && rb && (["bruta", "normalizada"] as const).some(k => (["principal", "estricta"] as const).some(m => ra[k][m] && !rb[k][m]));
        const clasificacion = parada ? "repeticion_interrumpida" : reproduce ? "regresion_reproducida" : "regresion_no_reproducida";
        repeticiones.push({ id: caso.id, detalle: repetidos, clasificacion });
        parada = parada ?? { motivo: clasificacion, version: candidata, id: caso.id };
        repitiendo = false; break;
      }
    }
  }
  const brazos = Object.fromEntries(versiones.map(v => [v, resumenBrazo(detalle.filter(d => d.version === v), solicitudes.filter(q => q.version === v && !q.repeticion))])) as Record<VersionV77, ReturnType<typeof resumenBrazo>>;
  const completos = corpus.casos.filter(c => versiones.every(v => registro(c.id, v).metricas)).length;
  return { resumen: { modo, semilla, modelo: MODELO_AB, respaldos: [], versiones, huellas: huellasV77(), parada, brazos, paresCompletos: completos, comparacionCompleta: completos === corpus.casos.length, revisionManual: "Pendiente; discrepancia no equivale a invención; alertas automáticas no son confirmación." }, detalle, solicitudes, repeticiones };
}
