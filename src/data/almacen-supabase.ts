import {
  ConflictoRevision,
  FueraDeFamilia,
  RegistroAusente,
  type DatosFamilia,
} from "../core/domain/familia";
import type { AlmacenFamilia, TablaFamilia } from "../core/ports/almacen";

type Configuracion = {
  url: string;
  claveServicio: string;
  familiaId: string;
  solicitar?: typeof fetch;
};

// Adaptador REST del servidor. Nunca se pasa la clave a una pantalla.
export function crearAlmacenSupabase({
  url,
  claveServicio,
  familiaId,
  solicitar = fetch,
}: Configuracion): AlmacenFamilia {
  if (typeof window !== "undefined") throw new Error("SOLO_SERVIDOR");
  if (!familiaId.trim()) throw new FueraDeFamilia();
  if (!claveServicio) throw new Error("FALTA_CLAVE_SERVICIO");
  const origen = new URL(url);
  if (origen.protocol !== "https:") throw new Error("SUPABASE_REQUIERE_HTTPS");

  function comprobar<T extends TablaFamilia>(registro: DatosFamilia[T]) {
    if (registro.familia_id !== familiaId) throw new FueraDeFamilia();
  }
  async function consulta<T extends TablaFamilia>(
    tabla: T,
    metodo: string,
    filtros: Record<string, string> = {},
    registro?: DatosFamilia[T],
  ): Promise<DatosFamilia[T][]> {
    if (tabla !== "personas_a_cargo" && tabla !== "ambitos")
      throw new Error("TABLA_INVALIDA");
    const destino = new URL("/rest/v1/" + tabla, origen);
    destino.search = new URLSearchParams({
      ...filtros,
      familia_id: "eq." + familiaId,
      select: "*",
    }).toString();
    const respuesta = await solicitar(destino, {
      method: metodo,
      cache: "no-store",
      redirect: "error",
      headers: {
        apikey: claveServicio,
        Authorization: "Bearer " + claveServicio,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: registro ? JSON.stringify(registro) : undefined,
    });
    if (!respuesta.ok) throw new Error("ERROR_ALMACEN_" + respuesta.status);
    const filas: DatosFamilia[T][] = await respuesta.json();
    if (!Array.isArray(filas)) throw new Error("RESPUESTA_ALMACEN_INVALIDA");
    filas.forEach(comprobar);
    return filas;
  }
  async function obtener<T extends TablaFamilia>(tabla: T, id: string) {
    const filas = await consulta(tabla, "GET", { id: "eq." + id });
    if (!filas.length) throw new RegistroAusente();
    if (filas.length !== 1 || filas[0].id !== id)
      throw new Error("RESPUESTA_ALMACEN_INVALIDA");
    return filas[0];
  }
  return {
    listar: (tabla) => consulta(tabla, "GET"),
    obtener,
    async crear(tabla, registro) {
      comprobar(registro);
      if (registro.revision !== 0) throw new Error("REVISION_INICIAL_INVALIDA");
      const filas = await consulta(tabla, "POST", {}, registro);
      if (filas.length !== 1 || filas[0].id !== registro.id)
        throw new Error("RESPUESTA_ALMACEN_INVALIDA");
      return filas[0];
    },
    async actualizar(tabla, registro) {
      comprobar(registro);
      const filas = await consulta(
        tabla,
        "PATCH",
        {
          id: "eq." + registro.id,
          revision: "eq." + registro.revision,
        },
        { ...registro, revision: registro.revision + 1 },
      );
      if (!filas.length)
        throw new ConflictoRevision(await obtener(tabla, registro.id));
      if (filas.length !== 1 || filas[0].id !== registro.id)
        throw new Error("RESPUESTA_ALMACEN_INVALIDA");
      return filas[0];
    },
  };
}
