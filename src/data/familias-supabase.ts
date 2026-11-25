import {
  ConflictoPerfil,
  InvitacionNoValida,
  type Integrante,
} from "../core/domain/integrante";
import type {
  AlmacenFamilias,
  ResumenFamilia,
  VistaInvitacion,
} from "../core/ports/familias";

type Configuracion = {
  url: string;
  claveServicio: string;
  solicitar?: typeof fetch;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hash = /^[0-9a-f]{64}$/;
const MOTIVOS = [
  "INVITACION_NO_EXISTE",
  "INVITACION_USADA",
  "INVITACION_CADUCADA",
  "YA_ES_INTEGRANTE",
] as const;

type FilaIntegrante = Omit<Integrante, "nombre"> & { cuentas: { nombre: string } | null };

const aIntegrante = ({ cuentas, ...resto }: FilaIntegrante): Integrante => ({
  ...resto,
  nombre: cuentas?.nombre ?? "Integrante",
});

// Adaptador REST del servidor. Cada consulta lleva el identificador de la familia o de la
// invitación; las operaciones atómicas usan las funciones de la migración 0004.
export function crearAlmacenFamiliasSupabase({
  url,
  claveServicio,
  solicitar = fetch,
}: Configuracion): AlmacenFamilias {
  if (typeof window !== "undefined") throw new Error("SOLO_SERVIDOR");
  if (!claveServicio) throw new Error("FALTA_CLAVE_SERVICIO");
  const origen = new URL(url);
  if (origen.protocol !== "https:") throw new Error("SUPABASE_REQUIERE_HTTPS");

  async function pedir(
    ruta: string,
    metodo: "GET" | "POST" | "PATCH",
    filtros: Record<string, string> = {},
    cuerpo?: unknown,
  ): Promise<unknown> {
    const destino = new URL("/rest/v1/" + ruta, origen);
    destino.search = new URLSearchParams(filtros).toString();
    const respuesta = await solicitar(destino, {
      method: metodo,
      cache: "no-store",
      redirect: "error",
      headers: {
        apikey: claveServicio,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    if (!respuesta.ok) {
      // Solo se reconocen los motivos conocidos; el resto no se copia a ningún error.
      let mensaje = "";
      try {
        mensaje = String(((await respuesta.json()) as { message?: unknown }).message ?? "");
      } catch {
        /* sin cuerpo legible */
      }
      const motivo = MOTIVOS.find((m) => m === mensaje);
      if (motivo) throw new InvitacionNoValida(motivo);
      throw new Error("ERROR_ALMACEN_" + respuesta.status);
    }
    return respuesta.json();
  }
  const filas = async <T>(ruta: string, filtros: Record<string, string>) => {
    const r = await pedir(ruta, "GET", filtros);
    if (!Array.isArray(r)) throw new Error("RESPUESTA_ALMACEN_INVALIDA");
    return r as T[];
  };
  const ids = (r: unknown) => {
    const o = r as { familia_id?: unknown; integrante_id?: unknown };
    if (typeof o?.familia_id !== "string" || typeof o?.integrante_id !== "string")
      throw new Error("RESPUESTA_ALMACEN_INVALIDA");
    return { familia_id: o.familia_id, integrante_id: o.integrante_id };
  };
  async function listar(familiaId: string) {
    if (!uuid.test(familiaId)) return [];
    const r = await filas<FilaIntegrante>("integrantes", {
      familia_id: "eq." + familiaId,
      estado: "eq.activo",
      order: "creado_en.asc,id.asc",
      select:
        "id,familia_id,cuenta_id,rol_familiar,rol_etiqueta,permiso,participacion,cuota_objetivo,color,icono,cumple_dia,cumple_mes,telefono,revision,cuentas(nombre)",
    });
    r.forEach((f) => {
      if (f.familia_id !== familiaId) throw new Error("RESPUESTA_ALMACEN_INVALIDA");
    });
    return r.map(aIntegrante);
  }

  return {
    async crearFamilia(d) {
      if (!uuid.test(d.cuenta_id)) throw new Error("CUENTA_INVALIDA");
      return ids(
        await pedir("rpc/crear_familia", "POST", {}, {
          p_cuenta: d.cuenta_id,
          p_nombre: d.nombre,
          p_rol: d.rol_familiar,
          p_etiqueta: d.rol_etiqueta,
          p_participacion: d.participacion,
          p_cumple_dia: d.cumple.dia,
          p_cumple_mes: d.cumple.mes,
          p_telefono: d.telefono,
        }),
      );
    },
    async familiasDeCuenta(cuentaId): Promise<ResumenFamilia[]> {
      if (!uuid.test(cuentaId)) return [];
      const r = await filas<{
        id: string;
        familia_id: string;
        permiso: "administrador" | "integrante";
        familias: { nombre: string } | null;
      }>("integrantes", {
        cuenta_id: "eq." + cuentaId,
        estado: "eq.activo",
        select: "id,familia_id,permiso,familias(nombre)",
      });
      return r.map((f) => ({
        familia_id: f.familia_id,
        nombre: f.familias?.nombre ?? "",
        integrante_id: f.id,
        permiso: f.permiso,
      }));
    },
    async obtenerNombre(familiaId) {
      if (!uuid.test(familiaId)) return null;
      const r = await filas<{ nombre: string }>("familias", {
        id: "eq." + familiaId,
        select: "nombre",
      });
      return r[0]?.nombre ?? null;
    },
    listarIntegrantes: listar,
    async crearInvitacion(d) {
      if (!uuid.test(d.familia_id) || !uuid.test(d.creada_por) || !hash.test(d.hash_codigo))
        throw new Error("INVITACION_INVALIDA");
      await pedir("invitaciones", "POST", {}, {
        familia_id: d.familia_id,
        creada_por: d.creada_por,
        rol_familiar: d.rol_familiar,
        participacion: d.participacion,
        hash_codigo: d.hash_codigo,
        creado_en: new Date(d.creada_en_ms).toISOString(),
        caduca_en: new Date(d.caduca_en_ms).toISOString(),
      });
    },
    async vistaInvitacion(h): Promise<VistaInvitacion | null> {
      if (!hash.test(h)) return null;
      const r = await filas<{
        rol_familiar: VistaInvitacion["rol_familiar"];
        participacion: VistaInvitacion["participacion"];
        caduca_en: string;
        usada_en: string | null;
        familias: { nombre: string } | null;
      }>("invitaciones", {
        hash_codigo: "eq." + h,
        select: "rol_familiar,participacion,caduca_en,usada_en,familias(nombre)",
      });
      const f = r[0];
      if (!f) return null;
      return {
        familia_nombre: f.familias?.nombre ?? "",
        rol_familiar: f.rol_familiar,
        participacion: f.participacion,
        caduca_en_ms: Date.parse(f.caduca_en),
        usada: f.usada_en !== null,
      };
    },
    async aceptarInvitacion(d) {
      if (!hash.test(d.hash_codigo)) throw new InvitacionNoValida("INVITACION_NO_EXISTE");
      if (!uuid.test(d.cuenta_id)) throw new Error("CUENTA_INVALIDA");
      return ids(
        await pedir("rpc/aceptar_invitacion", "POST", {}, {
          p_hash: d.hash_codigo,
          p_cuenta: d.cuenta_id,
          p_ahora: new Date(d.ahora_ms).toISOString(),
          p_cumple_dia: d.cumple.dia,
          p_cumple_mes: d.cumple.mes,
          p_telefono: d.telefono,
        }),
      );
    },
    async actualizarPerfil(integrante, c) {
      if (!uuid.test(integrante.id) || !uuid.test(integrante.familia_id))
        throw new Error("INTEGRANTE_INVALIDO");
      const r = (await pedir(
        "integrantes",
        "PATCH",
        {
          id: "eq." + integrante.id,
          familia_id: "eq." + integrante.familia_id,
          revision: "eq." + integrante.revision,
          select: "id",
        },
        {
          rol_familiar: c.rol_familiar,
          rol_etiqueta: c.rol_etiqueta,
          cumple_dia: c.cumple.dia,
          cumple_mes: c.cumple.mes,
          telefono: c.telefono,
          revision: integrante.revision + 1,
        },
      )) as unknown[];
      const actual = (await listar(integrante.familia_id)).find((i) => i.id === integrante.id);
      if (!actual) throw new Error("REGISTRO_AUSENTE");
      if (!Array.isArray(r) || r.length === 0) throw new ConflictoPerfil(actual);
      return actual;
    },
  };
}
