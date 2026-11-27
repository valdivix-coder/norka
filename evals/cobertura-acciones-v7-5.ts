import type { Interpretacion } from "../src/core/contracts/interpretacion";
// Cuenta acciones por captura sin cancelar déficit de una captura con exceso de otra.
// No identifica sustituciones de igual cardinalidad: requiere auditoría semántica/títulos separada.
// No cambia el contrato ni completa acciones automáticamente.
export function coberturaAcciones(actual:Interpretacion,esperado:Interpretacion){
 const entregadas=actual.elementos.length,esperadas=esperado.elementos.length;
 const deficit=Math.max(0,esperadas-entregadas),excedente=Math.max(0,entregadas-esperadas);
 return {esperadas,entregadas,deficit,excedente,cantidadCompleta:deficit===0&&excedente===0};
}
