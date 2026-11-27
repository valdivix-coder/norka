import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { crearGeminiPorVersion, solicitudV73, VERSION_PREDETERMINADA } from "../../src/data/gemini-sintetico-v7-3";
import { crearGeminiPorVersion as selector72 } from "../../src/data/gemini-sintetico-v7-2";
import { instruccionesCapturaV73, sufijoIndividualV73 } from "../../src/data/prompt-captura-v7-3";
import { instruccionesCapturaV72 } from "../../src/data/prompt-captura-v7-2";
import { calendarioContextoV73, validarV73, clausulas, anclaHogar, type ContextoV73 } from "../../src/core/usecases/validar-interpretacion-v7-3";
import { contratoInterpretacion } from "../../src/core/contracts/interpretacion";
import type { ElementoInternoV71, SalidaInternaV71 } from "../../src/core/contracts/interpretacion-interna-v7-1";
import { ablacionValidadores } from "../../evals/replay-validadores";
import { ejecutarComparacionV73, ordenesPorCaso, perdidasAplicacion, metricasHogar, type CorpusEvaluable } from "../../evals/comparacion-v7-3";

const modelo = "gemini-3.5-flash-lite";
const corpus = { fecha: "2027-05-13T09:00:00-04:00", zona_horaria: "America/Santiago", personas_a_cargo: ["Isidora", "Matías", "Bruno", "El hogar"], integrantes: ["Carolina", "Felipe"], autor: "Carolina", ambitos: ["Salud", "Colegio", "Pagos y finanzas", "Crianza diaria", "Hogar", "Mascotas", "Trámites", "Compras"], casos: [{ id: 1, texto: "Arreglar la reja de la casa y comprar pilas" }, { id: 2, texto: "Limpiar el refri" }] };
const ctx = (texto: string): ContextoV73 => ({ fecha: corpus.fecha, texto, personas: corpus.personas_a_cargo, integrantes: corpus.integrantes, ambitos: corpus.ambitos, autor: corpus.autor });
const el = (x: Partial<ElementoInternoV71>): ElementoInternoV71 => ({ tipo: "tarea", titulo: "Hacer algo", persona_base: "ninguna", persona_a_cargo: null, ambito: null, tiempo: [], alcance: "ninguno", plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta", motivo_nota: null, ...x });
const sal = (...elementos: ElementoInternoV71[]): SalidaInternaV71 => ({ descartes: [], elementos });
const responder = (x: unknown, finishReason = "STOP") => Response.json({ usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 }, candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(x) }] } }] });

