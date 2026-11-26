import {readFileSync,writeFileSync} from "node:fs";
import {test,expect} from "vitest";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
type Caso={id:number;texto:string;esperado:Interpretacion};
const corpus=JSON.parse(readFileSync("evals/captura-cl.json","utf8")) as {fecha:string;zona_horaria:string;personas_a_cargo:string[];integrantes:string[];autor:string;ambitos:string[];casos:Caso[]};
const campos=["tipo","persona_a_cargo","ambito","plazo_fecha","plazo_hora","recurrencia","dirigida_a"] as const;
function firma(e:Interpretacion["elementos"][number]){return JSON.stringify(campos.map(k=>k==="recurrencia"&&e.recurrencia?{...e.recurrencia,dias:[...e.recurrencia.dias].sort()}:e[k]));}
test("Gemini: exclusivamente corpus sintético versionado",async()=>{
  const key=process.env.GEMINI_API_KEY,modelo=process.env.GEMINI_MODELO;
  if(process.env.GEMINI_EVAL_ACTIVA!=="1"||!key||!modelo||!/^gemini-[a-z0-9.-]+$/i.test(modelo))
    throw new Error("Evaluación no ejecutada: configurar GEMINI_EVAL_ACTIVA=1, GEMINI_API_KEY y GEMINI_MODELO en entorno seguro.");
  let aciertos=0,fallos=0,discordancias=0,camposInventados=0;
  const detalle:{id:number;resultado?:Interpretacion;estado:string;camposInventados?:number}[]=[];
  for(const caso of corpus.casos){
    try{
      const {casos:_,...contexto}=corpus;void _;
      const input="Interpreta la frase familiar chilena. No inventes personas, plazos, horas ni montos. Una solicitud a otro integrante es propuesta, nunca asignación. Usa null cuando falte información. Devuelve solo JSON con elementos: tipo (tarea, responsabilidad, propuesta, nota), titulo, persona_a_cargo, ambito, plazo_fecha ISO, plazo_hora HH:MM, recurrencia (null o {tipo: diaria,semanal,mensual,anual,cada_n; cada: entero positivo; dias: nombres de días}), dirigida_a, confianza (alta,baja). Contexto: "+JSON.stringify(contexto)+"\nFrase: "+caso.texto;
      const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(modelo)+":generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{parts:[{text:input}]}],generationConfig:{responseMimeType:"application/json",temperature:0}}),signal:AbortSignal.timeout(12000)});
      if(!r.ok){fallos++;detalle.push({id:caso.id,estado:"HTTP "+r.status});console.log("Caso",caso.id,"HTTP",r.status);if(r.status===401||r.status===403||r.status===429)break;continue;}
      const respuesta=await r.json() as {candidates?:{content?:{parts?:{text?:string}[]}}[]};
      const salida=contratoInterpretacion.parse(JSON.parse(respuesta.candidates?.[0]?.content?.parts?.map(p=>p.text??"").join("")??""));
      let inventados=0;
      for(const el of salida.elementos)for(const k of ["persona_a_cargo","ambito","dirigida_a","plazo_fecha","plazo_hora"] as const){
        if(el[k]!==null&&!caso.esperado.elementos.some(esperado=>esperado[k]===el[k]))inventados++;
      }
      camposInventados+=inventados;
      detalle.push({id:caso.id,resultado:salida,estado:"valida",camposInventados:inventados});
      const a=salida.elementos.map(firma).sort(),e=caso.esperado.elementos.map(firma).sort();
      if(JSON.stringify(a)===JSON.stringify(e))aciertos++;
      else{discordancias++;console.log("Caso",caso.id,"requiere revisión de campos y título.");}
    }catch{fallos++;detalle.push({id:caso.id,estado:"sin salida válida"});console.log("Caso",caso.id,"sin salida válida.");}
  }
  const resumen={modelo,total:corpus.casos.length,procesados:detalle.length,aciertos,porcentaje:100*aciertos/corpus.casos.length,discordancias,fallos,camposInventados,revisionManual:"Revisar títulos, montos e invenciones; sin revisión humana no certificar cero invenciones."};
  writeFileSync("evals/salida-eval.json",JSON.stringify({resumen,detalle},null,2));
  console.log(JSON.stringify(resumen));
  expect(detalle).toHaveLength(corpus.casos.length);
  expect(camposInventados).toBe(0);
  expect(aciertos/corpus.casos.length).toBeGreaterThanOrEqual(.9);
  expect(fallos).toBe(0);
});
