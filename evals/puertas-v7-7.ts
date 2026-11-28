import type {ejecutarComparacionV77} from "./comparacion-v7-7";
type Resultado=Awaited<ReturnType<typeof ejecutarComparacionV77>>;
// Pure gate. Does not execute requests; human audit is a separate required result.
export function verificarPuertas77(r:Resultado,auditoriaManual:"pendiente"|"aprobada"|"rechazada"="pendiente"){
 const f:string[]=[],s=r.resumen,b6=s.brazos["6.0"],b7=s.brazos["7.7"];
 if(s.modo!=="aceptacion"||JSON.stringify(s.versiones)!==JSON.stringify(["6.0","7.7"]))f.push("modo_brazos");
 if(s.parada!==null||!s.comparacionCompleta||s.paresCompletos!==50)f.push("cobertura_o_parada");
 if(!b6||!b7)return {aprobable:false,fallos:[...f,"brazos_ausentes"]};
 for(const b of [b6,b7])if(b.total!==50||b.validas!==50||b.fallidas!==0||b.noEjecutadas!==0||b.consumo.sinMedicion!==0)f.push("respuestas_o_medicion");
 for(const k of ["principalBruta","estrictaBruta","principalNormalizada","estrictaNormalizada"] as const)if(b7[k]<45)f.push(k);
 for(const k of ["omitidasBrutas","omitidasNormalizadas","extrasBrutas","extrasNormalizadas","deficitBruto","deficitNormalizado","excedenteBruto","excedenteNormalizado","camposBrutosDiscrepantes","porAccionBruta","camposInventados","porAccion"] as const)if(b7[k]!==0)f.push(k);
 if(b7.casosEmpeorados.length||b7.casosCoberturaIncompleta.length||b7.alertas.length||r.repeticiones.length)f.push("regresion_alerta_o_cobertura");
 if(b6.consumo.entrada<=0||b7.consumo.entrada>b6.consumo.entrada*1.1)f.push("tokens");
 if(b6.medianaMs===null||b7.medianaMs===null||b7.medianaMs>b6.medianaMs*1.3)f.push("latencia");
 if(auditoriaManual!=="aprobada")f.push("auditoria_manual_no_aprobada");
 return {aprobable:f.length===0,fallos:f};
}