describe("7.3 · selector y referencias intactas", () => {
  it("6.0 sigue predeterminada y 7.2 produce la misma solicitud que su selector original", async () => {
    expect(VERSION_PREDETERMINADA).toBe("6.0");
    expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus }).version).toBe("6.0");
    const a: string[] = [], b: string[] = [];
    const cap = (dest: string[]) => vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => { dest.push(String(init?.body)); return new Response("", { status: 500 }); });
    await expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.2", solicitar: cap(a) }).evaluar(1)).rejects.toThrow();
    await expect(selector72({ clave: "qa", modelo, corpus, version: "7.2", solicitar: cap(b) }).evaluar(1)).rejects.toThrow();
    expect(a[0]).toBe(b[0]);
    expect(() => crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.4" as never })).toThrow("VERSION_PROMPT_INVALIDA");
  });
  it("7.3 solicita instrucción exacta, mismo esquema interno que 7.1 y calendario D-04 en la representación", () => {
    const { cuerpo } = solicitudV73(corpus, [corpus.casos[0]]);
    expect(cuerpo.systemInstruction.parts[0].text).toBe(instruccionesCapturaV73 + "\n" + sufijoIndividualV73);
    const props = Object.keys((cuerpo.generationConfig.responseJsonSchema as unknown as { properties: { elementos: { items: { properties: object } } } }).properties.elementos.items.properties);
    expect(props).toEqual(["tipo", "titulo", "persona_base", "persona_a_cargo", "ambito", "tiempo", "alcance", "plazo_fecha", "plazo_hora", "recurrencia", "dirigida_a", "confianza", "motivo_nota"]);
    const cal = JSON.parse(cuerpo.contents[0].parts[0].text).contexto.calendario;
    expect(cal.proximos.jueves).toBeUndefined();
    expect(cal.proximo_mismo_dia).toEqual({ jueves: "2027-05-20" });
    expect(cal.proximos.sábado).toBe("2027-05-15");
    expect(instruccionesCapturaV73.length).toBeLessThan(instruccionesCapturaV72.length);
  });
  it("calendario cruza fin de año y bisiesto sin reloj del entorno", () => {
    expect(calendarioContextoV73("2028-02-28T08:00").manana).toBe("2028-02-29");
    expect(calendarioContextoV73("2026-12-30T08:00").proximo_mismo_dia).toEqual({ miércoles: "2027-01-06" });
  });
  it("rechaza truncamiento y lote con identificadores duplicados", async () => {
    const ok = sal(el({ titulo: "Limpiar el refri", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar" }));
    await expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.3", solicitar: vi.fn(async () => responder(ok, "MAX_TOKENS")) }).evaluar(2)).rejects.toThrow("FINISH_REASON_NO_STOP");
    await expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.3", solicitar: vi.fn(async () => responder({ resultados: [{ id: 1, ...ok }, { id: 1, ...ok }] })) }).evaluarLote([1, 2])).rejects.toThrow();
  });
});

describe("7.3 · M1 ancla de hogar por acción", () => {
  it("segmenta solo antes de un verbo: no divide objetos compuestos", () => {
    expect(clausulas("Arreglar la reja de la casa y comprar pilas")).toEqual(["arreglar la reja de la casa", "comprar pilas"]);
    expect(clausulas("Comprar pan, leche y huevos para la casa")).toEqual(["comprar pan leche y huevos para la casa"]);
  });
  it("anula El hogar en una compra sin ancla en su propia cláusula", () => {
    const r = validarV73(sal(el({ titulo: "Arreglar la reja de la casa", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar" }), el({ titulo: "Comprar pilas", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Compras" })), ctx("Arreglar la reja de la casa y comprar pilas"));
    expect(r.publica.elementos.map(e => e.persona_a_cargo)).toEqual(["El hogar", null]);
    expect(r.ajustes.map(a => a.motivo)).toContain("hogar_sin_ancla_compra");
  });
  it("no anula un hogar legítimo: compra para la casa, bien común sin la palabra casa, compuesto", () => {
    for (const [t, ti] of [["Comprar pilas para la casa", "Comprar pilas"], ["Limpiar el refri", "Limpiar el refri"], ["Comprar pan, leche y huevos para la casa", "Comprar pan, leche y huevos"], ["comprar lavalozas y barrer el patio", "Barrer el patio"]]) {
      const r = validarV73(sal(el({ titulo: ti, persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Compras" })), ctx(t));
      expect(r.publica.elementos[0].persona_a_cargo).toBe("El hogar");
    }
  });
  it("acción no de compra sin ancla: solo marca, no anula", () => {
    const r = validarV73(sal(el({ titulo: "Ordenar todo", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar" })), ctx("Ordenar todo"));
    expect(r.publica.elementos[0]).toMatchObject({ persona_a_cargo: "El hogar", confianza: "baja" });
  });
  it("metamórfica: mayúsculas, minúsculas y puntuación no cambian la decisión", () => {
    for (const t of ["ARREGLAR LA REJA DE LA CASA Y COMPRAR PILAS", "arreglar la reja de la casa, y comprar pilas.", "Arreglar la reja de la casa y comprar pilas"]) expect(anclaHogar(t, "Comprar pilas")).toMatchObject({ anclada: false, compra: true });
  });
});

describe("7.3 · M2 calendario D-04 y minutos", () => {
  it("«el jueves» dicho un jueves: fecha null, hora conservada", () => {
    const r = validarV73(sal(el({ titulo: "Sacar la basura", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar", tiempo: ["El jueves a las 18:30"], alcance: "propio", plazo_fecha: "2027-05-20", plazo_hora: "18:30" })), ctx("El jueves a las 18:30 sacar la basura de la casa"));
    expect(r.publica.elementos[0]).toMatchObject({ plazo_fecha: null, plazo_hora: "18:30", confianza: "baja" });
  });
  it("«el próximo jueves» es +7 y conserva minutos", () => {
    const r = validarV73(sal(el({ titulo: "Sacar la basura", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar", tiempo: ["El próximo jueves a las 18:30"], alcance: "propio", plazo_fecha: "2027-05-20", plazo_hora: "18:30" })), ctx("El próximo jueves a las 18:30 sacar la basura de la casa"));
    expect(r.publica.elementos[0]).toMatchObject({ plazo_fecha: "2027-05-20", plazo_hora: "18:30" });
  });
});

describe("7.3 · invariantes del validador", () => {
  it("300 salidas aleatorias: nunca agrega acciones ni rellena entidades nulas; siempre contrato válido", () => {
    let s = 11; const r = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
    const textos = ["Arreglar la reja de la casa y comprar pilas", "El jueves a las 18:30 sacar la basura de la casa", "Comprar servilletas", "Que Felipe compre el regalo de la Isidora"];
    for (let k = 0; k < 300; k++) {
      const elementos = Array.from({ length: 1 + Math.floor(r() * 3) }, () => el({ tipo: pick(["tarea", "responsabilidad", "propuesta", "nota"] as const), titulo: pick(["Comprar pilas", "Sacar la basura", "Comprar el regalo"]), persona_base: pick(["nombrada", "referida", "ninguna"] as const), persona_a_cargo: pick([null, "Isidora", "El hogar", "Otro"]), ambito: pick([null, "Compras", "Inventado"]), tiempo: pick([[], ["El jueves a las 18:30"], ["mañana"]]), alcance: pick(["propio", "hereda", "comun", "ninguno"] as const), plazo_fecha: pick([null, "2027-05-20"]), plazo_hora: pick([null, "18:30"]), dirigida_a: pick([null, "Felipe", "Carolina"]), motivo_nota: pick([null, "sin_accion"] as const) }));
      const { publica } = validarV73(sal(...elementos), ctx(pick(textos)));
      expect(contratoInterpretacion.safeParse(publica).success).toBe(true);
      expect(publica.elementos).toHaveLength(elementos.length);
      publica.elementos.forEach((p, i) => { for (const c of ["persona_a_cargo", "ambito", "dirigida_a"] as const) if (elementos[i][c] === null) expect(p[c]).toBeNull(); });
    }
  });
});

describe("7.3 · replay real de 61 salidas de Gemini (M6, sin proveedor)", () => {
  it("el validador 7.3 corrige los dos errores de hogar y no agrega empeoramientos fuera del cambio D-04 documentado", () => {
    const { resumen } = ablacionValidadores();
    const v73 = resumen["v7.3"] as { estricta: number; corregidos: string[]; empeorados: string[] };
    const v72 = resumen["v7.2"] as { estricta: number; empeorados: string[] };
    expect(resumen.casos).toBe(61);
    expect(v73.corregidos).toEqual(expect.arrayContaining(["45928250323#29", "45928250323#38"]));
    expect(v73.empeorados).toEqual(["45922944781#39"]); // etiqueta de 7.1 anterior a D-04 (mismo día → +7)
    expect(v73.empeorados).toEqual(v72.empeorados);
    expect(v73.estricta).toBeGreaterThan(v72.estricta);
  });
});

describe("7.3 · separación de datos", () => {
  const oficial = JSON.parse(readFileSync("evals/captura-cl.json", "utf8")) as { casos: { texto: string }[]; personas_a_cargo: string[]; integrantes: string[] };
  const dev = JSON.parse(readFileSync("evals/desarrollo-v7-3.json", "utf8")) as { personas_a_cargo: string[]; ambitos: string[]; integrantes: string[]; casos: { texto: string; esperado: { elementos: { persona_a_cargo: string | null; ambito: string | null; dirigida_a: string | null }[] } }[] };
  const n = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  it("el prompt no contiene frases ni nombres del examen; el desarrollo no copia examen ni demostraciones", () => {
    for (const c of oficial.casos) expect(n(instruccionesCapturaV73)).not.toContain(n(c.texto));
    for (const nombre of [...oficial.personas_a_cargo, ...oficial.integrantes].filter(x => x !== "El hogar")) expect(new RegExp("\\b" + n(nombre) + "\\b").test(n(instruccionesCapturaV73))).toBe(false);
    for (const c of dev.casos) {
      expect(contratoInterpretacion.safeParse(c.esperado).success).toBe(true);
      expect(oficial.casos.some(o => n(o.texto) === n(c.texto))).toBe(false);
      expect(n(instruccionesCapturaV73)).not.toContain(n(c.texto));
      for (const e of c.esperado.elementos) { if (e.persona_a_cargo) expect(dev.personas_a_cargo).toContain(e.persona_a_cargo); if (e.ambito) expect(dev.ambitos).toContain(e.ambito); if (e.dirigida_a) expect(dev.integrantes).toContain(e.dirigida_a); }
    }
  });
});

describe("7.3 · evaluador simulado", () => {
  const base = { tipo: "tarea" as const, titulo: "Limpiar la casa", persona_a_cargo: "El hogar", ambito: "Hogar", plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta" as const };
  const c: CorpusEvaluable = { fecha: "2026-11-26T12:00:00-03:00", zona_horaria: "America/Santiago", personas_a_cargo: ["El hogar"], integrantes: ["QA"], autor: "QA", ambitos: ["Hogar", "Compras"], casos: [1, 2, 3].map(id => ({ id, texto: "Limpiar la casa", esperado: { elementos: [base] } })) };
  const interna = (x: Record<string, unknown> = {}) => ({ descartes: [], elementos: [{ tipo: "tarea", titulo: "Limpiar la casa", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar", tiempo: [], alcance: "ninguno", plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta", motivo_nota: null, ...x }] });
  const esInterna = (init?: RequestInit) => Boolean(JSON.parse(String(init?.body)).generationConfig.responseJsonSchema.properties.descartes);
  const es73 = (init?: RequestInit) => JSON.parse(String(init?.body)).systemInstruction.parts[0].text.startsWith(instruccionesCapturaV73.slice(0, 50)) && JSON.parse(String(init?.body)).systemInstruction.parts[0].text === instruccionesCapturaV73 + "\n" + sufijoIndividualV73;
  const ok = (init?: RequestInit, extra73: Record<string, unknown> = {}) => responder(esInterna(init) ? interna(es73(init) ? extra73 : {}) : { elementos: [base] });
  it("orden por caso reproducible: balanceado con 2 brazos, permutado con 3", () => {
    expect(ordenesPorCaso(50, ["6.0", "7.3"], 1).filter(o => o[0] === "6.0")).toHaveLength(25);
    expect(ordenesPorCaso(5, ["6.0", "7.2", "7.3"], 7)).toEqual(ordenesPorCaso(5, ["6.0", "7.2", "7.3"], 7));
  });
  it("desarrollo con tres brazos: cobertura completa y ablación del validador registrada", async () => {
    const r = await ejecutarComparacionV73({ clave: "qa", corpus: c, modo: "desarrollo", esperar: async () => {}, solicitar: vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => ok(init)) });
    expect(r.resumen.comparacionCompleta).toBe(true);
    expect(r.resumen.brazos["7.3"].ablacion.casos).toBe(3);
    expect(r.resumen.brazos["7.2"].estrictaNormalizada).toBe(3);
    expect(r.resumen.brazos["7.3"].hogarNormalizada).toEqual({ tp: 3, fp: 0, fn: 0 });
  });
  it("aceptación exige 6.0 vs 7.3 y aplica D-19 ante regresión", async () => {
    await expect(ejecutarComparacionV73({ clave: "qa", corpus: c, modo: "aceptacion", versiones: ["6.0", "7.2", "7.3"], esperar: async () => {} })).rejects.toThrow("ACEPTACION_SOLO_6_0_VS_7_3");
    const r = await ejecutarComparacionV73({ clave: "qa", corpus: c, modo: "aceptacion", esperar: async () => {}, solicitar: vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => ok(init, { ambito: "Compras" })) });
    expect(r.resumen.parada?.motivo).toBe("regresion_reproducida");
    expect(r.repeticiones).toHaveLength(1);
    expect(r.resumen.paresCompletos).toBe(1);
  });
  it("429 detiene sin repetir", async () => {
    const s = vi.fn(async () => new Response("", { status: 429 }));
    const r = await ejecutarComparacionV73({ clave: "qa", corpus: c, modo: "aceptacion", esperar: async () => {}, solicitar: s });
    expect(r.resumen.parada?.motivo).toBe("cuota_429"); expect(s).toHaveBeenCalledTimes(1);
  });
  it("capa aplicable: registra la hora perdida cuando no hay fecha y las métricas de hogar", () => {
    const salida = { elementos: [{ ...base, plazo_hora: "18:30" }] };
    expect(perdidasAplicacion(salida, c, "Limpiar la casa a las 18:30").horaPerdida).toBe(1);
    expect(metricasHogar({ elementos: [base, { ...base, persona_a_cargo: "El hogar" }] }, { elementos: [base, { ...base, persona_a_cargo: null }] })).toEqual({ tp: 1, fp: 1, fn: 0 });
  });
});
