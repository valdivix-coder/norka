import {test,expect} from "vitest";
import {medirAcciones77,medirProhibidos77,alertasFecha77} from "../../evals/metricas-acciones-v7-7";
import type {ElementoInterpretado} from "../../src/core/contracts/interpretacion";
const base:ElementoInterpretado={tipo:"tarea",titulo:"Comprar pan",persona_a_cargo:null,ambito:"Compras",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"alta"};
const b={...base,titulo:"Limpiar el baño",ambito:"Hogar",persona_a_cargo:"El hogar"};
const e={elementos:[base,b]};
test("H-M1 títulos intercambiados: no considera correctas las dos acciones",()=>{const a={elementos:[{...base,titulo:b.titulo},{...b,titulo:base.titulo}]};const r=medirAcciones77(a,e);expect(r.correctas).toBeLessThan(2);});
// Same-field substitution: the historical strict metric misses it.
test("H-M2 sustitución con igual cardinalidad",()=>{const a={elementos:[b,{...base,titulo:"Comprar cerveza para el asado"}]};expect(medirAcciones77(a,e)).toMatchObject({sustituidas:1,correctas:1,precision:.5,recuperacion:.5});});
test("reordenar acciones no es un error",()=>expect(medirAcciones77({elementos:[b,base]},e).correctas).toBe(2));
test("control de prohibidos y fecha inventada con número de cantidad",()=>{const a={elementos:[{...base,plazo_fecha:"2027-03-04"}]};expect(medirProhibidos77(a,[{campo:"plazo_fecha",valor:"2027-03-04"}])).toHaveLength(1);expect(alertasFecha77("Comprar 2 kilos de pan",a)).toHaveLength(1);expect(alertasFecha77("Comprar pan el 4",a)).toHaveLength(0);});
