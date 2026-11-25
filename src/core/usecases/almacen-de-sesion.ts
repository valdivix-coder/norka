import { FueraDeFamilia } from "../domain/familia";
import type { AlmacenFamilia } from "../ports/almacen";
import type { AlmacenPertenencias } from "../ports/pertenencias";
import type { AlmacenSesiones } from "../ports/sesiones";
import type { Reloj } from "../ports/reloj";
import { validarSesion } from "./sesion";

type Dependencias = {
  sesiones: AlmacenSesiones;
  pertenencias: AlmacenPertenencias;
  reloj: Reloj;
  paraFamilia: (familiaId: string) => AlmacenFamilia;
};

// familiaId es una selección, nunca una autorización. La cuenta sale de la sesión.
export async function almacenDeSesion(
  hash: string,
  familiaId: string,
  dependencias: Dependencias,
): Promise<AlmacenFamilia> {
  const { sesiones, pertenencias, reloj, paraFamilia } = dependencias;
  async function autorizar() {
    const { cuenta_id } = await validarSesion(hash, sesiones, reloj);
    if (
      !familiaId.trim() ||
      !(await pertenencias.esIntegranteActivo(cuenta_id, familiaId))
    )
      throw new FueraDeFamilia();
  }
  await autorizar();
  const almacen = paraFamilia(familiaId);
  // No se conserva una autorización indefinidamente: cada operación la revalida.
  return {
    async listar(tabla) {
      await autorizar();
      return almacen.listar(tabla);
    },
    async obtener(tabla, id) {
      await autorizar();
      return almacen.obtener(tabla, id);
    },
    async crear(tabla, registro) {
      const copia = structuredClone(registro);
      await autorizar();
      return almacen.crear(tabla, copia);
    },
    async actualizar(tabla, registro) {
      const copia = structuredClone(registro);
      await autorizar();
      return almacen.actualizar(tabla, copia);
    },
  };
}
