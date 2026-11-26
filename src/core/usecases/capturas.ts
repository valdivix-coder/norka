import { validarCaptura, type CapturaGuardada } from "../domain/captura";
import type { AlmacenCaptura, ColaCapturas } from "../ports/captura";
export async function guardarCaptura(dato:unknown, almacen:AlmacenCaptura):Promise<CapturaGuardada> {
  return almacen.guardar(validarCaptura(dato));
}
export async function sincronizarCapturas(cola:ColaCapturas,cuentaId:string,familiaId:string,almacen:AlmacenCaptura) {
  let enviadas=0;
  let ultima:{entrada:import('../domain/captura').EntradaCaptura;guardada:CapturaGuardada}|null=null;
  const pendientes=await cola.listar(cuentaId,familiaId);
  for(const p of pendientes){
    if(p.cuentaId!==cuentaId || p.familiaId!==familiaId) continue;
    try { const guardada=await guardarCaptura(p,almacen); await cola.quitar(p); enviadas++; ultima={entrada:{id:p.id,texto:p.texto,origen:p.origen},guardada}; }
    catch { break; } // conservar toda entrada cuyo guardado no fue confirmado
  }
  return {enviadas,ultima,pendientes:(await cola.listar(cuentaId,familiaId)).length};
}
