import {test,expect} from "vitest";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {solicitudV78} from "../src/data/gemini-sintetico-v7-8";
import {solicitudV77} from "../src/data/gemini-sintetico-v7-7";
import {prepararDesarrollo77} from "./preparar-desarrollo-v7-7";
import {instruccionesCapturaV78,sufijoIndividualV78,sufijoLoteV78} from "../src/data/prompt-captura-v7-8";
import {instruccionesCapturaV75} from "../src/data/prompt-captura-v7-5";
const sha=(v:string|Buffer)=>createHash("sha256").update(v).digest("hex");
export function huellas78(){
 const rutas=["src/data/prompt-captura-v7-8.ts","src/data/gemini-sintetico-v7-8.ts","src/core/usecases/semantica-captura-v7-8.ts","src/core/usecases/validar-interpretacion-v7-8.ts","src/laboratorio/preseleccion-v7-8.ts","evals/metricas-semanticas-v7-8.ts","evals/replay-v7-8.eval.ts","tests/arnes/interpretacion-v7-8.test.ts","docs/inteligencia/CONGELACION-V7.7.json","evals/captura-cl.json","docs/inteligencia/auditoria-universal-2026-11-27/resultados/casos-desarrollo-nuevos.json"];
 const c=prepararDesarrollo77().entradas.find(x=>!x.local)!.corpus;
 const q=solicitudV78(c,c.casos).cuerpo.generationConfig.responseJsonSchema;
 const lote=solicitudV78(c,[...c.casos,{id:999,texto:"Ordenar la sala de ensayo"}]).cuerpo.generationConfig.responseJsonSchema;
 return {instruccion:sha(instruccionesCapturaV78),individual:sha(sufijoIndividualV78),lote:sha(sufijoLoteV78),esquema:sha(JSON.stringify(q)),esquemaLote:sha(JSON.stringify(lote)),archivos:Object.fromEntries(rutas.map(p=>[p,sha(readFileSync(p))]))};
}
test("V7.8 preflight: identical structure on 52 eligible synthetic requests, no provider",()=>{
 const p=prepararDesarrollo77();expect(p.locales).toEqual(["N06","N07"]);expect(p.enviables).toBe(52);
 for(const x of p.entradas.filter(x=>!x.local)){const a=solicitudV78(x.corpus,x.corpus.casos),b=solicitudV77(x.corpus,x.corpus.casos);expect(a.cuerpo.contents).toEqual(b.cuerpo.contents);expect(a.cuerpo.generationConfig).toEqual(b.cuerpo.generationConfig);}
 const a=instruccionesCapturaV75.length,b=instruccionesCapturaV78.length;
 console.log("PRESUPUESTO_V78",JSON.stringify({charsV75:a,charsV78:b,diferencia:b-a,porcentaje:(b/a-1)*100,tokens:"NO_VERIFICADO",solicitudes:0}));
 console.log("HUELLAS_V78",JSON.stringify(huellas78()));
});
