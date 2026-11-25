import type { AlmacenPertenencias } from "../core/ports/pertenencias";

type Configuracion = {
  url: string;
  claveServicio: string;
  solicitar?: typeof fetch;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function crearPertenenciasSupabase({
  url,
  claveServicio,
  solicitar = fetch,
}: Configuracion): AlmacenPertenencias {
  if (typeof window !== "undefined") throw new Error("SOLO_SERVIDOR");
  const origen = new URL(url);
  if (origen.protocol !== "https:") throw new Error("SUPABASE_REQUIERE_HTTPS");
  if (!claveServicio) throw new Error("FALTA_CLAVE_SERVICIO");
  return {
    async esIntegranteActivo(cuentaId, familiaId) {
      if (!uuid.test(cuentaId) || !uuid.test(familiaId)) return false;
      const destino = new URL("/rest/v1/integrantes", origen);
      destino.search = new URLSearchParams({
        cuenta_id: "eq." + cuentaId,
        familia_id: "eq." + familiaId,
        estado: "eq.activo",
        select: "cuenta_id,familia_id,estado",
        limit: "2",
      }).toString();
      const respuesta = await solicitar(destino, {
        cache: "no-store",
        redirect: "error",
        headers: { apikey: claveServicio },
      });
      if (!respuesta.ok)
        throw new Error("ERROR_PERTENENCIA_" + respuesta.status);
      const filas: unknown = await respuesta.json();
      if (!Array.isArray(filas) || filas.length > 1)
        throw new Error("RESPUESTA_PERTENENCIA_INVALIDA");
      if (!filas.length) return false;
      const fila = filas[0];
      if (
        !fila ||
        fila.cuenta_id !== cuentaId ||
        fila.familia_id !== familiaId ||
        fila.estado !== "activo"
      )
        throw new Error("RESPUESTA_PERTENENCIA_INVALIDA");
      return true;
    },
  };
}
