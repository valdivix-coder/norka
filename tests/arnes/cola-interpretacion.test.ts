import {describe,it,expect,vi} from "vitest";
import {procesarCaptura} from "../../src/core/usecases/procesar-captura";
import type {ColaInterpretacion} from "../../src/core/ports/interpretacion";
const contexto={texto:"Comprar pan",autorId:"a",personas:[{id:"h",nombre:"El hogar"}],ambitos:[{id:"c",nombre:"Compras"}],integrantes:[]};
const valido={elementos:[{tipo:"tarea",titulo:"Comprar pan",persona_a_cargo:"El hogar",ambito:"Compras",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"alta"}]};
describe("Cola de interpretación",()=>{
 it("sin habilitación no reserva ni llama IA",async()=>{
  const reservar=vi.fn(),aplicar=vi.fn(),interpretar=vi.fn();
  expect(await procesarCaptura({reservar,aplicar},{interpretar},false)).toBeNull();
  expect(reservar).not.toHaveBeenCalled();expect(interpretar).not.toHaveBeenCalled();
 });
 it("reserva antes de cada llamada y aplica únicamente el plan validado",async()=>{
  const orden:string[]=[];let n=0;
  const cola:ColaInterpretacion={reservar:async()=>{orden.push("reserva");return {revision:++n,intentos:n,contexto};},
    aplicar:async(r,plan,fallida)=>{orden.push("aplicar");if(r.intentos===1){expect(fallida).toBe(true);expect(plan).toBeNull();return {estado:"reintentar"};}expect(plan?.[0].persona_a_cargo_id).toBe("h");expect(fallida).toBe(false);return {estado:"aplicada"};}};
  const ia={interpretar:async()=>{orden.push("ia");return n===1?{}:valido;}};
  expect((await procesarCaptura(cola,ia,true))?.estado).toBe("aplicada");
  expect(orden).toEqual(["reserva","ia","aplicar","reserva","ia","aplicar"]);
 });
 it("sin reserva (incluido consentimiento rechazado) no llama IA",async()=>{
  const interpretar=vi.fn();
  expect(await procesarCaptura({reservar:async()=>null,aplicar:vi.fn()},{interpretar},true)).toBeNull();
  expect(interpretar).not.toHaveBeenCalled();
 });
 it("dos fallos dejan el original sin clasificar",async()=>{
  let n=0;const interpretar=vi.fn(async()=>{throw Error("sin red");});
  const cola:ColaInterpretacion={reservar:async()=>({revision:++n,intentos:n,contexto}),aplicar:async(r,plan,fallida)=>{
    expect(plan).toBeNull();expect(fallida).toBe(true);return {estado:r.intentos===1?"reintentar":"sin_clasificar"};}};
  expect((await procesarCaptura(cola,{interpretar},true))?.estado).toBe("sin_clasificar");
  expect(interpretar).toHaveBeenCalledTimes(2);
 });
});
