import {describe,it,expect} from "vitest";
import {leerFechaCivil,sumarDiasCivil,resolverExpresionTemporal as resolver} from "../../src/core/usecases/calendario-captura";
describe("Calendario de captura (candidato no conectado al proveedor)",()=>{
 it("respeta fin de mes, año y años bisiestos",()=>{
  expect(sumarDiasCivil("2026-12-31",1)).toBe("2027-01-01");
  expect(sumarDiasCivil("2028-02-28",1)).toBe("2028-02-29");
  expect(sumarDiasCivil("2100-02-28",1)).toBe("2100-03-01");
  expect(sumarDiasCivil("2026-03-01",-1)).toBe("2026-02-28");
  expect(leerFechaCivil("2026-02-29")).toBeNull();
 });
 it("resuelve expresiones aisladas relativas al reloj de captura",()=>{
  expect(resolver("2026-11-26","mañana")).toBe("2026-11-27");
  expect(resolver("2026-11-26","pasado mañana")).toBe("2026-11-28");
  expect(resolver("2026-11-26","el martes")).toBe("2026-12-01");
  expect(resolver("2026-11-26","el jueves")).toBe("2026-12-03");
  expect(resolver("2026-11-26","en 5 días")).toBe("2026-12-01");
 });
 it("rechaza fechas imposibles y no elige entre fechas ambiguas",()=>{
  expect(resolver("2026-11-26","31 de abril")).toBeNull();
  expect(resolver("2026-11-26","el lunes o martes")).toBeNull();
  expect(resolver("2026-11-26","mañana comprar y limpiar el patio")).toBeNull();
  expect(resolver("2026-11-26","el 5")).toBeNull();
 });
 it("permite fechas explícitas y año siguiente",()=>{
  expect(resolver("2026-11-26","2 de enero")).toBe("2027-01-02");
  expect(resolver("2026-11-26","2 de enero de 2026")).toBe("2026-01-02");
 });
});
