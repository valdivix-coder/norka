import {
  NoEsIntegrante,
  SoloAdministrador,
  normalizarTelefono,
  validarCumpleanos,
  validarEtiqueta,
  validarNombreFamilia,
  validarParticipacion,
  validarRol,
  type EntradaTelefono,
  type Integrante,
} from "../domain/integrante";
import type {
  AlmacenFamilias,
  VistaInvitacion,
} from "../ports/familias";
import type { Reloj } from "../ports/reloj";

export const DURACION_INVITACION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días (glosario 5.1)

type DatosPerfil = {
  rol_familiar: string;
  rol_etiqueta?: string | null;
  participacion?: string;
  cumple_dia: number | null;
  cumple_mes: number | null;
  telefono: EntradaTelefono | null;
};

export async function crearFamiliaNueva(
  cuentaId: string,
  datos: DatosPerfil & { nombre: string; participacion: string },
  almacen: AlmacenFamilias,
) {
  return almacen.crearFamilia({
    cuenta_id: cuentaId,
    nombre: validarNombreFamilia(datos.nombre),
    rol_familiar: validarRol(datos.rol_familiar),
    rol_etiqueta: validarEtiqueta(datos.rol_etiqueta),
    participacion: validarParticipacion(datos.participacion),
    cumple: validarCumpleanos({ dia: datos.cumple_dia, mes: datos.cumple_mes }),
    telefono: normalizarTelefono(datos.telefono),
  });
}

// Solo integrantes activos pueden ver la familia. Los teléfonos salen únicamente por aquí.
export async function verFamilia(
  cuentaId: string,
  familiaId: string,
  almacen: AlmacenFamilias,
) {
  const integrantes = await almacen.listarIntegrantes(familiaId);
  const yo = integrantes.find((i) => i.cuenta_id === cuentaId);
  if (!yo) throw new NoEsIntegrante();
  const nombre = await almacen.obtenerNombre(familiaId);
  if (!nombre) throw new NoEsIntegrante();
  return { familia: { id: familiaId, nombre }, yo, integrantes };
}

// Solo el administrador invita (glosario 5.1). El código en claro se devuelve una vez
// para armar el enlace; en el almacén solo queda su hash.
export async function generarInvitacion(
  cuentaId: string,
  familiaId: string,
  datos: { rol_familiar: string; participacion: string },
  hashCodigo: string,
  almacen: AlmacenFamilias,
  reloj: Reloj,
) {
  const { yo } = await verFamilia(cuentaId, familiaId, almacen);
  if (yo.permiso !== "administrador") throw new SoloAdministrador();
  const ahora = reloj.ahoraMs();
  const caduca_en_ms = ahora + DURACION_INVITACION_MS;
  await almacen.crearInvitacion({
    familia_id: familiaId,
    creada_por: yo.id,
    rol_familiar: validarRol(datos.rol_familiar),
    participacion: validarParticipacion(datos.participacion),
    hash_codigo: hashCodigo,
    creada_en_ms: ahora,
    caduca_en_ms,
  });
  return { caduca_en_ms };
}

export async function verInvitacion(
  hashCodigo: string,
  almacen: AlmacenFamilias,
  reloj: Reloj,
): Promise<(VistaInvitacion & { vigente: boolean }) | null> {
  const vista = await almacen.vistaInvitacion(hashCodigo);
  if (!vista) return null;
  return { ...vista, vigente: !vista.usada && vista.caduca_en_ms > reloj.ahoraMs() };
}

export async function aceptarInvitacion(
  cuentaId: string,
  hashCodigo: string,
  extras: { cumple_dia: number | null; cumple_mes: number | null; telefono: EntradaTelefono | null },
  almacen: AlmacenFamilias,
  reloj: Reloj,
) {
  return almacen.aceptarInvitacion({
    hash_codigo: hashCodigo,
    cuenta_id: cuentaId,
    ahora_ms: reloj.ahoraMs(),
    cumple: validarCumpleanos({ dia: extras.cumple_dia, mes: extras.cumple_mes }),
    telefono: normalizarTelefono(extras.telefono),
  });
}

// Cada persona edita solo su propio perfil (teléfono, cumpleaños, rol). Cambiar la
// participación afecta el reparto de cuotas y se construye en la tarea 4.5.
export async function guardarMiPerfil(
  cuentaId: string,
  familiaId: string,
  revisionVista: number,
  datos: DatosPerfil,
  almacen: AlmacenFamilias,
): Promise<Integrante> {
  const { yo } = await verFamilia(cuentaId, familiaId, almacen);
  const cambios = {
    rol_familiar: validarRol(datos.rol_familiar),
    rol_etiqueta: validarEtiqueta(datos.rol_etiqueta),
    cumple: validarCumpleanos({ dia: datos.cumple_dia, mes: datos.cumple_mes }),
    telefono: normalizarTelefono(datos.telefono),
  };
  // Si la pantalla estaba desactualizada, el almacén responde con el conflicto y lo vigente.
  return almacen.actualizarPerfil({ ...yo, revision: revisionVista }, cambios);
}
