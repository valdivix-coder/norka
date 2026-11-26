import type { DatosFamilia } from "../domain/familia";

export type TablaFamilia = keyof DatosFamilia;

// La familia se fija al crear el almacén desde la sesión verificada del servidor.
export interface AlmacenFamilia {
  listar<T extends TablaFamilia>(tabla: T): Promise<DatosFamilia[T][]>;
  obtener<T extends TablaFamilia>(
    tabla: T,
    id: string,
  ): Promise<DatosFamilia[T]>;
  crear<T extends TablaFamilia>(
    tabla: T,
    registro: DatosFamilia[T],
  ): Promise<DatosFamilia[T]>;
  actualizar<T extends TablaFamilia>(
    tabla: T,
    registro: DatosFamilia[T],
  ): Promise<DatosFamilia[T]>;
}
