import { describe, it, expect, vi } from "vitest";
import { ejecutarComparacionV71, ordenesBalanceados, alertasInvencion, type CorpusEvaluable } from "../../evals/comparacion-v7-1";
const base = { tipo: "tarea" as const, titulo: "Limpiar la casa", persona_a_cargo: "El hogar", ambito: "Hogar", plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta" as const };
const corpus: CorpusEvaluable = { fecha: "2026-11-26T12:00:00-03:00", zona_horaria: "America/Santiago", personas_a_cargo: ["El hogar"], integrantes: ["QA"], autor: "QA", ambitos: ["Hogar", "Compras"], casos: [1, 2, 3, 4].map(id => ({ id, texto: "Limpiar la casa", esperado: { elementos: [base] } })) };
const interna = (x: Record<string, unknown> = {}) => ({ descartes: [], elementos: [{ tipo: "tarea", titulo: "Limpiar la casa", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar", tiempo: [], alcance: "ninguno", plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta", motivo_nota: null, ...x }] });
const es71 = (init?: RequestInit) => Boolean(JSON.parse(String(init?.body)).generationConfig.responseJsonSchema.properties.descartes);
const ok = (v71: boolean, extra: Record<string, unknown> = {}) => Response.json({ usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20 }, candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(v71 ? interna(extra) : { elementos: [base] }) }] } }] });
describe("Evaluador 7.1 sin proveedor real", () => {
  it("orden balanceado y reproducible por semilla", () => {
    const a = ordenesBalanceados(50, 20261127), b = ordenesBalanceados(50, 20261127), c = ordenesBalanceados(50, 1);
    expect(a).toEqual(b); expect(a.filter(Boolean)).toHaveLength(25); expect(a).not.toEqual(c);
  });
  it("aplica el orden por caso, respeta 4,5 s, calcula brazos y huellas", async () => {
    const orden: boolean[] = []; const esperar = vi.fn(async () => {});
    const r = await ejecutarComparacionV71({ clave: "qa", corpus, semilla: 3, esperar, solicitar: vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => { orden.push(es71(init)); return ok(es71(init)); }) });
    const esperado = ordenesBalanceados(4, 3).flatMap(c6 => c6 ? [false, true] : [true, false]);
    expect(orden).toEqual(esperado); expect(esperar).toHaveBeenCalledTimes(7); expect(esperar).toHaveBeenCalledWith(4500);
    expect(r.resumen.parada).toBeNull(); expect(r.resumen.comparacionCompleta).toBe(true);
    expect(r.resumen.brazos["7.1"].estrictaBruta).toBe(4); expect(r.resumen.brazos["7.1"].finishReason.STOP).toBe(4);
    expect(r.resumen.brazos["6.0"].consumo.entrada).toBe(400); expect(r.resumen.huellas["7.1"].instruccion).toHaveLength(64);
  });
  it("429 detiene de inmediato y deja el resto como no ejecutado", async () => {
    const s = vi.fn(async () => new Response("", { status: 429 }));
    const r = await ejecutarComparacionV71({ clave: "qa", corpus, esperar: async () => {}, solicitar: s });
    expect(r.resumen.parada?.motivo).toBe("cuota_429"); expect(s).toHaveBeenCalledTimes(1);
    expect(r.resumen.brazos["6.0"].noEjecutadas + r.resumen.brazos["7.1"].noEjecutadas).toBe(7);
  });
  it("503 se reintenta una sola vez", async () => {
    const s = vi.fn(async () => new Response("", { status: 503 }));
    const r = await ejecutarComparacionV71({ clave: "qa", corpus, esperar: async () => {}, solicitar: s });
    expect(s).toHaveBeenCalledTimes(2); expect(r.resumen.parada?.motivo).toBe("cobertura_incompleta:HTTP 503");
  });
  it("detiene ante regresión individual pareada", async () => {
    const r = await ejecutarComparacionV71({ clave: "qa", corpus, esperar: async () => {}, solicitar: vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => ok(es71(init), { ambito: "Compras" })) });
    expect(r.resumen.parada?.motivo).toBe("regresion_individual"); expect(r.resumen.paresCompletos).toBe(1);
  });
  it("detiene cuando el validador empeora una salida bruta correcta", async () => {
    const c2: CorpusEvaluable = { ...corpus, casos: [{ id: 1, texto: "Limpiar la casa", esperado: { elementos: [{ ...base, plazo_fecha: "2026-11-27" }] } }] };
    const r = await ejecutarComparacionV71({ clave: "qa", corpus: c2, esperar: async () => {}, solicitar: vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => es71(init) ? ok(true, { plazo_fecha: "2026-11-27" }) : Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify({ elementos: [base] }) }] } }] })) });
    expect(r.resumen.parada?.motivo).toBe("validador_empeora");
  });
  it("alerta de invención detiene la corrida de aceptación", () => {
    expect(alertasInvencion("Limpiar la casa", { elementos: [{ ...base, plazo_fecha: "2026-11-27" }] }, ["El hogar"], [])).toContain("0:plazo_sin_marcador");
    expect(alertasInvencion("Pagar 45 lucas", { elementos: [{ ...base, titulo: "Pagar 50 lucas" }] }, ["El hogar"], [])).toContain("0:numero_no_respaldado");
    expect(alertasInvencion("Mañana limpiar la casa", { elementos: [{ ...base, plazo_fecha: "2026-11-27" }] }, ["El hogar"], [])).toEqual([]);
  });
  it("fallo de contrato detiene en aceptación; en desarrollo continúa y nunca es aceptación", async () => {
    const malo = vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => es71(init) ? Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "{}" }] } }] }) : ok(false));
    const a = await ejecutarComparacionV71({ clave: "qa", corpus, semilla: 3, esperar: async () => {}, solicitar: malo });
    expect(a.resumen.parada?.motivo).toBe("cobertura_incompleta:contrato_interno_v71");
    const d = await ejecutarComparacionV71({ clave: "qa", corpus, modo: "desarrollo", esperar: async () => {}, solicitar: malo });
    expect(d.resumen.parada).toBeNull(); expect(d.resumen.brazos["7.1"].fallidas).toBe(4); expect(d.resumen.brazos["6.0"].validas).toBe(4);
  });
});
