import {test,expect} from "vitest";
import {readFileSync,writeFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {ejecutarB77} from "./desarrollo-b-v7-7";
test("B 7.7 · exclusivamente desarrollo sintético autorizado",async()=>{
 if(process.env.NORKA_B77_AUTORIZADA!=="1"||!process.env.GEMINI_API_KEY||process.env.GITHUB_RUN_ATTEMPT!=="1")throw Error("B_NO_AUTORIZADA");
 const s=JSON.parse(readFileSync("evals/solicitud-b-v7-7.json","utf8"));
 expect(s).toMatchObject({modo:"desarrollo-B",version:"7.7",maxCasos:52,modelo:"gemini-3.5-flash-lite",presupuestoAdicional:0,revisionTecnica:"34cc0c0b4f7428c9e8d948acbeed76544a9f9735"});
 if(execFileSync("git",["rev-parse","HEAD^"],{encoding:"utf8"}).trim()!==s.revisionEjecutor)throw Error("REVISION_EJECUTOR_INVALIDA");
 let previo=0;
 const r=await ejecutarB77({clave:process.env.GEMINI_API_KEY,transporte:fetch,esperar:ms=>new Promise(r=>setTimeout(r,ms)),progreso:x=>{writeFileSync("evals/salida-b-v7-7.json",JSON.stringify({modo:"desarrollo-B",version:"7.7",modelo:s.modelo,revision:process.env.GITHUB_SHA,...x},null,2));if(x.resumen.solicitudes!==previo){previo=x.resumen.solicitudes;console.log("PROGRESO_B",JSON.stringify({solicitudes:previo,validas:x.resumen.validas,parada:x.parada}));}}});
 console.log("RESUMEN_B77",JSON.stringify({parada:r.parada,...r.resumen}));
 // A protocol stop is not a successful complete evaluation.
 expect(r.parada).toBeNull();expect(r.resumen.validas).toBe(52);
},900000);
