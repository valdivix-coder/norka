import {readFileSync,writeFileSync} from "node:fs";
import {test,expect} from "vitest";
import {auditarAcciones} from "./auditar-acciones";
import {ejecutarComparacion,MODELO_AB,type Version} from "./comparacion-v7";
import {VERSION_PROMPT_CAPTURA} from "../src/data/prompt-captura";
import {type Interpretacion} from "../src/core/contracts/interpretacion";
import {crearGeminiSintetico,ErrorGemini,SinModelosDisponibles,MODELOS_GEMINI,type IntentoGemini} from "../src/data/gemini-sintetico";
type Caso={id:number;texto:string;esperado:Interpretacion};
const corpus=JSON.parse(readFileSync("evals/captura-cl.json","utf8")) as {fecha:string;zona_horaria:string;personas_a_cargo:string[];integrantes:string[];autor:string;ambitos:string[];casos:Caso[]};
const campos=["tipo","persona_a_cargo","ambito","plazo_fecha","plazo_hora","recurrencia","dirigida_a"] as const;
function firma(e:Interpretacion["elementos"][number]){return JSON.stringify(campos.map(k=>k==="recurrencia"&&e.recurrencia?{...e.recurrencia,dias:[...e.recurrencia.dias].sort()}:e[k]));}
test("Gemini: exclusivamente corpus sintético versionado",async()=>{
  const key=process.env.GEMINI_API_KEY,modelo=process.env.GEMINI_MODELO;
  if(process.env.GEMINI_EVAL_ACTIVA!=="1"||!key||!modelo||!MODELOS_GEMINI.some(m=>m===modelo))
    throw new Error("Evaluación no ejecutada: configurar GEMINI_EVAL_ACTIVA=1, GEMINI_API_KEY y GEMINI_MODELO en entorno seguro.");
  const version=process.env.GEMINI_PROMPT_VERSION;
  if(version!==undefined){
    if(!["6.0","7.0","AB"].includes(version)||modelo!==MODELO_AB)throw new Error("VERSION_O_MODELO_AB_INVALIDO");
    const versiones:Version[]=version==="AB"?["6.0","7.0"]:[version as Version];
    const salida=await ejecutarComparacion({clave:key,corpus,versiones,tamano:Number(process.env.GEMINI_EVAL_TAMANO??"1"),semilla:Number(process.env.GEMINI_AB_SEMILLA??"20261126")});
    writeFileSync("evals/salida-eval.json",JSON.stringify(salida,null,2));
    console.log(JSON.stringify(salida.resumen));
    expect(salida.resumen.parada).toBeNull();
    for(const v of versiones){const b=salida.resumen.brazos[v]!;
      expect(b.validas).toBe(corpus.casos.length);
      expect(b.camposInventados).toBe(0);
      expect(b.camposBrutosDiscrepantes).toBe(0);
      expect(b.porAccion).toBe(0);
      expect(b.porAccionBruta).toBe(0);
      expect(b.principalBruta/corpus.casos.length).toBeGreaterThanOrEqual(.9);
      expect(b.estrictaBruta/corpus.casos.length).toBeGreaterThanOrEqual(.9);
      expect(b.principalNormalizada/corpus.casos.length).toBeGreaterThanOrEqual(.9);
      expect(b.estrictaNormalizada/corpus.casos.length).toBeGreaterThanOrEqual(.9);
      expect(b.casosEmpeorados).toHaveLength(0);expect(b.fallidas).toBe(0);
    }
    return;
  }
  const respaldos=MODELOS_GEMINI.filter(m=>m!==modelo);
  let intentos:IntentoGemini[]=[];
  const gemini=crearGeminiSintetico({clave:key,modelo,respaldos,corpus,observar:i=>intentos.push(i)});
  const modelosUsados:Record<string,number>={};
  const consumo:Record<string,{solicitudesValidas:number;entrada:number;salida:number;razonamiento:number;sinMedicion:number}>={};
  let solicitudes=0;
  const tamano=Number(process.env.GEMINI_EVAL_TAMANO??"1");
  if(!Number.isInteger(tamano)||tamano<1||tamano>5)throw new Error("TAMANO_INVALIDO");
  let porAccion=0,porAccionBruta=0,aciertosBrutos=0,metaBruta=0,aciertos=0,aciertosMeta=0,fallos=0,discordancias=0,camposInventados=0,camposBrutosDiscrepantes=0;
  const firmaMeta=(e:Interpretacion["elementos"][number])=>JSON.stringify([e.persona_a_cargo,e.ambito,e.plazo_fecha,e.plazo_hora]);
  const detalle:{id:number;resultado?:Interpretacion;bruta?:Interpretacion;estado:string;modelo?:string;camposInventados?:number;intentos?:IntentoGemini[];auditoria?:unknown;ajustes?:unknown}[]=[];
  for(let i=0;i<corpus.casos.length;i+=tamano){
    const grupo=corpus.casos.slice(i,i+tamano);
    intentos=[];
    if(i>0)await new Promise(r=>setTimeout(r,2500));
    try{
      const salidas=await gemini.evaluarLote(grupo.map(c=>c.id));
      const intento=intentos.find(i=>i.resultado==="valida");
      if(intento){const m=consumo[intento.modelo]??={solicitudesValidas:0,entrada:0,salida:0,razonamiento:0,sinMedicion:0};m.solicitudesValidas++;m.entrada+=intento.tokensEntrada??0;m.salida+=intento.tokensSalida??0;m.razonamiento+=intento.tokensRazonamiento??0;if(intento.tokensEntrada===undefined||intento.tokensSalida===undefined)m.sinMedicion++;}
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
      const audit=auditarAcciones(salida,caso.esperado),auditBruta=auditarAcciones(bruta,caso.esperado);
      porAccion+=audit.discrepancias;porAccionBruta+=auditBruta.discrepancias;
      if(JSON.stringify(bruta.elementos.map(firma).sort())===JSON.stringify(caso.esperado.elementos.map(firma).sort()))aciertosBrutos++;
      if(JSON.stringify(bruta.elementos.map(firmaMeta).sort())===JSON.stringify(caso.esperado.elementos.map(firmaMeta).sort()))metaBruta++;
      detalle.push({id:caso.id,resultado:salida,bruta,estado:"valida",modelo:usado,camposInventados:inventados,intentos,auditoria:{normalizada:audit,bruta:auditBruta},ajustes:gemini.ajustes(caso.id)});
      const a=salida.elementos.map(firma).sort(),e=caso.esperado.elementos.map(firma).sort();
      const metaA=salida.elementos.map(firmaMeta).sort(),metaE=caso.esperado.elementos.map(firmaMeta).sort();
      if(JSON.stringify(metaA)===JSON.stringify(metaE))aciertosMeta++;
      if(JSON.stringify(a)===JSON.stringify(e))aciertos++;
      else{discordancias++;console.log("Caso",caso.id,"requiere revisión de campos y título.");}
      }
    }catch(error){
      if(error instanceof SinModelosDisponibles){console.log("Sin modelos disponibles; resto sin ejecutar.");break;}
      fallos+=grupo.length;const estado=error instanceof ErrorGemini?"HTTP "+error.estado:"sin salida válida";
      for(const caso of grupo)detalle.push({id:caso.id,estado,intentos});console.log("Grupo",grupo.map(c=>c.id),estado);
      if(error instanceof ErrorGemini&&[401,403].includes(error.estado))break;
    }finally{solicitudes+=intentos.length;}
  }
  const resumen={version:VERSION_PROMPT_CAPTURA,porAccion,porAccionBruta,aciertosBrutos,metaBruta,solicitudes,consumo,validas:detalle.filter(d=>d.estado==="valida").length,sinEjecutar:corpus.casos.length-detalle.length,modo:tamano===1?"individual":"diagnostico_agrupado",tamano,modelo,respaldos,modelosUsados,total:corpus.casos.length,procesados:detalle.length,aciertos,porcentaje:100*aciertos/corpus.casos.length,aciertosMeta,porcentajeMeta:100*aciertosMeta/corpus.casos.length,discordancias,fallos,camposInventados,camposBrutosDiscrepantes,revisionManual:"Revisar títulos, montos e invenciones; sin revisión humana no certificar cero invenciones."};
  writeFileSync("evals/salida-eval.json",JSON.stringify({resumen,detalle},null,2));
  console.log(JSON.stringify(resumen));
  expect(detalle).toHaveLength(corpus.casos.length);
  expect(camposInventados).toBe(0);
  expect(camposBrutosDiscrepantes).toBe(0);
  expect(porAccion).toBe(0);
  expect(porAccionBruta).toBe(0);
  expect(aciertosMeta/corpus.casos.length).toBeGreaterThanOrEqual(.9);
  // Mantener también el criterio estricto previo: no ocultar fallos de tipo, propuesta o recurrencia.
  expect(aciertos/corpus.casos.length).toBeGreaterThanOrEqual(.9);
  expect(fallos).toBe(0);
});
