// Evaluación real 7.1 (solo CI, secreto GEMINI_API_KEY). Corpus exclusivamente sintéticos y versionados.
// modo aceptacion: corpus oficial intacto, puertas y paradas del encargo; modo desarrollo: corpus de desarrollo,
// sin puertas (nunca es aceptación). Además mide tokens de entrada con countTokens (no genera contenido).
import { readFileSync, writeFileSync } from "node:fs";
import { test, expect } from "vitest";
import { ejecutarComparacionV71, MODELO_AB, type CorpusEvaluable } from "./comparacion-v7-1";
import { solicitudV71 } from "../src/data/gemini-sintetico-v7-1";
import { instruccionesCaptura } from "../src/data/prompt-captura";
import { contratoInterpretacion } from "../src/core/contracts/interpretacion";
import { z } from "zod";

const CORPUS_PERMITIDOS = { oficial: "evals/captura-cl.json", "desarrollo-v7-1": "evals/desarrollo-v7-1.json", "desarrollo-v7-1-catalogo": "evals/desarrollo-v7-1-catalogo.json", "desarrollo-v6": "evals/desarrollo-cl-v6.json" } as const;

async function contarTokens(clave: string, cuerpo: unknown) {
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + MODELO_AB + ":countTokens", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": clave }, body: JSON.stringify({ generateContentRequest: { model: "models/" + MODELO_AB, ...(cuerpo as object) } }) });
  if (!r.ok) return { error: "HTTP " + r.status };
  return await r.json() as { totalTokens?: number };
}

test("Gemini 7.1: evaluación sintética pareada", async () => {
  const clave = process.env.GEMINI_API_KEY;
  if (process.env.GEMINI_EVAL_ACTIVA !== "1" || !clave) throw new Error("Evaluación no ejecutada: requiere GEMINI_EVAL_ACTIVA=1 y GEMINI_API_KEY en CI.");
  const modo = process.env.GEMINI_V71_MODO === "desarrollo" ? "desarrollo" : "aceptacion";
  const nombre = (process.env.GEMINI_V71_CORPUS ?? "oficial") as keyof typeof CORPUS_PERMITIDOS;
  if (!(nombre in CORPUS_PERMITIDOS)) throw new Error("CORPUS_NO_PERMITIDO");
  if (modo === "aceptacion" && nombre !== "oficial") throw new Error("ACEPTACION_SOLO_CORPUS_OFICIAL");
  if (modo === "desarrollo" && nombre === "oficial") throw new Error("DESARROLLO_NO_USA_CORPUS_OFICIAL");
  const corpus = JSON.parse(readFileSync(CORPUS_PERMITIDOS[nombre], "utf8")) as CorpusEvaluable;
  // Tokens de entrada medidos (misma entrada, primer caso) antes de generar.
  const ctx = { fecha: corpus.fecha, zona_horaria: corpus.zona_horaria, personas_a_cargo: corpus.personas_a_cargo, integrantes: corpus.integrantes, autor: corpus.autor, ambitos: corpus.ambitos };
  const caso = corpus.casos[0];
  const cuerpoV6 = { systemInstruction: { parts: [{ text: instruccionesCaptura + "\nDevuelve {elementos:[...]}." }] }, contents: [{ parts: [{ text: JSON.stringify({ contexto: ctx, entradas: { id: caso.id, texto: caso.texto } }) }] }], generationConfig: { responseMimeType: "application/json", responseJsonSchema: z.toJSONSchema(contratoInterpretacion), temperature: 0 } };
  const tokens = { "6.0": await contarTokens(clave, cuerpoV6), "7.1": await contarTokens(clave, solicitudV71({ ...ctx, casos: corpus.casos }, [{ id: caso.id, texto: caso.texto }]).cuerpo) };
  console.log("TOKENS_ENTRADA_COUNT", JSON.stringify(tokens));
  const lineas: string[] = [];
  const salida = await ejecutarComparacionV71({ clave, corpus, modo, semilla: Number(process.env.GEMINI_AB_SEMILLA ?? "20261127"), registrar: l => { lineas.push(l); console.log(l); } });
  writeFileSync("evals/salida-eval-v7-1.json", JSON.stringify({ corpus: nombre, tokensCountTokens: tokens, ...salida }, null, 2));
  console.log("RESUMEN", JSON.stringify(salida.resumen));
  // Detalle sintético por caso para auditoría (sin datos reales): brutas y normalizadas compactas.
  for (const d of salida.detalle) if (d.estado === "valida") console.log("DETALLE", JSON.stringify({ id: d.id, v: d.version, bruta: d.bruta?.elementos.map(e => [e.tipo, e.titulo, e.persona_a_cargo, e.ambito, e.plazo_fecha, e.plazo_hora, e.recurrencia && [e.recurrencia.tipo, e.recurrencia.cada, e.recurrencia.dias.join("+")], e.dirigida_a, e.confianza]), ajustes: d.ajustes?.map(a => a.indice + ":" + a.campo + ":" + a.motivo), interna: d.version === "7.1" ? (d.brutaInterna as { elementos: { persona_base: string; tiempo: string[]; alcance: string }[] } | undefined)?.elementos.map(e => [e.persona_base, e.tiempo.join("|"), e.alcance]) : undefined }));
  if (modo === "desarrollo") { expect(salida.resumen.parada?.motivo ?? "ninguna").not.toBe("cuota_429"); return; }
  const b6 = salida.resumen.brazos["6.0"], b7 = salida.resumen.brazos["7.1"], n = corpus.casos.length;
  expect(salida.resumen.parada).toBeNull();
  for (const b of [b6, b7]) { expect(b.validas).toBe(n); expect(b.fallidas).toBe(0); }
  for (const k of ["principalBruta", "estrictaBruta", "principalNormalizada", "estrictaNormalizada"] as const) expect(b7[k] / n).toBeGreaterThanOrEqual(.9);
  expect(b7.casosEmpeorados).toHaveLength(0);
  expect(b7.camposBrutosDiscrepantes).toBe(0); expect(b7.porAccionBruta).toBe(0);
  expect(b7.camposInventados).toBe(0); expect(b7.porAccion).toBe(0);
}, 4_500_000);
