import {readFileSync,writeFileSync} from "node:fs";
import {test,expect} from "vitest";
import {type Interpretacion} from "../src/core/contracts/interpretacion";
import {crearGeminiSintetico,ErrorGemini,MODELOS_GEMINI,type IntentoGemini} from "../src/data/gemini-sintetico";
type Caso={id:number;texto:string;esperado:Interpretacion};
const corpus=JSON.parse(readFileSync("evals/captura-cl.json","utf8")) as {fecha:string;zona_horaria:string;personas_a_cargo:string[];integrantes:string[];autor:string;ambitos:string[];casos:Caso[]};
const campos=["tipo","persona_a_cargo","ambito","plazo_fecha","plazo_hora","recurrencia","dirigida_a"] as const;
function firma(e:Interpretacion["elementos"][number]){return JSON.stringify(campos.map(k=>k==="recurrencia"&&e.recurrencia?{...e.recurrencia,dias:[...e.recurrencia.dias].sort()}:e[k]));}
test("Gemini: exclusivamente corpus sintético versionado",async()=>{
  const key=process.env.GEMINI_API_KEY,modelo=process.env.GEMINI_MODELO;
  if(process.env.GEMINI_EVAL_ACTIVA!=="1"||!key||!modelo||!MODELOS_GEMINI.some(m=>m===modelo))
    throw new Error("Evaluación no ejecutada: configurar GEMINI_EVAL_ACTIVA=1, GEMINI_API_KEY y GEMINI_MODELO en entorno seguro.");
  const respaldos=MODELOS_GEMINI.filter(m=>m!==modelo);
  let intentos:IntentoGemini[]=[];
  const gemini=crearGeminiSintetico({clave:key,modelo,respaldos,corpus,observar:i=>intentos.push(i)});
  const modelosUsados:Record<string,number>={};
  const tamano=Number(process.env.GEMINI_EVAL_TAMANO??"1");
  if(!Number.isInteger(tamano)||tamano<1||tamano>5)throw new Error("TAMANO_INVALIDO");
  let aciertos=0,aciertosMeta=0,fallos=0,discordancias=0,camposInventados=0,camposBrutosDiscrepantes=0;
  const firmaMeta=(e:Interpretacion["elementos"][number])=>JSON.stringify([e.persona_a_cargo,e.ambito,e.plazo_fecha,e.plazo_hora]);
  const detalle:{id:number;resultado?:Interpretacion;bruta?:Interpretacion;estado:string;modelo?:string;camposInventados?:number;intentos?:IntentoGemini[]}[]=[];
  for(let i=0;i<corpus.casos.length;i+=tamano){
    const grupo=corpus.casos.slice(i,i+tamano);
    intentos=[];
    if(i>0)await new Promise(r=>setTimeout(r,2500));
    try{
      const salidas=await gemini.evaluarLote(grupo.map(c=>c.id));
      for(const caso of grupo){
      const salida=salidas.get(caso.id)!;
      const bruta=gemini.bruta(caso.id)!;
      const usado=gemini.modeloUsado()??modelo;modelosUsados[usado]=(modelosUsados[usado]??0)+1;
      let inventados=0;
      for(const el of salida.elementos)for(const k of ["persona_a_cargo","ambito","dirigida_a","plazo_fecha","plazo_hora"] as const){
        if(el[k]!==null&&!caso.esperado.elementos.some(esperado=>esperado[k]===el[k]))inventados++;
      }
      camposInventados+=inventados;
      for(const el of bruta.elementos)for(const k of ["persona_a_cargo","ambito","dirigida_a","plazo_fecha","plazo_hora"] as const){if(el[k]!==null&&!caso.esperado.elementos.some(e=>e[k]===el[k]))camposBrutosDiscrepantes++;}
      detalle.push({id:caso.id,resultado:salida,bruta,estado:"valida",modelo:usado,camposInventados:inventados,intentos});
      const a=salida.elementos.map(firma).sort(),e=caso.esperado.elementos.map(firma).sort();
      const metaA=salida.elementos.map(firmaMeta).sort(),metaE=caso.esperado.elementos.map(firmaMeta).sort();
      if(JSON.stringify(metaA)===JSON.stringify(metaE))aciertosMeta++;
      if(JSON.stringify(a)===JSON.stringify(e))aciertos++;
      else{discordancias++;console.log("Caso",caso.id,"requiere revisión de campos y título.");}
      }
    }catch(error){fallos+=grupo.length;const estado=error instanceof ErrorGemini?"HTTP "+error.estado:"sin salida válida";for(const caso of grupo)detalle.push({id:caso.id,estado,intentos});console.log("Grupo",grupo.map(c=>c.id),estado);if(error instanceof ErrorGemini&&[401,403,429].includes(error.estado))break;}
  }
  const resumen={modo:tamano===1?"individual":"diagnostico_agrupado",tamano,modelo,respaldos,modelosUsados,total:corpus.casos.length,procesados:detalle.length,aciertos,porcentaje:100*aciertos/corpus.casos.length,aciertosMeta,porcentajeMeta:100*aciertosMeta/corpus.casos.length,discordancias,fallos,camposInventados,camposBrutosDiscrepantes,revisionManual:"Revisar títulos, montos e invenciones; sin revisión humana no certificar cero invenciones."};
  writeFileSync("evals/salida-eval.json",JSON.stringify({resumen,detalle},null,2));
  console.log(JSON.stringify(resumen));
  expect(detalle).toHaveLength(corpus.casos.length);
  expect(camposInventados).toBe(0);
  expect(camposBrutosDiscrepantes).toBe(0);
  expect(aciertosMeta/corpus.casos.length).toBeGreaterThanOrEqual(.9);
  // Mantener también el criterio estricto previo: no ocultar fallos de tipo, propuesta o recurrencia.
  expect(aciertos/corpus.casos.length).toBeGreaterThanOrEqual(.9);
  expect(fallos).toBe(0);
});
