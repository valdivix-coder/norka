import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {contratoInterpretacion} from "../../src/core/contracts/interpretacion";
describe("Corpus de desarrollo independiente, no examen oficial",()=>{
 it("contiene 50 entradas únicas y expectativas con contrato válido",()=>{
  const d=JSON.parse(readFileSync("evals/desarrollo-cl-v6.json","utf8")) as {casos:{id:number;texto:string;esperado:unknown}[]};
  expect(d.casos).toHaveLength(50);
  expect(new Set(d.casos.map(c=>c.texto)).size).toBe(50);
  for(const c of d.casos)expect(contratoInterpretacion.safeParse(c.esperado).success).toBe(true);
 });
});
