import {test,expect} from "vitest";
import {readFileSync} from "node:fs";
import {cargarFixtures} from "./replay-validadores";
import {validarV76} from "../src/core/usecases/validar-interpretacion-v7-6";
import {validarV77,PASOS_V77} from "../src/core/usecases/validar-interpretacion-v7-7";
import {medirAcciones77} from "./metricas-acciones-v7-7";
import {capa} from "./comparacion-v7-2";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
import type {SalidaInternaV71} from "../src/core/contracts/interpretacion-interna-v7-1";
type Ctx=Parameters<typeof validarV76>[1];
type Caso={fuente:string;id:number;version:string;ctx:Ctx;interna:SalidaInternaV71;bruta:Interpretacion;esperado:Interpretacion};
test("ablación V7.7 en salidas históricas, sin proveedor",()=>{
 const casos:Caso[]=[];
 for(const f of cargarFixtures())for(const c of f.casos)for(const [version,b] of Object.entries(c.brazos)){
  if(version==="6.0"||b.estado!=="valida"||!b.brutaInterna||!b.bruta)continue;
  casos.push({fuente:f.fuente.run,id:c.id,version,ctx:{fecha:f.contexto.fecha,texto:c.texto,personas:f.contexto.personas_a_cargo,integrantes:f.contexto.integrantes,ambitos:f.contexto.ambitos,autor:f.contexto.autor},interna:b.brutaInterna,bruta:b.bruta,esperado:c.esperado});
 }
 const antiguos=casos.length;
 const c73=JSON.parse(readFileSync("evals/desarrollo-v7-3.json","utf8"));
 const j=JSON.parse(readFileSync("/tmp/replay-v73/salida-eval-v7-3.json","utf8"));
 expect(j.corpus).toBe("desarrollo-v7-3");expect(j.resumen.modo).toBe("desarrollo");
 for(const d of j.detalle){
  if(d.version==="6.0"||d.estado!=="valida"||!d.brutaInterna||!d.bruta)continue;
  const c=c73.casos.find((x:{id:number})=>x.id===d.id);
  casos.push({fuente:"45994191002",id:d.id,version:d.version,ctx:{fecha:c73.fecha,texto:c.texto,personas:c73.personas_a_cargo,integrantes:c73.integrantes,ambitos:c73.ambitos,autor:c73.autor},interna:d.brutaInterna,bruta:d.bruta,esperado:c.esperado});
 }
 for(const [dir,archivo,corpus,fuente] of [["v74","salida-eval-v7-4.json","desarrollo-v7-4","46034647175"],["v75","salida-eval-v7-5.json","desarrollo-v7-5","46037265864"],["resistencia","salida-eval-v7-5.json","desarrollo-v7-4","46039721333"]]){
 const j=JSON.parse(readFileSync("/tmp/replay-"+dir+"/"+archivo,"utf8")),c=JSON.parse(readFileSync("evals/"+corpus+".json","utf8"));
 expect(j.corpus).toBe(corpus);expect(j.resumen.modo).toBe("desarrollo");expect(j.resumen.comparacionCompleta).toBe(true);
 for(const d of j.detalle){if(d.version==="6.0"||d.estado!=="valida"||!d.brutaInterna||!d.bruta)continue;const q=c.casos.find((x:{id:number})=>x.id===d.id);casos.push({fuente,id:d.id,version:d.version,ctx:{fecha:c.fecha,texto:q.texto,personas:c.personas_a_cargo,integrantes:c.integrantes,ambitos:c.ambitos,autor:c.autor},interna:d.brutaInterna,bruta:d.bruta,esperado:q.esperado});}
 }
 expect(antiguos).toBe(61);expect(casos.length).toBe(173);
 const medir=(c:Caso,pasos:readonly (typeof PASOS_V77)[number][])=>{const r=pasos.length?validarV77(structuredClone(c.interna),c.ctx,pasos):validarV76(structuredClone(c.interna),c.ctx);const a=contratoInterpretacion.parse(r.publica),m=capa(a,c.esperado),s=medirAcciones77(a,c.esperado);return {principal:m.principal,estricta:m.estricta,correctas:s.correctas,sustituidas:s.sustituidas,ajustes:r.ajustes.filter(a=>a.motivo.startsWith("v77_"))};};
 let previo=casos.map(c=>medir(c,[]));
 const resumen=(f:typeof previo)=>({principal:f.filter(x=>x.principal).length,estricta:f.filter(x=>x.estricta).length,correctas:f.reduce((s,x)=>s+x.correctas,0),sustituidas:f.reduce((s,x)=>s+x.sustituidas,0)});
 expect(resumen(previo).estricta).toBe(156);
 const filas=[{paso:"A0",...resumen(previo),activaciones:0,empeoran:[] as string[]}];
 for(let i=1;i<=PASOS_V77.length;i++){
  const actual=casos.map(c=>medir(c,PASOS_V77.slice(0,i)));
  const empeoran=actual.flatMap((m,j)=>{const p=previo[j],c=casos[j];return (p.principal&&!m.principal||p.estricta&&!m.estricta||p.correctas>m.correctas||p.sustituidas<m.sustituidas)?[c.fuente+"#"+c.id+"/"+c.version]:[];});
  const activaciones=actual.reduce((s,x,j)=>s+Math.max(0,x.ajustes.length-previo[j].ajustes.length),0);
  filas.push({paso:PASOS_V77[i-1],...resumen(actual),activaciones,empeoran});previo=actual;
 }
 console.log("ABLACION_V77",JSON.stringify(filas));
 expect(filas.flatMap(x=>x.empeoran)).toEqual([]);
});
