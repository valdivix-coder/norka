// Auditoría adicional; copia del cargador congelado de replay-v7-8.eval.ts (6263d1f), sin alterar la evaluación original.
import {test,expect} from "vitest";
import {readFileSync,writeFileSync} from "node:fs";
import {cargarFixtures} from "./replay-validadores";
import {validarV76} from "../src/core/usecases/validar-interpretacion-v7-6";
import {validarV78} from "../src/core/usecases/validar-interpretacion-v7-8";
import {medirSemantica78} from "./metricas-semanticas-v7-8";
import {prepararDesarrollo77} from "./preparar-desarrollo-v7-7";
import {createHash} from "node:crypto";
import {medirAcciones77} from "./metricas-acciones-v7-7";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
import type {SalidaInternaV71} from "../src/core/contracts/interpretacion-interna-v7-1";
type Ctx=Parameters<typeof validarV76>[1];
type Caso={fuente:string;id:number;version:string;ctx:Ctx;interna:SalidaInternaV71;bruta:Interpretacion;esperado:Interpretacion};
test("contraste residual V7.8 sobre 187 respuestas sintéticas archivadas",()=>{
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

 // Only archived synthetic development inputs. Never import a transport or real family store.
 const filas=casos.flatMap(c=>{
  const a=contratoInterpretacion.parse(validarV78(structuredClone(c.interna),c.ctx).publica);
  const ids=(xs:readonly string[],p:string)=>xs.map((nombre,i)=>({nombre,id:p+i}));
  const integrantes=ids(c.ctx.integrantes,"i"),autorId=integrantes.find(x=>x.nombre===c.ctx.autor)!.id;
  const ctx={texto:c.ctx.texto,autorId,personas:ids(c.ctx.personas,"p"),ambitos:ids(c.ctx.ambitos,"a"),integrantes};
  const m=medirAcciones77(a,c.esperado),sem=medirSemantica78(a,c.esperado,ctx);
  return sem.detalles.map(d=>{
   const p=m.pares.find(x=>x.actual===d.indice);
   const actual=a.elementos[d.indice],esperado=p?c.esperado.elementos[p.esperado]:null;
   return {fuente:c.fuente,id:c.id,version:c.version,indice:d.indice,lista:d.lista,preseleccionada:d.preseleccionada,coincidente:d.coincidente,excesoConfianza:d.excesoConfianza,eliptico:d.eliptico,material:d.material,campos:p?.campos??[],tituloCompatible:p?.tituloCompatible??false,original:c.ctx.texto,actual,esperado};
  });
 });
 const historico=filas.filter(f=>f.fuente!=="B77"),b=filas.filter(f=>f.fuente==="B77");
 const listas=historico.filter(f=>f.lista&&!f.coincidente),pre=historico.filter(f=>f.preseleccionada&&!f.coincidente);
 expect(historico.length).toBe(255);expect(b.length).toBe(17);
 expect(listas.length).toBe(7);expect(pre.length).toBe(2);
 expect(historico.filter(f=>f.excesoConfianza).length).toBe(21);
 expect(b.filter(f=>f.lista&&!f.coincidente)).toEqual([]);
 expect(b.filter(f=>f.preseleccionada&&!f.coincidente)).toEqual([]);
 const clave=(f:typeof filas[number])=>f.fuente+"#"+f.id+"/"+f.version+"/"+f.indice;
 expect(pre.every(f=>listas.some(x=>clave(x)===clave(f)))).toBe(true);
 // All cases here are fictitious, but minimize logs: detailed synthetic evidence is a separate artifact.
 const residual={listas,preselecciones:pre.map(clave),confianzaB:b.filter(f=>f.excesoConfianza),elipsisB:b.filter(f=>f.eliptico)};
 writeFileSync("/tmp/contraste-residual-v78.json",JSON.stringify(residual,null,2));
 console.log("RESIDUAL_V78",JSON.stringify({historicas:historico.length,b:b.length,listas:listas.map(f=>({clave:clave(f),campos:f.campos,tituloCompatible:f.tituloCompatible,material:f.material,preseleccionada:f.preseleccionada})),preselecciones:pre.map(clave),confianzaB:residual.confianzaB.map(clave),elipsisB:residual.elipsisB.map(clave)}));
});
