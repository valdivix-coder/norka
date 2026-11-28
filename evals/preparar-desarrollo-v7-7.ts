// Offline preflight. No provider client, credentials or fetch.
import {readFileSync} from "node:fs";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
import {debeOmitirIA} from "../src/core/usecases/prefiltro-ia";
import type {Prohibido} from "./metricas-acciones-v7-7";
import type {CorpusEvaluable} from "./comparacion-v7-7";
const RUTA="docs/inteligencia/auditoria-universal-2026-11-27/resultados/casos-desarrollo-nuevos.json";
type Caso={id:string;grupo:string;texto:string;esperado:Interpretacion;contexto?:string;decision?:string;capa:string;prohibido?:Prohibido[]};
type Corpus={fecha:string;zona_horaria:string;personas_a_cargo:string[];tipos_persona?:Record<string,"hijo"|"mascota"|"hogar">;integrantes:string[];autor:string;ambitos:string[];contextos:Record<string,{ambitos:string[]}>;casos:Caso[]};
export function prepararDesarrollo77(){
 const c=JSON.parse(readFileSync(RUTA,"utf8")) as Corpus;
 if(c.casos.length!==54||new Set(c.casos.map(x=>x.id)).size!==54)throw Error("CORPUS_CONTRASTIVO_INVALIDO");
 const entradas=c.casos.map((x,i)=>{
  const esperado=contratoInterpretacion.parse(x.esperado);
  const prefiltro=debeOmitirIA(x.texto);
  const local=x.capa==="prefiltro"||prefiltro.omitir;
  const ambitos=x.contexto?c.contextos[x.contexto]?.ambitos:c.ambitos;
  if(!ambitos)throw Error("CONTEXTO_INVALIDO");
  const corpus:CorpusEvaluable={fecha:c.fecha,zona_horaria:c.zona_horaria,personas_a_cargo:c.personas_a_cargo,integrantes:c.integrantes,autor:c.autor,ambitos,...(c.tipos_persona?{tipos_persona:c.tipos_persona}:{}),casos:[{id:i+1,texto:x.texto,esperado,prohibido:x.prohibido}]};
  // Original T03 predates D33 and expects day with null hour, contrary to the approved
  // midnight rule. Keep it intact and report separately; do not silently change expected labels.
  return {id:x.id,grupo:x.grupo,capa:x.capa,decision:x.decision??null,local,prefiltro,soloDiagnostico:x.id==="T03",corpus};
 });
 return {entradas,locales:entradas.filter(x=>x.local).map(x=>x.id),enviables:entradas.filter(x=>!x.local).length,diagnostico:entradas.filter(x=>x.soloDiagnostico).map(x=>x.id),solicitudesRealizadas:0};
}
