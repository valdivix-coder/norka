import {test,expect} from "vitest";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
import {medirListas77} from "./metricas-acciones-v7-7";
type Fixture={fuente:{run:string;corpus:string;modo:string};contexto:{personas_a_cargo:string[];ambitos:string[];integrantes:string[];autor:string};casos:{id:number;texto:string;referencia:string[];brazos:Record<string,{estado:string;resultado:unknown}>}[]};
const FUENTES:Record<string,string>={"45922944781":"desarrollo-v7-1","45923853986":"desarrollo-v7-1-catalogo","45928250323":"desarrollo-v7-2","45994191002":"desarrollo-v7-3","46034647175":"desarrollo-v7-4","46037265864":"desarrollo-v7-5"};
test("M2: 254 respuestas, recuperar etiquetas completas del corpus sintético intacto",()=>{
 const bytes=readFileSync("/tmp/v77-lab/laboratorio-norka.html");
 expect(createHash("sha256").update(bytes).digest("hex")).toBe("36e32e907138a09cfd8a92fd473810a56d12845e57e2093761a41dcaaf509a36");
 const m=bytes.toString("utf8").match(/<script type="application\/json" id="datos">([\s\S]*?)<\/script>/);if(!m)throw Error("REPLAY_AUSENTE");
 const f=JSON.parse(m[1]) as Fixture[],tot:Record<string,ReturnType<typeof medirListas77>&{respuestas:number}>={};
 let capturas=0,respuestas=0;
 for(const x of f){
  const corpus=FUENTES[x.fuente.run];expect(corpus).toBe(x.fuente.corpus);expect(x.fuente.modo).toBe("desarrollo");
  const j=JSON.parse(readFileSync("evals/"+corpus+".json","utf8")) as {casos:{id:number;texto:string;esperado:Interpretacion}[]};
  const ids=(xs:string[],p:string)=>xs.map((nombre,i)=>({nombre,id:p+i})),integrantes=ids(x.contexto.integrantes,"i"),autorId=integrantes.find(i=>i.nombre===x.contexto.autor)?.id;
  expect(autorId).toBeDefined();
  for(const c of x.casos){capturas++;const ref=j.casos.find(q=>q.id===c.id);expect(ref?.texto).toBe(c.texto);const e=contratoInterpretacion.parse(ref?.esperado);expect(e.elementos.map(a=>a.titulo)).toEqual(c.referencia);
   for(const [v,b] of Object.entries(c.brazos)){if(b.estado!=="valida")continue;respuestas++;
    const a=contratoInterpretacion.parse(b.resultado),n=medirListas77(a,e,{texto:c.texto,autorId:autorId!,personas:ids(x.contexto.personas_a_cargo,"p"),ambitos:ids(x.contexto.ambitos,"a"),integrantes});
    const t=tot[v]??={respuestas:0,listas:0,listasErrorCampos:0,listasErrorTitulo:0,listasConError:0,pendientes:0,pendientesCoincidentes:0};t.respuestas++;
    for(const k of Object.keys(n) as (keyof typeof n)[])t[k]+=n[k];
   }
  }
 }
 const suma=Object.values(tot).reduce((a,x)=>({listas:a.listas+x.listas,pendientes:a.pendientes+x.pendientes,erroresCampos:a.erroresCampos+x.listasErrorCampos,erroresTitulo:a.erroresTitulo+x.listasErrorTitulo,errores:a.errores+x.listasConError,pendientesCoincidentes:a.pendientesCoincidentes+x.pendientesCoincidentes}),{listas:0,pendientes:0,erroresCampos:0,erroresTitulo:0,errores:0,pendientesCoincidentes:0});
 console.log("M2_V77",JSON.stringify({capturas,respuestas,porVersion:tot,total:suma}));
 expect(capturas).toBe(105);expect(respuestas).toBe(254);expect(suma.listas).toBe(274);expect(suma.pendientes).toBe(93);
});
