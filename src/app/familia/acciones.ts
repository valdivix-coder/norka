"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ConflictoPerfil,
  DatoInvalido,
  InvitacionNoValida,
  NoEsIntegrante,
  SoloAdministrador,
  type EntradaTelefono,
} from "@/core/domain/integrante";
import {
  aceptarInvitacion,
  crearFamiliaNueva,
  generarInvitacion,
  guardarMiPerfil,
} from "@/core/usecases/familias";
import { aleatorioUrl, hashToken } from "@/lib/entrada/pkce";
import { almacenFamilias, cuentaActual, reloj } from "@/lib/familia/cuenta";
import { familia as m } from "@/mensajes/es-CL";

export type ClaveError = keyof typeof m.errores;
export type EstadoInvitacion = { enlace: string | null; error: ClaveError | null };

const texto = (f: FormData, k: string) => String(f.get(k) ?? "");
const numero = (f: FormData, k: string): number | null => {
  const v = texto(f, k).trim();
  return v === "" ? null : Number(v);
};
const telefono = (f: FormData): EntradaTelefono | null => {
  const valor = texto(f, "tel_valor");
  return valor.trim() === "" ? null : { modo: texto(f, "tel_modo") === "otro" ? "otro" : "chile", valor };
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clave(error: unknown): ClaveError {
  if (error instanceof DatoInvalido) {
    const c = error.campo as ClaveError;
    return c in m.errores ? c : "fallo";
  }
  return "fallo";
}

export async function crearFamiliaAccion(formulario: FormData) {
  const cuenta = await cuentaActual();
  if (!cuenta) redirect("/entrar");
  let destino: string;
  try {
    const { familia_id } = await crearFamiliaNueva(
      cuenta,
      {
        nombre: texto(formulario, "nombre"),
        rol_familiar: texto(formulario, "rol"),
        participacion: texto(formulario, "participacion"),
        cumple_dia: numero(formulario, "cumple_dia"),
        cumple_mes: numero(formulario, "cumple_mes"),
        telefono: telefono(formulario),
      },
      almacenFamilias(),
    );
    destino = `/familia/${familia_id}`;
  } catch (error) {
    destino = `/familia/nueva?error=${clave(error)}`;
  }
  redirect(destino);
}

export async function crearInvitacionAccion(
  _anterior: EstadoInvitacion,
  formulario: FormData,
): Promise<EstadoInvitacion> {
  const cuenta = await cuentaActual();
  if (!cuenta) redirect("/entrar");
  const familiaId = texto(formulario, "familiaId");
  if (!uuid.test(familiaId)) return { enlace: null, error: "fallo" };
  const codigo = aleatorioUrl(32);
  try {
    await generarInvitacion(
      cuenta,
      familiaId,
      { rol_familiar: texto(formulario, "rol"), participacion: texto(formulario, "participacion") },
      await hashToken(codigo),
      almacenFamilias(),
      reloj,
    );
  } catch (error) {
    if (error instanceof SoloAdministrador || error instanceof NoEsIntegrante)
      return { enlace: null, error: "fallo" };
    return { enlace: null, error: clave(error) };
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo = h.get("x-forwarded-proto") ?? "https";
  // El código viaja solo en esta respuesta: no se guarda ni se registra.
  return { enlace: `${protocolo}://${host}/invitacion/${codigo}`, error: null };
}

export async function aceptarInvitacionAccion(formulario: FormData) {
  const cuenta = await cuentaActual();
  const codigo = texto(formulario, "codigo");
  if (!/^[A-Za-z0-9_-]{43}$/.test(codigo)) redirect("/entrar");
  if (!cuenta) redirect(`/entrar?siguiente=/invitacion/${codigo}`);
  let destino: string;
  try {
    const { familia_id } = await aceptarInvitacion(
      cuenta,
      await hashToken(codigo),
      {
        cumple_dia: numero(formulario, "cumple_dia"),
        cumple_mes: numero(formulario, "cumple_mes"),
        telefono: telefono(formulario),
      },
      almacenFamilias(),
      reloj,
    );
    destino = `/familia/${familia_id}`;
  } catch (error) {
    destino =
      error instanceof InvitacionNoValida
        ? error.motivo === "YA_ES_INTEGRANTE"
          ? `/invitacion/${codigo}?estado=ya`
          : `/invitacion/${codigo}`
        : `/invitacion/${codigo}?error=${clave(error)}`;
  }
  redirect(destino);
}

export async function guardarPerfilAccion(formulario: FormData) {
  const cuenta = await cuentaActual();
  if (!cuenta) redirect("/entrar");
  const familiaId = texto(formulario, "familiaId");
  if (!uuid.test(familiaId)) redirect("/cuenta");
  let destino = `/familia/${familiaId}/perfil?guardado=1`;
  try {
    await guardarMiPerfil(
      cuenta,
      familiaId,
      Number(texto(formulario, "revision")),
      {
        rol_familiar: texto(formulario, "rol"),
        rol_etiqueta: texto(formulario, "etiqueta"),
        cumple_dia: numero(formulario, "cumple_dia"),
        cumple_mes: numero(formulario, "cumple_mes"),
        telefono: telefono(formulario),
      },
      almacenFamilias(),
    );
  } catch (error) {
    if (error instanceof NoEsIntegrante) redirect("/cuenta");
    destino = `/familia/${familiaId}/perfil?error=${error instanceof ConflictoPerfil ? "conflicto" : clave(error)}`;
  }
  redirect(destino);
}
