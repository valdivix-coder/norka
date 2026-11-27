import {describe,it,expect,vi} from "vitest";
import {validarV72} from "../../src/core/usecases/validar-interpretacion-v7-2";
import {solicitudV72,crearGeminiPorVersion} from "../../src/data/gemini-sintetico-v7-2";
import {ejecutarComparacionV72,type CorpusEvaluable} from "../../evals/comparacion-v7-2";
import {instruccionesCapturaV72} from "../../src/data/prompt-captura-v7-2";
const base={tipo:"tarea" as const,titulo:"Ordenar la terraza",persona_a_cargo:"El hogar",ambito:"Hogar",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"alta" as const};
const corpus:CorpusEvaluable={fecha:"2027-02-24T12:00:00-03:00",zona_horaria:"America/Santiago",personas_a_cargo:["El hogar","Lina"],integrantes:["QA"],autor:"QA",ambitos:["Hogar","Compras"],casos:[1,2].map(id=>({id,texto:"Ordenar la terraza",esperado:{elementos:[base]}}))};
const ctx={fecha:corpus.fecha,texto:"El miércoles a las 09:30 ordenar la terraza",personas:corpus.personas_a_cargo,integrantes:corpus.integrantes,autor:corpus.autor,ambitos:corpus.ambitos};
const interna=(extra:Record<string,unknown>={})=>({descartes:[],elementos:[{...base,persona_base:"nombrada" as const,tiempo:[],alcance:"ninguno" as const,motivo_nota:null,...extra}]});
const respuesta=(v:boolean,extra:Record<string,unknown>={})=>Response.json({candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(v?interna(extra):{elementos:[base]})}]}}]});
const es72=(init?:RequestInit)=>Boolean(JSON.parse(String(init?.body)).generationConfig.responseJsonSchema.properties.descartes);
describe("V7.2 decisiones autorizadas",()=>{
 it("D04 mismo día sin próximo: fecha nula y hora explícita conservada",()=>{
 const x={...base,plazo_fecha:"2027-03-03",plazo_hora:"09:30",persona_base:"nombrada" as const,tiempo:["El miércoles a las 09:30"],alcance:"propio" as const,motivo_nota:null};
 const r=validarV72({descartes:[],elementos:[x]},ctx);
 expect(r.publica.elementos[0]).toMatchObject({plazo_fecha:null,plazo_hora:"09:30",confianza:"baja"});
 });
 it("D04 próximo explícito mantiene +7",()=>{const r=validarV72({descartes:[],elementos:[{...base,persona_base:"nombrada",tiempo:["El próximo miércoles"],alcance:"propio",motivo_nota:null}]},{...ctx,texto:"El próximo miércoles ordenar la terraza"});expect(r.publica.elementos[0].plazo_fecha).toBe("2027-03-03");});
 it("D03 tipos opcionales solo en contexto sintético",()=>{const entrada=[{id:1,texto:"Ordenar la terraza"}];const a=JSON.parse(solicitudV72(corpus,entrada).cuerpo.contents[0].parts[0].text);expect(a.contexto.tipos_persona).toBeUndefined();const b=JSON.parse(solicitudV72({...corpus,tipos_persona:{"El hogar":"hogar",Lina:"hijo"}},entrada).cuerpo.contents[0].parts[0].text);expect(b.contexto.tipos_persona.Lina).toBe("hijo");expect(()=>solicitudV72({...corpus,tipos_persona:{Lina:"hijo"}},entrada)).toThrow("TIPOS_SINTETICOS_INVALIDOS");});
 it("regla referida distingue persona nombrada y catálogo",()=>{expect(instruccionesCapturaV72).toContain("única persona nombrada como beneficiaria");expect(instruccionesCapturaV72).toContain("Nunca elijas por descarte");});
 it("V6 sigue por defecto y las versiones anteriores seleccionables",()=>{for(const version of [undefined,"6.0","7.0","7.1","7.2"] as const){expect(crearGeminiPorVersion({clave:"qa",modelo:"gemini-3.5-flash-lite",corpus,version}).version).toBe(version??"6.0");}});
 it("D19 reproduce regresión y conserva primera muestra, solo cuatro solicitudes",async()=>{const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>respuesta(es72(init),{ambito:"Compras"}));const r=await ejecutarComparacionV72({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(r.resumen.parada?.motivo).toBe("regresion_reproducida");expect(r.resumen.paresCompletos).toBe(1);expect(r.repeticiones[0].detalle).toHaveLength(2);expect(solicitar).toHaveBeenCalledTimes(4);expect(r.resumen.brazos["7.2"].estrictaBruta).toBe(0);});
 it("D19 no borra regresión no reproducida ni continúa el examen",async()=>{let n=0;const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>respuesta(es72(init),++n<=2?{ambito:"Compras"}:{}));const r=await ejecutarComparacionV72({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(r.resumen.parada?.motivo).toBe("regresion_no_reproducida");expect(r.resumen.paresCompletos).toBe(1);expect(r.resumen.brazos["7.2"].estrictaBruta).toBe(0);expect(solicitar).toHaveBeenCalledTimes(4);});
 it("alerta de invención bruta detiene sin repetir aunque el validador la corrija",async()=>{const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>respuesta(es72(init),{persona_a_cargo:"Lina"}));const r=await ejecutarComparacionV72({clave:"qa",corpus,solicitar,esperar:async()=>{}});expect(r.resumen.parada?.motivo).toBe("alerta_invencion");expect(r.repeticiones).toHaveLength(0);expect(solicitar).toHaveBeenCalledTimes(2);});
});
