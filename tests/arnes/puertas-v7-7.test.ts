import {test,expect,vi} from "vitest";
import {ejecutarComparacionV77,type CorpusEvaluable} from "../../evals/comparacion-v7-7";
import {verificarPuertas77} from "../../evals/puertas-v7-7";
const e={tipo:"tarea" as const,titulo:"Comprar pan",persona_a_cargo:null,ambito:"Compras",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"baja" as const};
const esperado={elementos:[e]};
const corpus:CorpusEvaluable={fecha:"2027-04-15T10:00:00-03:00",zona_horaria:"America/Santiago",personas_a_cargo:["El hogar"],integrantes:["QA"],autor:"QA",ambitos:["Compras"],casos:[{id:1,texto:"Comprar pan",esperado}]};
test("una corrida simulada incompleta jamás acredita examen oficial",async()=>{const solicitar=vi.fn(async(_u:RequestInfo|URL,i?:RequestInit)=>Response.json({usageMetadata:{promptTokenCount:100,candidatesTokenCount:20},candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(JSON.parse(String(i?.body)).generationConfig.responseJsonSchema.properties.descartes?{descartes:[],elementos:[{...e,persona_base:"ninguna",tiempo:[],alcance:"ninguno",motivo_nota:null}]}:esperado)}]}}]}));const r=await ejecutarComparacionV77({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(verificarPuertas77(r)).toMatchObject({aprobable:false,fallos:expect.arrayContaining(["cobertura_o_parada","auditoria_manual_no_aprobada"])});});
