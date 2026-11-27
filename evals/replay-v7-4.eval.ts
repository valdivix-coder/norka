import {test,expect} from "vitest";
import {readFileSync} from "node:fs";
import {cargarFixtures} from "./replay-validadores";
import {validarV73} from "../src/core/usecases/validar-interpretacion-v7-3";
import {validarV74} from "../src/core/usecases/validar-interpretacion-v7-4";
import {capa} from "./comparacion-v7-2";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
import type {SalidaInternaV71} from "../src/core/contracts/interpretacion-interna-v7-1";
type Ctx=Parameters<typeof validarV74>[1];
type Caso={fuente:string;id:number;version:string;ctx:Ctx;interna:SalidaInternaV71;bruta:Interpretacion;esperado:Interpretacion};
test("replay independiente V7.4 en salidas históricas, sin proveedor",()=>{
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
 const filas=casos.map(c=>{const br=capa(c.bruta,c.esperado);const a=validarV73(structuredClone(c.interna),c.ctx);const b=validarV74(structuredClone(c.interna),c.ctx);const ma=capa(contratoInterpretacion.parse(a.publica),c.esperado),mb=capa(contratoInterpretacion.parse(b.publica),c.esperado);return {fuente:c.fuente,id:c.id,version:c.version,bruta:br.estricta,v73:ma.estricta,v74:mb.estricta,ajustes:b.ajustes};});
 const resumen=(f:typeof filas)=>({n:f.length,bruta:f.filter(x=>x.bruta).length,v73:f.filter(x=>x.v73).length,v74:f.filter(x=>x.v74).length,mejoran:f.filter(x=>!x.v73&&x.v74),empeoran:f.filter(x=>x.v73&&!x.v74)});
 const r={antiguos:resumen(filas.slice(0,antiguos)),desarrollo73:resumen(filas.slice(antiguos)),total:resumen(filas)};
 console.log("REPLAY_V74",JSON.stringify(r));
 expect(antiguos).toBe(61);expect(casos.length).toBe(105);
 expect(r.antiguos.v73).toBe(55);
 // Comparación de la misma salida: no sustituye el examen oficial.
 expect(r.total.empeoran).toHaveLength(0);
});
