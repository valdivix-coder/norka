import {
  ConflictoUnico,
  type Cuenta,
  type Identidad,
  type Proveedor,
  type SesionRegistro,
} from "../core/domain/cuenta";
import type { AlmacenCuentas } from "../core/ports/cuentas";
import type { AlmacenSesiones } from "../core/ports/sesiones";

// Para pruebas y la muestra. Imita las restricciones únicas de 0001 y 0003.
export class CuentasMemoria implements AlmacenCuentas, AlmacenSesiones {
  readonly cuentas: Cuenta[] = [];
  readonly identidades: Identidad[] = [];
  readonly sesiones: SesionRegistro[] = [];

  async buscarIdentidad(proveedor: Proveedor, sub: string) {
    const f = this.identidades.find(
      (i) => i.proveedor === proveedor && i.sub === sub,
    );
    return f ? { ...f } : null;
  }
  async buscarCuenta(id: string) {
    const f = this.cuentas.find((c) => c.id === id);
    return f ? { ...f } : null;
  }
  async buscarCuentaPorCorreo(correo: string) {
    const f = this.cuentas.find((c) => c.correo === correo);
    return f ? { ...f } : null;
  }
  async listarIdentidades(cuentaId: string) {
    return this.identidades
      .filter((i) => i.cuenta_id === cuentaId)
      .map((i) => ({ ...i }));
  }
  async crearCuenta(datos: Omit<Cuenta, "id">) {
    if (this.cuentas.some((c) => c.correo === datos.correo))
      throw new ConflictoUnico();
    const cuenta = { ...datos, id: crypto.randomUUID() };
    this.cuentas.push(cuenta);
    return { ...cuenta };
  }
  async agregarIdentidad(datos: Omit<Identidad, "id">) {
    if (
      this.identidades.some(
        (i) => i.proveedor === datos.proveedor && i.sub === datos.sub,
      )
    )
      throw new ConflictoUnico();
    const identidad = { ...datos, id: crypto.randomUUID() };
    this.identidades.push(identidad);
    return { ...identidad };
  }

  async crear(registro: Omit<SesionRegistro, "revocada">) {
    if (this.sesiones.some((s) => s.hash_token === registro.hash_token))
      throw new ConflictoUnico();
    this.sesiones.push({ ...registro, revocada: false });
  }
  async buscarPorHash(hash: string) {
    const f = this.sesiones.find((s) => s.hash_token === hash);
    return f ? { ...f } : null;
  }
  async revocar(hash: string) {
    const f = this.sesiones.find((s) => s.hash_token === hash);
    if (f) f.revocada = true;
  }
}
