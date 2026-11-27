import {describe,it,expect,vi} from "vitest";
import {ejecutarComparacion,type CorpusEvaluable} from "../../evals/comparacion-v7";
const base={tipo:"tarea" as const,titulo:"Limpiar la casa",persona_a_cargo:"El hogar",ambito:"Hogar",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"alta" as const};
const corpus:CorpusEvaluable={fecha:"2026-11-26T12:00:00-03:00",zona_horaria:"America/Santiago",personas_a_cargo:["El hogar"],integrantes:["QA"],autor:"QA",ambitos:["Hogar","Compras"],casos:[1,2,3].map(id=>({id,texto:"Limpiar la casa",esperado:{elementos:[base]}}))};
const respuesta=(v7:boolean,fallar=false)=>Response.json({usageMetadata:{promptTokenCount:100,candidatesTokenCount:20},candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(v7?{descartes:[],elementos:[{...base,ambito:fallar?"Compras":"Hogar",evidencia:"Limpiar la casa",tiempo:[],motivo_nota:null}]}:{elementos:[base]})}]}}]});
const esV7=(init?:RequestInit)=>Boolean(JSON.parse(String(init?.body)).generationConfig.responseJsonSchema.properties.descartes);
describe("A/B sin proveedor real",()=>{
 it("alterna brazos y controla ritmo; calcula métricas y huellas",async()=>{
  const orden:boolean[]=[];const esperar=vi.fn(async()=>{});
  const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>{orden.push(esV7(init));return respuesta(esV7(init));});
  const r=await ejecutarComparacion({clave:"qa",corpus,semilla:2,esperar,solicitar});
  expect(orden).toEqual([false,true,true,false,false,true]);expect(esperar).toHaveBeenCalledTimes(5);expect(esperar).toHaveBeenCalledWith(4500);
  expect(r.resumen.parada).toBeNull();expect(r.resumen.comparacionCompleta).toBe(true);expect(r.resumen.brazos["7.0"]?.estrictaNormalizada).toBe(3);
  expect(r.resumen.brazos["6.0"]?.consumo.entrada).toBe(300);expect(r.resumen.huellas["7.0"].instruccion).toHaveLength(64);
 });
 it("detiene inmediatamente HTTP 429 y distingue no ejecutados",async()=>{
  const solicitar=vi.fn(async()=>new Response("",{status:429}));
  const r=await ejecutarComparacion({clave:"qa",corpus,semilla:2,esperar:async()=>{},solicitar});
  expect(r.resumen.parada?.motivo).toBe("cuota_429");expect(r.resumen.brazos["6.0"]?.fallidas).toBe(1);expect(r.resumen.brazos["7.0"]?.noEjecutadas).toBe(3);expect(solicitar).toHaveBeenCalledTimes(1);
 });
 it("reintenta una vez ante 503 y no insiste después",async()=>{
  const solicitar=vi.fn(async()=>new Response("",{status:503}));
  const r=await ejecutarComparacion({clave:"qa",corpus,semilla:2,esperar:async()=>{},solicitar});
  expect(solicitar).toHaveBeenCalledTimes(2);expect(r.resumen.parada?.motivo).toBe("cobertura_incompleta:HTTP 503");
 });
 it("detiene regresión individual pareada aun con cobertura parcial",async()=>{
  const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>respuesta(esV7(init),true));
  const r=await ejecutarComparacion({clave:"qa",corpus,semilla:2,esperar:async()=>{},solicitar});
  expect(r.resumen.parada?.motivo).toBe("regresion_individual");expect(r.resumen.paresCompletos).toBe(1);expect(r.resumen.comparacionCompleta).toBe(false);expect(solicitar).toHaveBeenCalledTimes(2);
 });
 it("detiene fallos del contrato V7 sin intentar otros casos",async()=>{
  const solicitar=vi.fn(async()=>Response.json({candidates:[{finishReason:"STOP",content:{parts:[{text:"{}"}]}}]}));
  const r=await ejecutarComparacion({clave:"qa",corpus,semilla:1,esperar:async()=>{},solicitar});expect(r.resumen.parada?.motivo).toBe("cobertura_incompleta:contrato_interno_v7");expect(solicitar).toHaveBeenCalledTimes(1);
 });
});
