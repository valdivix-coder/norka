import {
  ConflictoUnico,
  type Cuenta,
  type Identidad,
  type Proveedor,
  type SesionRegistro,
} from "../core/domain/cuenta";
import type { AlmacenCuentas } from "../core/ports/cuentas";
import type { AlmacenSesiones } from "../core/ports/sesiones";

type Configuracion = {
  url: string;
  claveServicio: string;
  solicitar?: typeof fetch;
};

type FilaSesion = {
  cuenta_id: string;
  hash_token: string;
  creada_en: string;
  caduca_en: string;
  revocada_en: string | null;
};

// Adaptador REST del servidor para cuentas, identidades y sesiones (0001 y 0003).
// La clave de servicio nunca sale de aquí ni se escribe en registros.
export function crearAlmacenCuentasSupabase({
  url,
  claveServicio,
  solicitar = fetch,
}: Configuracion): AlmacenCuentas & AlmacenSesiones {
  if (typeof window !== "undefined") throw new Error("SOLO_SERVIDOR");
  if (!claveServicio) throw new Error("FALTA_CLAVE_SERVICIO");
  const origen = new URL(url);
  if (origen.protocol !== "https:") throw new Error("SUPABASE_REQUIERE_HTTPS");

  async function consulta<T>(
    tabla: "cuentas" | "identidades" | "sesiones",
    metodo: "GET" | "POST" | "PATCH",
    filtros: Record<string, string>,
    cuerpo?: unknown,
  ): Promise<T[]> {
    const destino = new URL("/rest/v1/" + tabla, origen);
    destino.search = new URLSearchParams({ ...filtros, select: "*" }).toString();
    const respuesta = await solicitar(destino, {
      method: metodo,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        apikey: claveServicio,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    if (respuesta.status === 409) throw new ConflictoUnico();
    if (!respuesta.ok) throw new Error("ERROR_ALMACEN_" + respuesta.status);
    const filas: T[] = await respuesta.json();
    if (!Array.isArray(filas)) throw new Error("RESPUESTA_ALMACEN_INVALIDA");
    return filas;
  }
  const una = <T>(filas: T[]): T | null => {
    if (filas.length > 1) throw new Error("RESPUESTA_ALMACEN_INVALIDA");
    return filas[0] ?? null;
  };
  const aSesion = (f: FilaSesion): SesionRegistro => ({
    cuenta_id: f.cuenta_id,
    hash_token: f.hash_token,
    creada_en_ms: Date.parse(f.creada_en),
    caduca_en_ms: Date.parse(f.caduca_en),
    revocada: f.revocada_en !== null,
  });

  return {
    async buscarIdentidad(proveedor: Proveedor, sub: string) {
      return una(
        await consulta<Identidad>("identidades", "GET", {
          proveedor: "eq." + proveedor,
          sub: "eq." + sub,
        }),
      );
    },
    async buscarCuenta(id: string) {
      return una(await consulta<Cuenta>("cuentas", "GET", { id: "eq." + id }));
    },
    async buscarCuentaPorCorreo(correo: string) {
      // El correo se guarda normalizado, así que basta la igualdad exacta
      // (ilike trataría «_» y «%» como comodines y podría unir cuentas ajenas).
      const cuenta = una(
        await consulta<Cuenta>("cuentas", "GET", { correo: "eq." + correo }),
      );
      return cuenta && cuenta.correo === correo ? cuenta : null;
    },
    listarIdentidades: (cuentaId: string) =>
      consulta<Identidad>("identidades", "GET", { cuenta_id: "eq." + cuentaId }),
    async crearCuenta(datos) {
      const fila = una(await consulta<Cuenta>("cuentas", "POST", {}, datos));
      if (!fila) throw new Error("RESPUESTA_ALMACEN_INVALIDA");
      return fila;
    },
    async agregarIdentidad(datos) {
      const fila = una(
        await consulta<Identidad>("identidades", "POST", {}, datos),
      );
      if (!fila) throw new Error("RESPUESTA_ALMACEN_INVALIDA");
      return fila;
    },

    async crear(registro) {
      await consulta("sesiones", "POST", {}, {
        cuenta_id: registro.cuenta_id,
        hash_token: registro.hash_token,
        creada_en: new Date(registro.creada_en_ms).toISOString(),
        caduca_en: new Date(registro.caduca_en_ms).toISOString(),
      });
    },
    async buscarPorHash(hash: string) {
      const fila = una(
        await consulta<FilaSesion>("sesiones", "GET", { hash_token: "eq." + hash }),
      );
      return fila ? aSesion(fila) : null;
    },
    async revocar(hash: string) {
      await consulta(
        "sesiones",
        "PATCH",
        { hash_token: "eq." + hash, revocada_en: "is.null" },
        { revocada_en: new Date().toISOString() },
      );
    },
  };
}
