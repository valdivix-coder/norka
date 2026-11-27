// Evaluación real 7.4 (solo CI, secreto GEMINI_API_KEY). Corpus exclusivamente sintéticos y versionados.
// desarrollo: brazos 6.0, 7.3 y 7.4 con la misma entrada (comparación de sistemas, nunca aceptación).
// aceptacion: 6.0 vs 7.4 sobre el corpus oficial intacto, puertas originales y D-19.
import { readFileSync, writeFileSync } from "node:fs";
import { test, expect } from "vitest";
import { ejecutarComparacionV74, type CorpusEvaluable, type VersionV74 } from "./comparacion-v7-4";

const CORPUS_PERMITIDOS = { oficial: "evals/captura-cl.json", "desarrollo-v7-4": "evals/desarrollo-v7-4.json", "desarrollo-v7-2": "evals/desarrollo-v7-2.json", "desarrollo-v7-1": "evals/desarrollo-v7-1.json", "desarrollo-v7-1-catalogo": "evals/desarrollo-v7-1-catalogo.json" } as const;

test("Gemini 7.4: evaluación sintética", async () => {
  const clave = process.env.GEMINI_API_KEY;
  if (process.env.GEMINI_EVAL_ACTIVA !== "1" || !clave) throw new Error("Evaluación no ejecutada: requiere GEMINI_EVAL_ACTIVA=1 y GEMINI_API_KEY en CI.");
  const modo = process.env.GEMINI_V74_MODO === "desarrollo" ? "desarrollo" : "aceptacion";
  const nombre = (process.env.GEMINI_V74_CORPUS ?? "oficial") as keyof typeof CORPUS_PERMITIDOS;
  if (!(nombre in CORPUS_PERMITIDOS)) throw new Error("CORPUS_NO_PERMITIDO");
  if (modo === "aceptacion" && nombre !== "oficial") throw new Error("ACEPTACION_SOLO_CORPUS_OFICIAL");
  if (modo === "desarrollo" && nombre === "oficial") throw new Error("DESARROLLO_NO_USA_CORPUS_OFICIAL");
  const versiones = (process.env.GEMINI_V74_VERSIONES ?? (modo === "aceptacion" ? "6.0,7.4" : "6.0,7.3,7.4")).split(",") as VersionV74[];
  const corpus = JSON.parse(readFileSync(CORPUS_PERMITIDOS[nombre], "utf8")) as CorpusEvaluable;
  const salida = await ejecutarComparacionV74({ clave, corpus, modo, versiones, semilla: Number(process.env.GEMINI_AB_SEMILLA ?? "20261130"), registrar: l => console.log(l) });
  writeFileSync("evals/salida-eval-v7-4.json", JSON.stringify({ corpus: nombre, ...salida }, null, 2));
  console.log("RESUMEN", JSON.stringify(salida.resumen));
  console.log("REPETICIONES_D19", JSON.stringify(salida.repeticiones.map(r => ({ id: r.id, clasificacion: r.clasificacion, detalle: r.detalle.map(d => ({ version: d.version, estado: d.estado, bruta: d.bruta, resultado: d.resultado, alertas: d.alertas })) }))));
  for (const d of salida.detalle) if (d.estado === "valida") console.log("DETALLE", JSON.stringify({ id: d.id, v: d.version, bruta: d.bruta?.elementos.map(e => [e.tipo, e.titulo, e.persona_a_cargo, e.ambito, e.plazo_fecha, e.plazo_hora, e.recurrencia && [e.recurrencia.tipo, e.recurrencia.cada, e.recurrencia.dias.join("+")], e.dirigida_a, e.confianza]), normalizada: d.resultado?.elementos.map(e => [e.persona_a_cargo, e.ambito, e.plazo_fecha, e.plazo_hora]), ajustes: d.ajustes?.map(a => a.indice + ":" + a.campo + ":" + a.motivo), ablacion: d.ablacion }));
  if (modo === "desarrollo") { expect(salida.resumen.parada).toBeNull(); for(const b of Object.values(salida.resumen.brazos))expect(b.validas).toBe(corpus.casos.length); return; }
  const b6 = salida.resumen.brazos["6.0"], b7 = salida.resumen.brazos["7.4"], n = corpus.casos.length;
  expect(salida.resumen.parada).toBeNull();
  for (const b of [b6, b7]) { expect(b.validas).toBe(n); expect(b.fallidas).toBe(0); }
  for (const k of ["principalBruta", "estrictaBruta", "principalNormalizada", "estrictaNormalizada"] as const) expect(b7[k] / n).toBeGreaterThanOrEqual(.9);
  expect(b7.casosEmpeorados).toHaveLength(0);
  expect(b7.consumo.sinMedicion).toBe(0); expect(b6.consumo.sinMedicion).toBe(0);
  expect(b7.consumo.entrada).toBeLessThanOrEqual(b6.consumo.entrada * 1.1);
  expect(b7.medianaMs!).toBeLessThanOrEqual(b6.medianaMs! * 1.3);
  expect(b7.camposBrutosDiscrepantes).toBe(0); expect(b7.porAccionBruta).toBe(0);
  expect(b7.camposInventados).toBe(0); expect(b7.porAccion).toBe(0);
}, 4_500_000);
