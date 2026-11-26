import { validarCaptura, type CapturaGuardada } from "../domain/captura";
import type { AlmacenCaptura, ColaCapturas } from "../ports/captura";
export async function guardarCaptura(dato:unknown, almacen:AlmacenCaptura):Promise<CapturaGuardada> {
  return almacen.guardar(validarCaptura(dato));
}
export async function sincronizarCapturas(cola:ColaCapturas,cuentaId:string,familiaId:string,almacen:AlmacenCaptura) {
  let enviadas=0;
  const pendientes=await cola.listar(cuentaId,familiaId);
  for(const p of pendientes){
    if(p.cuentaId!==cuentaId || p.familiaId!==familiaId) continue;
    try { await guardarCaptura(p,almacen); await cola.quitar(p); enviadas++; }
    catch { break; } // conservar toda entrada cuyo guardado no fue confirmado
  }
  return {enviadas,pendientes:(await cola.listar(cuentaId,familiaId)).length};
}
