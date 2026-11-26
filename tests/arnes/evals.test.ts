import {readFileSync} from "node:fs";
import {describe,it,expect} from "vitest";
import {contratoInterpretacion} from "../../src/core/contracts/interpretacion";
const suite=JSON.parse(readFileSync("evals/captura-cl.json","utf8")) as {casos:{id:number;grupos:string[];texto:string;esperado:unknown}[]};
describe("Corpus 2.5",()=>{
  it("contiene exactamente 50 frases únicas y expectativas válidas",()=>{
    expect(suite.casos).toHaveLength(50);
    expect(new Set(suite.casos.map(c=>c.texto)).size).toBe(50);
    for(const c of suite.casos)expect(contratoInterpretacion.safeParse(c.esperado).success,`caso ${c.id}`).toBe(true);
  });
  it("respeta los seis recuentos del prompt y el control sin plazo",()=>{
    for(const [g,n] of Object.entries({multiples:10,recurrencia:10,propuestas:10,pagos:10,ambiguas:5,nombres_desconocidos:5,sin_plazo:1}))
      expect(suite.casos.filter(c=>c.grupos.includes(g))).toHaveLength(n);
  });
});
