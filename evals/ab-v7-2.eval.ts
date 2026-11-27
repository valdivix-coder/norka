// Evaluación real 7.2 (solo CI, secreto GEMINI_API_KEY). Corpus exclusivamente sintéticos y versionados.
// modo aceptacion: corpus oficial intacto, puertas y paradas del encargo; modo desarrollo: corpus de desarrollo,
// sin puertas (nunca es aceptación). Mide tokens y latencia de las solicitudes reales vía usageMetadata.
import { readFileSync, writeFileSync } from "node:fs";
import { test, expect } from "vitest";
import { ejecutarComparacionV72, type CorpusEvaluable } from "./comparacion-v7-2";

const CORPUS_PERMITIDOS = { oficial: "evals/captura-cl.json", "desarrollo-v7-2": "evals/desarrollo-v7-2.json", "desarrollo-v7-2-tipos": "evals/desarrollo-v7-2-tipos.json" } as const;

test("Gemini 7.2: evaluación sintética pareada", async () => {
  const clave = process.env.GEMINI_API_KEY;
  if (process.env.GEMINI_EVAL_ACTIVA !== "1" || !clave) throw new Error("Evaluación no ejecutada: requiere GEMINI_EVAL_ACTIVA=1 y GEMINI_API_KEY en CI.");
  const modo = process.env.GEMINI_V72_MODO === "desarrollo" ? "desarrollo" : "aceptacion";
  const nombre = (process.env.GEMINI_V72_CORPUS ?? "oficial") as keyof typeof CORPUS_PERMITIDOS;
  if (!(nombre in CORPUS_PERMITIDOS)) throw new Error("CORPUS_NO_PERMITIDO");
  if (modo === "aceptacion" && nombre !== "oficial") throw new Error("ACEPTACION_SOLO_CORPUS_OFICIAL");
  if (modo === "desarrollo" && nombre === "oficial") throw new Error("DESARROLLO_NO_USA_CORPUS_OFICIAL");
  const corpus = JSON.parse(readFileSync(CORPUS_PERMITIDOS[nombre], "utf8")) as CorpusEvaluable;
  const lineas: string[] = [];
  const salida = await ejecutarComparacionV72({ clave, corpus, modo, semilla: Number(process.env.GEMINI_AB_SEMILLA ?? "20261128"), registrar: l => { lineas.push(l); console.log(l); } });
  writeFileSync("evals/salida-eval-v7-2.json", JSON.stringify({ corpus: nombre, ...salida }, null, 2));
  console.log("RESUMEN", JSON.stringify(salida.resumen));
  console.log("REPETICIONES_D19", JSON.stringify(salida.repeticiones.map(r=>({id:r.id,clasificacion:r.clasificacion,detalle:r.detalle.map(d=>({version:d.version,estado:d.estado,metricas:d.metricas,bruta:d.bruta,resultado:d.resultado,alertas:d.alertas}))}))));
  // Detalle sintético por caso para auditoría (sin datos reales): brutas y normalizadas compactas.
  for (const d of salida.detalle) if (d.estado === "valida") console.log("DETALLE", JSON.stringify({ id: d.id, v: d.version, bruta: d.bruta?.elementos.map(e => [e.tipo, e.titulo, e.persona_a_cargo, e.ambito, e.plazo_fecha, e.plazo_hora, e.recurrencia && [e.recurrencia.tipo, e.recurrencia.cada, e.recurrencia.dias.join("+")], e.dirigida_a, e.confianza]), ajustes: d.ajustes?.map(a => a.indice + ":" + a.campo + ":" + a.motivo), interna: d.version === "7.2" ? (d.brutaInterna as { elementos: { persona_base: string; tiempo: string[]; alcance: string }[] } | undefined)?.elementos.map(e => [e.persona_base, e.tiempo.join("|"), e.alcance]) : undefined }));
  if (modo === "desarrollo") { expect(salida.resumen.parada).toBeNull(); for(const b of Object.values(salida.resumen.brazos))expect(b.validas).toBe(corpus.casos.length); return; }
  const b6 = salida.resumen.brazos["6.0"], b7 = salida.resumen.brazos["7.2"], n = corpus.casos.length;
  expect(salida.resumen.parada).toBeNull();
  for (const b of [b6, b7]) { expect(b.validas).toBe(n); expect(b.fallidas).toBe(0); }
  for (const k of ["principalBruta", "estrictaBruta", "principalNormalizada", "estrictaNormalizada"] as const) expect(b7[k] / n).toBeGreaterThanOrEqual(.9);
  expect(b7.casosEmpeorados).toHaveLength(0);
  expect(b7.consumo.sinMedicion).toBe(0);expect(b6.consumo.sinMedicion).toBe(0);
  expect(b7.consumo.entrada).toBeLessThanOrEqual(b6.consumo.entrada*1.1);
  expect(b7.medianaMs!).toBeLessThanOrEqual(b6.medianaMs!*1.3);
  expect(b7.camposBrutosDiscrepantes).toBe(0); expect(b7.porAccionBruta).toBe(0);
  expect(b7.camposInventados).toBe(0); expect(b7.porAccion).toBe(0);
}, 4_500_000);
