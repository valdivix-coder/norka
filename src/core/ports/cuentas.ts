import type { Cuenta, Identidad, Proveedor } from "../domain/cuenta";

// Acceso a cuentas e identidades. Solo lo usa el servidor.
export interface AlmacenCuentas {
  buscarIdentidad(proveedor: Proveedor, sub: string): Promise<Identidad | null>;
  buscarCuenta(id: string): Promise<Cuenta | null>;
  // El correo llega ya normalizado.
  buscarCuentaPorCorreo(correo: string): Promise<Cuenta | null>;
  listarIdentidades(cuentaId: string): Promise<Identidad[]>;
  // Lanzan ConflictoUnico si el correo o la identidad ya existen.
  crearCuenta(datos: Omit<Cuenta, "id">): Promise<Cuenta>;
  agregarIdentidad(datos: Omit<Identidad, "id">): Promise<Identidad>;
}
