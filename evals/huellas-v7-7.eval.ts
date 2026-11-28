import {test,expect} from "vitest";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {huellasV77} from "./comparacion-v7-7";
import {prepararDesarrollo77} from "./preparar-desarrollo-v7-7";
export function instantaneaV77(){
 const archivos=["evals/captura-cl.json","docs/inteligencia/auditoria-universal-2026-11-27/resultados/casos-desarrollo-nuevos.json","src/core/contracts/interpretacion.ts","src/core/contracts/interpretacion-interna-v7-1.ts","src/core/usecases/prefiltro-ia.ts","src/core/usecases/fecha-captura.ts","src/data/fecha-captura-zona.ts","src/core/usecases/calendario-captura.ts","src/core/usecases/interpretacion.ts","src/laboratorio/revision-sintetica.ts","src/laboratorio/motor-revision-universal.ts","src/laboratorio/preseleccion-v7-7.ts","evals/auditar-acciones.ts","evals/comparacion-v7-2.ts","evals/metricas-acciones-v7-7.ts","evals/preparar-desarrollo-v7-7.ts","evals/puertas-v7-7.ts","evals/replay-v7-7.eval.ts","evals/listas-v7-7.eval.ts","src/data/gemini-sintetico.ts","src/data/gemini-sintetico-v7-6.ts","src/core/usecases/revisar-interpretacion.ts"];
 return {huellas:huellasV77(),archivos:Object.fromEntries(archivos.map(p=>[p,createHash("sha256").update(readFileSync(p)).digest("hex")]))};
}
test("preflight sin proveedor: solicitud intacta, corpus preparado y huellas",()=>{const x=instantaneaV77();expect(x.huellas["7.7"].instruccion).toBe(x.huellas["7.5"].instruccion);const p=prepararDesarrollo77();expect(p.solicitudesRealizadas).toBe(0);console.log("HUELLAS_V77",JSON.stringify(x));console.log("DESARROLLO_B_PREVIO",JSON.stringify({casos:p.entradas.length,locales:p.locales,enviables:p.enviables,diagnostico:p.diagnostico,solicitudes:0}));});
