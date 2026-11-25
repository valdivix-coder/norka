// Solo servidor. No expone perfiles, teléfonos ni datos de otras familias.
export interface AlmacenPertenencias {
  esIntegranteActivo(cuentaId: string, familiaId: string): Promise<boolean>;
}
