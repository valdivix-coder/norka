import { SesionInvalida } from "../domain/cuenta";
import type { AlmacenSesiones } from "../ports/sesiones";
import type { Reloj } from "../ports/reloj";

// Decisión de producto pendiente de confirmar por Simón: 30 días.
export const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000;

export async function abrirSesion(
  cuentaId: string,
  hashToken: string,
  almacen: AlmacenSesiones,
  reloj: Reloj,
): Promise<{ caduca_en_ms: number }> {
  const ahora = reloj.ahoraMs();
  const caduca_en_ms = ahora + DURACION_SESION_MS;
  await almacen.crear({
    cuenta_id: cuentaId,
    hash_token: hashToken,
    creada_en_ms: ahora,
    caduca_en_ms,
  });
  return { caduca_en_ms };
}

// Devuelve la cuenta de la sesión, o lanza SesionInvalida si no existe, caducó o se cerró.
export async function validarSesion(
  hashToken: string,
  almacen: AlmacenSesiones,
  reloj: Reloj,
): Promise<{ cuenta_id: string }> {
  const registro = await almacen.buscarPorHash(hashToken);
  if (!registro || registro.revocada || registro.caduca_en_ms <= reloj.ahoraMs())
    throw new SesionInvalida();
  return { cuenta_id: registro.cuenta_id };
}

export async function cerrarSesion(
  hashToken: string,
  almacen: AlmacenSesiones,
): Promise<void> {
  await almacen.revocar(hashToken);
}
