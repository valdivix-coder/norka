import type { CapturaPendiente, CapturaGuardada, EntradaCaptura } from "../domain/captura";
export interface AlmacenCaptura {
  guardar(entrada:EntradaCaptura):Promise<CapturaGuardada>;
}
export interface ColaCapturas {
  guardar(entrada:CapturaPendiente):Promise<void>;
  listar(cuentaId:string,familiaId:string):Promise<CapturaPendiente[]>;
  quitar(entrada:CapturaPendiente):Promise<void>;
}
