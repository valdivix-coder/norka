import {test,expect} from "vitest";
import {readFileSync} from "node:fs";
import {cargarFixtures} from "./replay-validadores";
import {validarV76} from "../src/core/usecases/validar-interpretacion-v7-6";
import {validarV78,PASOS_V78} from "../src/core/usecases/validar-interpretacion-v7-8";
import {medirSemantica78} from "./metricas-semanticas-v7-8";
import {prepararDesarrollo77} from "./preparar-desarrollo-v7-7";
import {createHash} from "node:crypto";
import {validarV77} from "../src/core/usecases/validar-interpretacion-v7-7";
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

 const bytes=readFileSync("/tmp/replay-b77/salida-b-v7-7.json");
 expect(createHash("sha256").update(bytes).digest("hex")).toBe("94b2bea38f0a847fd077950b53166eac973c6874084da73140bffded99ff58ad");
 const jB=JSON.parse(bytes.toString("utf8"));expect(jB.parada).toBe("F14:alerta_candidata");expect(jB.resumen.validas).toBe(14);
 const pre=prepararDesarrollo77();
 for(const f of jB.filas){if(f.estado!=="valida")continue;const x=pre.entradas.find(x=>x.id===f.id)!;expect(x.local).toBe(false);const q=x.corpus.casos[0],c=x.corpus;casos.push({fuente:"B77",id:q.id,version:"7.7",ctx:{fecha:c.fecha,texto:q.texto,personas:c.personas_a_cargo,integrantes:c.integrantes,ambitos:c.ambitos,autor:c.autor},interna:f.datos.interna,bruta:f.datos.bruta,esperado:q.esperado});}
 expect(casos.length).toBe(187);
 const medir=(c:Caso,pasos:readonly (typeof PASOS_V78)[number][])=>{
 const r=pasos.length?validarV78(structuredClone(c.interna),c.ctx,pasos):validarV77(structuredClone(c.interna),c.ctx);
 const a=contratoInterpretacion.parse(r.publica),m=capa(a,c.esperado),s=medirAcciones77(a,c.esperado),ids=(xs:readonly string[],p:string)=>xs.map((nombre,i)=>({nombre,id:p+i})),integrantes=ids(c.ctx.integrantes,"i"),autorId=integrantes.find(x=>x.nombre===c.ctx.autor)!.id;
 const ctx={texto:c.ctx.texto,autorId,personas:ids(c.ctx.personas,"p"),ambitos:ids(c.ctx.ambitos,"a"),integrantes};
 return {principal:m.principal,estricta:m.estricta,correctas:s.correctas,sustituidas:s.sustituidas,entregadas:s.entregadas,sem:medirSemantica78(a,c.esperado,ctx),ajustes:r.ajustes.filter(a=>a.motivo.startsWith("v78_"))};
 };
 let previo=casos.map(c=>medir(c,[]));
 const resumen=(f:typeof previo)=>({n:f.length,principal:f.filter(x=>x.principal).length,estricta:f.filter(x=>x.estricta).length,correctas:f.reduce((s,x)=>s+x.correctas,0),entregadas:f.reduce((s,x)=>s+x.entregadas,0),sustituidas:f.reduce((s,x)=>s+x.sustituidas,0),listas:f.reduce((s,x)=>s+x.sem.listas,0),listasError:f.reduce((s,x)=>s+x.sem.listasConErrorAmpliado,0),realizadas:f.reduce((s,x)=>s+x.sem.realizadasPendientes,0),condiciones:f.reduce((s,x)=>s+x.sem.condicionesPerdidas,0),excesoConfianza:f.reduce((s,x)=>s+x.sem.excesoConfianza,0),elipticos:f.reduce((s,x)=>s+x.sem.titulosElipticos,0),preseleccionadas:f.reduce((s,x)=>s+x.sem.preseleccionadas,0),preseleccionadasError:f.reduce((s,x)=>s+x.sem.preseleccionadasConError,0)});
 expect(resumen(previo.slice(0,173)).estricta).toBe(156);expect(resumen(previo.slice(173)).estricta).toBe(12);
 const filas=[{paso:"B0",historico:resumen(previo.slice(0,173)),b:resumen(previo.slice(173)),activaciones:0,empeoran:[] as string[]}];
 for(let i=1;i<=PASOS_V78.length;i++){
 const actual=casos.map(c=>medir(c,PASOS_V78.slice(0,i)));
 const empeoran=actual.flatMap((m,j)=>{const p=previo[j],c=casos[j];return p.principal&&!m.principal||p.estricta&&!m.estricta||p.correctas>m.correctas||p.sustituidas<m.sustituidas||p.entregadas!==m.entregadas?[c.fuente+"#"+c.id+"/"+c.version]:[];});
 filas.push({paso:PASOS_V78[i-1],historico:resumen(actual.slice(0,173)),b:resumen(actual.slice(173)),activaciones:actual.reduce((s,x,j)=>s+Math.max(0,x.ajustes.length-previo[j].ajustes.length),0),empeoran});previo=actual;
 }
 console.log("ABLACION_V78",JSON.stringify(filas));expect(filas.flatMap(x=>x.empeoran)).toEqual([]);
 expect(filas.at(-1)!.b.realizadas).toBe(0);expect(filas.at(-1)!.b.condiciones).toBe(0);expect(filas.at(-1)!.b.estricta).toBe(14);
});
