// Auditoría independiente 27-nov-2026 · pruebas reproducibles SIN proveedor, sin red y sin datos reales.
// No modifica candidatos, corpus ni expectativas. Ejecutar: npx vitest run --config evals/vitest.auditoria-universal.mts
// Convención: `test.fails` expresa el comportamiento CORRECTO que hoy no se cumple (hallazgo reproducido).
// Si alguien corrige el código congelado, la prueba se pondrá roja: entonces la corrección debe vivir en una
// versión nueva (7.7) y la prueba se convierte en `test` normal para esa versión, nunca se borra.
import { test, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { validarV76 } from "../src/core/usecases/validar-interpretacion-v7-6";
import { instruccionesCapturaV75 } from "../src/data/prompt-captura-v7-5";
import { planInterpretacion } from "../src/core/usecases/interpretacion";
import { iniciarRevision, editarRevision, confirmarRevision } from "../src/laboratorio/motor-revision-universal";
import { contratoInterpretacion, type Interpretacion, type ElementoInterpretado } from "../src/core/contracts/interpretacion";
import type { SalidaInternaV71 } from "../src/core/contracts/interpretacion-interna-v7-1";
import { capa, alertasInvencion } from "./comparacion-v7-2";
import { auditarAcciones } from "./auditar-acciones";

type Interno = SalidaInternaV71["elementos"][number];
const FECHA = "2027-03-03T10:00:00-03:00"; // miércoles
const AMBITOS = ["Salud", "Colegio", "Pagos y finanzas", "Crianza diaria", "Hogar", "Mascotas", "Trámites", "Compras"];
const base: Interno = { tipo: "tarea", titulo: "x", persona_a_cargo: null, ambito: null, plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta", persona_base: "ninguna", tiempo: [], alcance: "ninguno", motivo_nota: null };
const validar = (texto: string, el: Partial<Interno>) =>
  validarV76({ descartes: [], elementos: [{ ...base, ...el }] }, { fecha: FECHA, texto, personas: ["Tomás", "Lola", "El hogar"], integrantes: ["Marta", "Raúl"], autor: "Marta", ambitos: AMBITOS }).publica.elementos[0];

// ---------------------------------------------------------------- 1 · tiempo (validador 7.4/7.6)
test.fails("H-T1 dos fechas alternativas no se convierten en la primera", () => {
  const r = validar("Llevar a Tomás al doctor el viernes o el sábado", { titulo: "Llevar a Tomás al doctor", persona_base: "nombrada", persona_a_cargo: "Tomás", ambito: "Salud", tiempo: ["el viernes o el sábado"], alcance: "propio", confianza: "baja" });
  expect(r.plazo_fecha).toBeNull(); // hoy: 2027-03-05 «recalculada»
});
test.fails("H-T2 una autocorrección dentro del fragmento no elige la opción descartada", () => {
  const r = validar("Bañar a Lola el jueves, no, mejor el sábado", { titulo: "Bañar a Lola", persona_base: "nombrada", persona_a_cargo: "Lola", ambito: "Mascotas", tiempo: ["el jueves, no, mejor el sábado"], alcance: "propio" });
  expect(r.plazo_fecha).not.toBe("2027-03-04"); // hoy: jueves
});
test.fails("H-T3 «el lunes 15» respeta el número del día", () => {
  const r = validar("El lunes 15 llevar a Tomás al kine", { titulo: "Llevar a Tomás al kine", persona_base: "nombrada", persona_a_cargo: "Tomás", ambito: "Salud", tiempo: ["El lunes 15"], alcance: "propio", plazo_fecha: "2027-03-15" });
  expect(r.plazo_fecha).toBe("2027-03-15"); // hoy: sobrescribe con 2027-03-08
});
test.fails("H-T4 «12 de la noche» nunca se corrige a mediodía", () => {
  const r = validar("Mañana a las 12 de la noche sacar la basura", { titulo: "Sacar la basura", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar", tiempo: ["Mañana a las 12 de la noche"], alcance: "propio", plazo_fecha: "2027-03-04", plazo_hora: "00:00" });
  expect(r.plazo_hora).not.toBe("12:00");
});
test.fails.each([["El viernes 17.30", "17:30"], ["Mañana 5 pm", "17:00"], ["Mañana a eso de las 5", "17:00"]])("H-T5 hora no reconocida por el léxico no se borra: %s", (fr, h) => {
  const r = validar(fr + " control de Tomás", { titulo: "Control de Tomás", persona_base: "nombrada", persona_a_cargo: "Tomás", ambito: "Salud", tiempo: [fr], alcance: "propio", plazo_fecha: "2027-03-05", plazo_hora: h });
  expect(r.plazo_hora).toBe(h); // hoy: null «recalculada»
});
test.fails("H-T6 la repetición no crea plazo («el 5 de cada mes»)", () => {
  const r = validar("Pagar el arriendo el 5 de cada mes", { tipo: "responsabilidad", titulo: "Pagar el arriendo", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Pagos y finanzas", tiempo: ["el 5 de cada mes"], alcance: "propio", recurrencia: { tipo: "mensual", cada: 1, dias: [] } });
  expect(r.plazo_fecha).toBeNull(); // hoy: 2027-03-05
});

// ---------------------------------------------------------------- 2 · beneficiario y finanzas
test.fails("H-F1 «jardín» sin persona no ancla El hogar en un pago", () => {
  const r = validar("Transferir 20 lucas del jardín", { titulo: "Transferir 20 lucas del jardín", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Pagos y finanzas" });
  expect(r.persona_a_cargo === null || r.confianza === "baja").toBe(true); // hoy: El hogar, alta, sin ajuste
});
test("H-F2 pago ya realizado: ninguna regla lo distingue de uno pendiente (brecha de prompt y validador)", () => {
  expect(instruccionesCapturaV75).not.toMatch(/ya pagu|ya hice|ya llev|ya compr/i);
  const r = validar("Ya pagué la luz; falta pagar el agua", { titulo: "Pagar la luz", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Pagos y finanzas" });
  expect(r).toMatchObject({ titulo: "Pagar la luz", confianza: "alta" }); // pasa intacta como tarea pendiente
});

// ---------------------------------------------------------------- 3 · métricas del evaluador
const el = (x: Partial<ElementoInterpretado>): ElementoInterpretado => ({ tipo: "tarea", titulo: "", persona_a_cargo: null, ambito: null, plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta", ...x });
const esperado: Interpretacion = { elementos: [el({ titulo: "Comprar pan", ambito: "Compras" }), el({ titulo: "Limpiar el baño", persona_a_cargo: "El hogar", ambito: "Hogar" })] };
test.fails("H-M1 estricta no acepta títulos intercambiados entre acciones", () => {
  const cambiado: Interpretacion = { elementos: [{ ...esperado.elementos[0], titulo: "Limpiar el baño" }, { ...esperado.elementos[1], titulo: "Comprar pan" }] };
  expect(capa(cambiado, esperado).estricta).toBe(false);
});
test.fails("H-M2 estricta no acepta una acción inventada que sustituye a una omitida (igual cardinalidad)", () => {
  const sustituida: Interpretacion = { elementos: [esperado.elementos[1], { ...esperado.elementos[0], titulo: "Comprar cerveza para el asado" }] };
  expect(capa(sustituida, esperado).estricta).toBe(false);
});
test("H-M3 principal ignora tipo y destinatario (documentado, no defecto: es la definición vigente)", () => {
  const propuesta: Interpretacion = { elementos: [esperado.elementos[0], { ...esperado.elementos[1], tipo: "propuesta", dirigida_a: "Raúl" }] };
  expect(capa(propuesta, esperado)).toMatchObject({ principal: true, estricta: false });
});
test.fails("H-M4 la alerta de fecha inventada no se desactiva por cualquier número del texto", () => {
  expect(alertasInvencion("Comprar 2 kilos de pan", { elementos: [el({ titulo: "Comprar 2 kilos de pan", ambito: "Compras", plazo_fecha: "2027-03-04" })] }, ["Tomás"], ["Marta"])).not.toHaveLength(0);
});

// ---------------------------------------------------------------- 4 · aplicación y revisión
const ctxApl = { texto: "Todos los lunes a las 8 sacar la basura", autorId: "i0", personas: [{ id: "p0", nombre: "El hogar" }], ambitos: [{ id: "a0", nombre: "Hogar" }], integrantes: [{ id: "i0", nombre: "Marta" }] };
const semanal = el({ tipo: "responsabilidad", titulo: "Sacar la basura", persona_a_cargo: "El hogar", ambito: "Hogar", plazo_hora: "08:00", recurrencia: { tipo: "semanal", cada: 1, dias: ["lunes"] } });
test.fails("H-A1 la hora de una responsabilidad recurrente se conserva en la propuesta aplicable", () => {
  expect(planInterpretacion({ elementos: [semanal] }, ctxApl)?.[0].plazo_hora).toBe("08:00"); // hoy: null
});
test.fails("H-A2 confirmar una responsabilidad con hora no exige inventar una fecha", () => {
  const s = iniciarRevision({ elementos: [semanal] }, ctxApl)!;
  expect(s.items[0].borrador.estado).toBe("lista"); // hoy: por_completar «fecha_para_hora»
});
const ctxRev = { texto: "Llevar a Sofi al médico y comprar el remedio", autorId: "i0", personas: [{ id: "p1", nombre: "Sofi" }, { id: "p2", nombre: "Sofi" }], ambitos: [{ id: "a1", nombre: "Salud" }], integrantes: [{ id: "i0", nombre: "Ana" }] };
const medico = el({ titulo: "Llevar a Sofi al médico", persona_a_cargo: "Sofi", ambito: "Salud", plazo_fecha: "2027-03-04" });
test.fails("H-A3 con dos personas homónimas la revisión permite elegir una por identificador", () => {
  const s = iniciarRevision({ elementos: [medico] }, ctxRev)!;
  expect(() => confirmarRevision(editarRevision(s, 0, 0, { ...medico }), 1, [0])).not.toThrow(); // hoy: edición por nombre, nunca confirmable
});
test.fails("H-A4 la confianza no se eleva sin un cambio ni una marca de revisión humana", () => {
  const ctx = { ...ctxRev, personas: [{ id: "p1", nombre: "Sofi" }] };
  const s = iniciarRevision({ elementos: [{ ...medico, confianza: "baja" }] }, ctx)!;
  expect(editarRevision(s, 0, 0, { ...medico, confianza: "alta" }).items[0].borrador.estado).toBe("por_completar"); // hoy: «lista»
});
test.fails("H-A5 una acción que hereda la fecha de otra se actualiza o se marca cuando esa fecha cambia", () => {
  const ctx = { ...ctxRev, personas: [{ id: "p1", nombre: "Sofi" }] };
  const s = iniciarRevision({ elementos: [medico, { ...medico, titulo: "Comprar el remedio", plazo_hora: "17:00" }] }, ctx)!;
  const n = editarRevision(s, 0, 0, { ...medico, plazo_fecha: "2027-03-10" });
  expect(n.items[1].borrador.estado === "por_completar" || n.items[1].actual.plazo_fecha === "2027-03-10").toBe(true);
});
test("H-A6 el contexto de producción no lleva fecha ni zona horaria de la captura (§6.2 lo exige)", () => {
  const fuente = readFileSync("src/core/usecases/interpretacion.ts", "utf8");
  const tipo = fuente.slice(fuente.indexOf("export type ContextoInterpretacion"), fuente.indexOf("};", fuente.indexOf("export type ContextoInterpretacion")));
  expect(tipo).not.toMatch(/fecha|zona/);
});

// ---------------------------------------------------------------- 5 · medición nueva: «listas» que están equivocadas
type Fixture = { fuente: { modo: string; corpus: string; run: string }; contexto: { personas_a_cargo: string[]; integrantes: string[]; autor: string; ambitos: string[] }; casos: { texto: string; esperado: unknown; brazos: Record<string, { estado: string; resultado: unknown }> }[] };
function medirListas(fixtures: Fixture[]) {
  const porVersion: Record<string, { respuestas: number; acciones: number; listas: number; listasConError: number; listasSinPar: number; porCompletar: number; porCompletarCorrectas: number }> = {};
  for (const f of fixtures) {
    expect(f.fuente.modo).toBe("desarrollo"); expect(f.fuente.corpus).not.toContain("oficial");
    const ids = (v: string[], p: string) => v.map((nombre, i) => ({ nombre, id: p + i }));
    const integrantes = ids(f.contexto.integrantes, "i"), autorId = integrantes.find(x => x.nombre === f.contexto.autor)!.id;
    for (const c of f.casos) for (const [v, b] of Object.entries(c.brazos)) {
      if (b.estado !== "valida") continue;
      const r = contratoInterpretacion.parse(b.resultado), esp = contratoInterpretacion.parse(c.esperado);
      const m = (porVersion[v] ??= { respuestas: 0, acciones: 0, listas: 0, listasConError: 0, listasSinPar: 0, porCompletar: 0, porCompletarCorrectas: 0 });
      const s = iniciarRevision(r, { texto: c.texto, autorId, personas: ids(f.contexto.personas_a_cargo, "p"), ambitos: ids(f.contexto.ambitos, "a"), integrantes })!;
      const pares = auditarAcciones(r, esp).pares; m.respuestas++;
      for (const it of s.items) {
        m.acciones++; const p = pares.find(x => x.actual === it.id);
        const error = !p || p.campos.length > 0 || r.elementos[it.id].tipo !== esp.elementos[p.esperado].tipo;
        if (it.borrador.estado === "lista") { m.listas++; if (!p) m.listasSinPar++; else if (error) m.listasConError++; }
        else { m.porCompletar++; if (!error) m.porCompletarCorrectas++; }
      }
    }
  }
  return porVersion;
}
test("M-1 acciones preseleccionadas como «listas» que no coinciden con la referencia (fixtures versionados)", () => {
  const dir = "src/laboratorio/fixtures";
  const r = medirListas(readdirSync(dir).map(n => JSON.parse(readFileSync(dir + "/" + n, "utf8")) as Fixture));
  console.log("LISTAS_EQUIVOCADAS", JSON.stringify(r));
  const t = Object.values(r).reduce((a, x) => ({ respuestas: a.respuestas + x.respuestas, listas: a.listas + x.listas, malas: a.malas + x.listasConError + x.listasSinPar, pc: a.pc + x.porCompletar, pcOk: a.pcOk + x.porCompletarCorrectas }), { respuestas: 0, listas: 0, malas: 0, pc: 0, pcOk: 0 });
  // Cifras fijadas para que cualquier cambio sea visible; no son puertas de aceptación.
  expect(t).toEqual({ respuestas: 122, listas: 117, malas: 19, pc: 36, pcOk: 25 });
});
test.runIf(existsSync("/tmp/revision-replay/laboratorio-norka.html"))("M-2 misma medición sobre el HTML del laboratorio (254 respuestas, solo CI)", () => {
  const h = readFileSync("/tmp/revision-replay/laboratorio-norka.html", "utf8");
  const m = h.match(/<script type="application\/json" id="datos">([\s\S]*?)<\/script>/);
  if (!m) throw Error("REPLAY_AUSENTE");
  console.log("LISTAS_EQUIVOCADAS_LAB", JSON.stringify(medirListas(JSON.parse(m[1]) as Fixture[])));
});

// ---------------------------------------------------------------- 6 · integridad del conjunto de desarrollo nuevo
type Caso = { id: string; grupo: string; texto: string; esperado: unknown; contexto?: string; decision?: string; prohibido?: { indice?: number; campo: string; valor?: string; contiene?: string }[] };
const RUTA = "docs/inteligencia/auditoria-universal-2026-11-27/resultados/casos-desarrollo-nuevos.json";
const ngramas = (s: string, n = 5) => { const w = s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().match(/[a-z0-9]+/g) ?? []; return new Set(w.slice(0, Math.max(0, w.length - n + 1)).map((_, i) => w.slice(i, i + n).join(" "))); };
test("D-1 casos nuevos: contrato válido, entidades del contexto, prohibiciones coherentes y sin solapamiento con corpus oficial, demostraciones ni desarrollo previo", () => {
  const d = JSON.parse(readFileSync(RUTA, "utf8")) as { personas_a_cargo: string[]; integrantes: string[]; autor: string; ambitos: string[]; contextos: Record<string, { ambitos: string[] }>; casos: Caso[] };
  expect(new Set(d.casos.map(c => c.id)).size).toBe(d.casos.length);
  expect(new Set(d.casos.map(c => c.texto)).size).toBe(d.casos.length);
  const otros: string[] = [];
  for (const n of readdirSync("evals").filter(x => /^(captura-cl|desarrollo-.*)\.json$/.test(x))) otros.push(...(JSON.parse(readFileSync("evals/" + n, "utf8")).casos as { texto: string }[]).map(c => c.texto));
  otros.push(...[...instruccionesCapturaV75.matchAll(/^T: (.*)$/gm)].map(m => m[1]));
  const vistos = new Set(otros.flatMap(t => [...ngramas(t)]));
  for (const c of d.casos) {
    const e = contratoInterpretacion.parse(c.esperado);
    const ambitos = c.contexto ? d.contextos[c.contexto].ambitos : d.ambitos;
    for (const x of e.elementos) {
      if (x.persona_a_cargo) expect(d.personas_a_cargo).toContain(x.persona_a_cargo);
      if (x.ambito) expect(ambitos).toContain(x.ambito);
      if (x.dirigida_a) { expect(d.integrantes).toContain(x.dirigida_a); expect(x.dirigida_a).not.toBe(d.autor); }
    }
    for (const p of c.prohibido ?? []) for (const [i, x] of e.elementos.entries()) {
      if (p.indice !== undefined && p.indice !== i) continue;
      const v = (x as Record<string, unknown>)[p.campo];
      if (p.valor !== undefined) expect(v, c.id).not.toBe(p.valor);
      if (p.contiene !== undefined) expect(String(v).toLowerCase(), c.id).not.toContain(p.contiene);
    }
    expect([...ngramas(c.texto)].filter(g => vistos.has(g)), c.id).toEqual([]);
  }
  expect(d.casos.filter(c => c.grupo === "finanzas").length).toBeGreaterThanOrEqual(15);
  expect(d.casos.filter(c => c.grupo === "tiempo").length).toBeGreaterThanOrEqual(15);
});
