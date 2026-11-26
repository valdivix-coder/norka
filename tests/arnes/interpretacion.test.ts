import {describe,it,expect} from "vitest";
import {planInterpretacion,interpretarConReintento} from "../../src/core/usecases/interpretacion";
const c={texto:"Comprar pan",autorId:"a",personas:[{id:"h",nombre:"El hogar"}],ambitos:[{id:"c",nombre:"Compras"}],integrantes:[{id:"a",nombre:"Ana"},{id:"p",nombre:"Pablo"}]};
const base={tipo:"tarea",titulo:"Comprar pan",persona_a_cargo:"El hogar",ambito:"Compras",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"alta"};
const dato=(extra:Record<string,unknown>={})=>({elementos:[{...base,...extra}]});
describe("Interpretación 6.2, sin llamar IA",()=>{
 it("rechaza propiedades extra, tipos inválidos y fechas imposibles",()=>{
   for(const x of [dato({monto:10}),dato({tipo:"otro"}),dato({plazo_fecha:"2026-02-30"}),dato({plazo_hora:"24:01"}),{elementos:[]}])
     expect(planInterpretacion(x,c)).toBeNull();
 });
 it("reintenta una vez y conserva el texto si sigue inválido",async()=>{
   let n=0;const r=await interpretarConReintento(c,async()=>{n++;return {};});
   expect(n).toBe(2);expect(r.fallida).toBe(true);expect(r.plan[0].titulo).toBe(c.texto);expect(r.plan[0].por_revisar).toBe(true);
 });
 it("acepta el segundo intento si valida",async()=>{
   let n=0;const r=await interpretarConReintento(c,async()=>++n===1?{}:dato());
   expect(r.intentos).toBe(2);expect(r.fallida).toBe(false);
 });
 it("resuelve solo nombres exactos y únicos, y marca por revisar",()=>{
   const x=planInterpretacion(dato({persona_a_cargo:"Inventado",ambito:"Otro"}),c)![0];
   expect(x.persona_a_cargo_id).toBeNull();expect(x.ambito_id).toBeNull();expect(x.por_revisar).toBe(true);
   expect(planInterpretacion(dato(),{...c,personas:[...c.personas,{id:"otro",nombre:"El hogar"}]})![0].persona_a_cargo_id).toBeNull();
 });
 it("confianza baja o campo nulo requiere revisión",()=>{
   for(const extra of [{confianza:"baja"},{persona_a_cargo:null},{ambito:null}])expect(planInterpretacion(dato(extra),c)![0].por_revisar).toBe(true);
 });
 it("propuesta nunca asigna directamente a otro integrante",()=>{
   for(const tipo of ["propuesta","tarea","responsabilidad"]){
     const p=planInterpretacion(dato({tipo,dirigida_a:"Pablo"}),c)![0];
     expect(p.tipo).toBe("propuesta");expect(p.dirigida_a_id).toBe("p");expect(p.ejecutor_id).toBeNull();
   }
 });
 it("destinatario desconocido no se inventa",()=>{
   const p=planInterpretacion(dato({tipo:"propuesta",dirigida_a:"X"}),c)![0];
   expect(p.tipo).toBe("tarea");expect(p.por_revisar).toBe(true);expect(p.dirigida_a_id).toBeNull();
 });
 it("nota queda sin clasificar con texto original",()=>{
   const p=planInterpretacion(dato({tipo:"nota",titulo:"otro"}),c)![0];
   expect(p.titulo).toBe(c.texto);expect(p.persona_a_cargo_id).toBeNull();expect(p.por_revisar).toBe(true);
 });
 it("responsabilidad conserva recurrencia sin inventar campos",()=>{
   const recurrencia={tipo:"semanal",cada:1,dias:["domingo"]};
   expect(planInterpretacion(dato({tipo:"responsabilidad",recurrencia}),c)![0].recurrencia).toEqual(recurrencia);
   expect(planInterpretacion(dato({tipo:"responsabilidad",recurrencia:null}),c)![0].por_revisar).toBe(true);
 });
 it("no se agrega un plazo cuando no existe",()=>{
   const p=planInterpretacion(dato({plazo_fecha:null,plazo_hora:"10:00"}),c)![0];
   expect(p.plazo_fecha).toBeNull();expect(p.plazo_hora).toBeNull();expect(p.por_revisar).toBe(true);
 });
});
