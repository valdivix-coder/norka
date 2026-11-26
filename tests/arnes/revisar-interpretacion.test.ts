import {describe,it,expect} from "vitest";
import {intervaloExplicito,revisarInterpretacion} from "../../src/core/usecases/revisar-interpretacion";
import {auditarAcciones} from "../../evals/auditar-acciones";
import type {ElementoInterpretado,Interpretacion} from "../../src/core/contracts/interpretacion";
const base:ElementoInterpretado={tipo:"tarea",titulo:"Comprar arena",persona_a_cargo:"Nube",ambito:"Mascotas",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"alta"};
const ctx={texto:"Comprar arena para la gata Mora",personas:["Nube","El hogar"],integrantes:["Rosa","Diego"],ambitos:["Mascotas","Compras"],autor:"Rosa"};
describe("V6: respaldo determinista",()=>{
 it("no sustituye a una persona desconocida por una conocida ni altera la respuesta bruta",()=>{
  const bruto={elementos:[base]};const r=revisarInterpretacion(bruto,ctx);
  expect(r.salida.elementos[0].persona_a_cargo).toBeNull();expect(r.salida.elementos[0].confianza).toBe("baja");
  expect(bruto.elementos[0].persona_a_cargo).toBe("Nube");expect(r.ajustes).toHaveLength(1);
 });
 it("reconoce nombres completos sin confundir fragmentos",()=>{
  expect(revisarInterpretacion({elementos:[base]},{...ctx,texto:"Comprar arena para Nubecita"}).salida.elementos[0].persona_a_cargo).toBeNull();
  expect(revisarInterpretacion({elementos:[base]},{...ctx,texto:"Comprar arena para NUBE"}).salida.elementos[0].persona_a_cargo).toBe("Nube");
 });
 it("rechaza destinatario no mencionado incluso si pertenece a la familia",()=>{
  const r=revisarInterpretacion({elementos:[{...base,tipo:"propuesta",dirigida_a:"Diego"}]},ctx);
  expect(r.salida.elementos[0]).toMatchObject({tipo:"nota",dirigida_a:null});
 });
 it("normaliza unidades explícitas pero no adivina intervalos",()=>{
  expect(intervaloExplicito("Cada cuatro días cambiar el agua")).toEqual({tipo:"diaria",cada:4});
  expect(intervaloExplicito("Cada 3 semanas limpiar")).toEqual({tipo:"semanal",cada:3});
  expect(intervaloExplicito("Cada mes")).toEqual({tipo:"mensual",cada:1});
  expect(intervaloExplicito("Cada dos años")).toEqual({tipo:"anual",cada:2});
  expect(intervaloExplicito("cada tanto")).toBeNull();expect(intervaloExplicito("cada 0 días")).toBeNull();
 });
 it("corrige cada_n en una única acción y no mezcla varias recurrencias",()=>{
  const e:ElementoInterpretado={...base,tipo:"responsabilidad",recurrencia:{tipo:"cada_n",cada:4,dias:[]}};
  const c={...ctx,texto:"Cada cuatro días cambiar el agua de Nube"};
  expect(revisarInterpretacion({elementos:[e]},c).salida.elementos[0].recurrencia).toEqual({tipo:"diaria",cada:4,dias:[]});
  expect(revisarInterpretacion({elementos:[e,e]},c).salida.elementos[0].recurrencia).toEqual(e.recurrencia);
 });
});
describe("Evaluación uno a uno",()=>{
 const esperado:Interpretacion={elementos:[{...base,titulo:"Comprar arena",plazo_fecha:"2026-12-01"},{...base,titulo:"Limpiar patio",plazo_fecha:null}]};
 it("detecta fecha copiada a otra acción aunque esté en el corpus del mismo caso",()=>{
  const actual={elementos:[esperado.elementos[0],{...esperado.elementos[1],plazo_fecha:"2026-12-01"}]};
  expect(auditarAcciones(actual,esperado).discrepancias).toBe(1);
 });
 it("no penaliza orden distinto y detecta duplicados y omisiones",()=>{
  expect(auditarAcciones({elementos:[...esperado.elementos].reverse()},esperado).discrepancias).toBe(0);
  expect(auditarAcciones({elementos:[...esperado.elementos,base]},esperado).extras).toBe(1);
  expect(auditarAcciones({elementos:[base]},esperado).omitidas).toBe(1);
 });
});
