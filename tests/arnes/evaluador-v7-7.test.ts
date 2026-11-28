import {it,expect,vi} from "vitest";
import {ejecutarComparacionV77,type CorpusEvaluable} from "../../evals/comparacion-v7-7";
import {crearGeminiPorVersion} from "../../src/data/gemini-sintetico-v7-7";
const a={tipo:"tarea" as const,titulo:"Retirar certificados",persona_a_cargo:null,ambito:"Trámites",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"baja" as const};
const b={...a,titulo:"Pagar arancel",ambito:"Pagos y finanzas"};
const esperado={elementos:[a,b]};
const corpus:CorpusEvaluable={fecha:"2027-04-15T10:00:00-03:00",zona_horaria:"America/Santiago",personas_a_cargo:["El hogar"],integrantes:["QA"],autor:"QA",ambitos:["Trámites","Pagos y finanzas"],casos:[1,2].map(id=>({id,texto:"Retirar certificados y pagar arancel",esperado}))};
const interna=(es:typeof esperado.elementos)=>({descartes:[],elementos:es.map(e=>({...e,persona_base:"ninguna",tiempo:[],alcance:"ninguno",motivo_nota:null}))});
const resp=(x:unknown)=>Response.json({candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(x)}]}}]});
const candidato=(i?:RequestInit)=>Boolean(JSON.parse(String(i?.body)).generationConfig.responseJsonSchema.properties.descartes);
it("aceptación detiene por omisión compartida aunque no haya regresión de caso",async()=>{const solicitar=vi.fn(async(_u:RequestInfo|URL,i?:RequestInit)=>resp(candidato(i)?interna([a]):{elementos:[a]}));const r=await ejecutarComparacionV77({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(r.resumen.parada?.motivo).toBe("cobertura_acciones_incompleta");expect(r.resumen.brazos["7.7"].deficitBruto).toBe(1);expect(r.resumen.paresCompletos).toBe(1);});
it("si V6 acierta y candidata omite, D19 mantiene la parada",async()=>{const solicitar=vi.fn(async(_u:RequestInfo|URL,i?:RequestInit)=>resp(candidato(i)?interna([a]):esperado));const r=await ejecutarComparacionV77({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(r.resumen.parada?.motivo).toBe("regresion_reproducida");expect(r.repeticiones).toHaveLength(1);});
it("control y candidata completos: no parada",async()=>{const solicitar=vi.fn(async(_u:RequestInfo|URL,i?:RequestInit)=>resp(candidato(i)?interna([a,b]):esperado));const r=await ejecutarComparacionV77({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(r.resumen.parada).toBeNull();expect(r.resumen.brazos["7.7"].accionesEsperadas).toBe(4);});
it("selector conserva V6 por defecto y V7.4",()=>{for(const version of [undefined,"7.4","7.7"] as const)expect(crearGeminiPorVersion({clave:"qa",modelo:"gemini-3.5-flash-lite",corpus,version}).version).toBe(version??"6.0");});

it("no hay transporte por defecto en evaluador experimental",async()=>{await expect(ejecutarComparacionV77({clave:"qa",corpus})).rejects.toThrow("SIN_AUTORIZACION_DE_PROVEEDOR");});
it("reporta acción sustituida aun con mismos campos",async()=>{const cambiado={...a,titulo:"Inventar una fiesta"};const solicitar=vi.fn(async(_u:RequestInfo|URL,i?:RequestInit)=>resp(candidato(i)?interna([cambiado,b]):esperado));const r=await ejecutarComparacionV77({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(r.resumen.brazos["7.7"].accionesSemanticas.bruta.sustituidas).toBe(2);});
