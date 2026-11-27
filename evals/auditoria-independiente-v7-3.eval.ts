import {test,expect} from "vitest";
import {ablacionValidadores,cargarFixtures} from "./replay-validadores";
import {huellasV73} from "./comparacion-v7-3";
import {readFileSync} from "node:fs";
import {anclaHogar} from "../src/core/usecases/validar-interpretacion-v7-3";
test("auditoría independiente sin proveedor: repetir ablación y verificar congelación",()=>{
 const fx=cargarFixtures();
 expect(fx.length).toBe(3);
 expect(fx.every(f=>!f.fuente.corpus.includes("oficial"))).toBe(true);
 const r=ablacionValidadores(fx);
 console.log("AUDITORIA_REPLAY",JSON.stringify(r.resumen));
 expect(r.resumen.casos).toBe(61);
 expect(r.resumen.brutaEstricta).toBe(50);
 expect((r.resumen["v7.1"] as {estricta:number}).estricta).toBe(53);
 expect((r.resumen["v7.2"] as {estricta:number}).estricta).toBe(53);
 expect((r.resumen["v7.3"] as {estricta:number}).estricta).toBe(55);
 expect(huellasV73()).toEqual(JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.3.json","utf8")).huellas);
});
test("diagnóstico independiente de ancla hogar por cláusula (sin modificar candidata)",()=>{
 const ejemplos=[
 {texto:"Pagar la matrícula del taller de Camila",titulo:"Pagar la matrícula del taller",esperado:false},
 {texto:"Comprar detergente para la casa y comprar una libreta",titulo:"Comprar una libreta",esperado:false},
 {texto:"Comprar una libreta y comprar detergente para la casa",titulo:"Comprar una libreta",esperado:false},
 {texto:"Comprar detergente para la casa",titulo:"Comprar detergente",esperado:true},
 {texto:"Pagar el agua de la casa",titulo:"Pagar el agua de la casa",esperado:true},
 {texto:"Comprar un regalo y limpiar el baño",titulo:"Comprar un regalo",esperado:false},
 {texto:"Comprar una planta para la casa",titulo:"Comprar una planta",esperado:true},
 {texto:"Comprar una planta para Amanda y arreglar las plantas de la casa",titulo:"Comprar una planta para Amanda",esperado:false}
 ];
 const diagnostico=ejemplos.map(e=>({...e,...anclaHogar(e.texto,e.titulo)}));
 console.log("AUDITORIA_ANCLAS",JSON.stringify(diagnostico));
 expect(diagnostico.length).toBe(8);
});
