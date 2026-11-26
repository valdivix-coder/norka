import {readFileSync,writeFileSync} from "node:fs";
import {test,expect} from "vitest";
import {type Interpretacion} from "../src/core/contracts/interpretacion";
import {crearGeminiSintetico,ErrorGemini} from "../src/data/gemini-sintetico";
type Caso={id:number;texto:string;esperado:Interpretacion};
const corpus=JSON.parse(readFileSync("evals/captura-cl.json","utf8")) as {fecha:string;zona_horaria:string;personas_a_cargo:string[];integrantes:string[];autor:string;ambitos:string[];casos:Caso[]};
const campos=["tipo","persona_a_cargo","ambito","plazo_fecha","plazo_hora","recurrencia","dirigida_a"] as const;
function firma(e:Interpretacion["elementos"][number]){return JSON.stringify(campos.map(k=>k==="recurrencia"&&e.recurrencia?{...e.recurrencia,dias:[...e.recurrencia.dias].sort()}:e[k]));}
test("Gemini: exclusivamente corpus sintético versionado",async()=>{
  const key=process.env.GEMINI_API_KEY,modelo=process.env.GEMINI_MODELO;
  if(process.env.GEMINI_EVAL_ACTIVA!=="1"||!key||!modelo||!/^gemini-[a-z0-9.-]+$/i.test(modelo))
    throw new Error("Evaluación no ejecutada: configurar GEMINI_EVAL_ACTIVA=1, GEMINI_API_KEY y GEMINI_MODELO en entorno seguro.");
  const gemini=crearGeminiSintetico({clave:key,modelo,corpus});
  let aciertos=0,fallos=0,discordancias=0,camposInventados=0;
  const detalle:{id:number;resultado?:Interpretacion;estado:string;camposInventados?:number}[]=[];
  for(const caso of corpus.casos){
    try{
      const salida=await gemini.evaluar(caso.id);
      let inventados=0;
      for(const el of salida.elementos)for(const k of ["persona_a_cargo","ambito","dirigida_a","plazo_fecha","plazo_hora"] as const){
        if(el[k]!==null&&!caso.esperado.elementos.some(esperado=>esperado[k]===el[k]))inventados++;
      }
      camposInventados+=inventados;
      detalle.push({id:caso.id,resultado:salida,estado:"valida",camposInventados:inventados});
      const a=salida.elementos.map(firma).sort(),e=caso.esperado.elementos.map(firma).sort();
      if(JSON.stringify(a)===JSON.stringify(e))aciertos++;
      else{discordancias++;console.log("Caso",caso.id,"requiere revisión de campos y título.");}
    }catch(error){fallos++;const estado=error instanceof ErrorGemini?"HTTP "+error.estado:"sin salida válida";detalle.push({id:caso.id,estado});console.log("Caso",caso.id,estado);if(error instanceof ErrorGemini&&[401,403,429].includes(error.estado))break;}
  }
  const resumen={modelo,total:corpus.casos.length,procesados:detalle.length,aciertos,porcentaje:100*aciertos/corpus.casos.length,discordancias,fallos,camposInventados,revisionManual:"Revisar títulos, montos e invenciones; sin revisión humana no certificar cero invenciones."};
  writeFileSync("evals/salida-eval.json",JSON.stringify({resumen,detalle},null,2));
  console.log(JSON.stringify(resumen));
  expect(detalle).toHaveLength(corpus.casos.length);
  expect(camposInventados).toBe(0);
  expect(aciertos/corpus.casos.length).toBeGreaterThanOrEqual(.9);
  expect(fallos).toBe(0);
});
