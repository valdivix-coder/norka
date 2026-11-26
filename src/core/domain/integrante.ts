export const ROLES_FAMILIARES = [
  "madre",
  "padre",
  "cuidador",
  "abuelo",
  "tio",
  "otro",
] as const;
export type RolFamiliar = (typeof ROLES_FAMILIARES)[number];
export type Participacion = "corresponsable" | "apoyo";
export type Permiso = "administrador" | "integrante";

export type Integrante = {
  id: string;
  familia_id: string;
  cuenta_id: string;
  nombre: string;
  rol_familiar: RolFamiliar;
  rol_etiqueta: string | null;
  permiso: Permiso;
  participacion: Participacion;
  cuota_objetivo: number | null;
  color: string;
  icono: string;
  cumple_dia: number | null;
  cumple_mes: number | null;
  telefono: string | null;
  revision: number;
};

export type Cumpleanos = { dia: number | null; mes: number | null };
export type EntradaTelefono =
  | { modo: "chile"; valor: string }
  | { modo: "otro"; valor: string };

export class DatoInvalido extends Error {
  constructor(public readonly campo: string) {
    super("DATO_INVALIDO_" + campo.toUpperCase());
  }
}
export class NoEsIntegrante extends Error {
  constructor() {
    super("NO_ES_INTEGRANTE");
  }
}
export class SoloAdministrador extends Error {
  constructor() {
    super("SOLO_ADMINISTRADOR");
  }
}
export class InvitacionNoValida extends Error {
  constructor(
    public readonly motivo:
      | "INVITACION_NO_EXISTE"
      | "INVITACION_USADA"
      | "INVITACION_CADUCADA"
      | "YA_ES_INTEGRANTE",
  ) {
    super(motivo);
  }
}
export class ConflictoPerfil extends Error {
  constructor(public readonly actual: Integrante) {
    super("CONFLICTO_REVISION");
  }
}

const DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Cumpleaños opcional: día y mes van juntos o ninguno. El 29 de febrero es válido.
export function validarCumpleanos({ dia, mes }: Cumpleanos): Cumpleanos {
  if (dia === null && mes === null) return { dia: null, mes: null };
  if (dia === null || mes === null) throw new DatoInvalido("cumpleanos");
  if (
    !Number.isInteger(dia) ||
    !Number.isInteger(mes) ||
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > DIAS_POR_MES[mes - 1]
  )
    throw new DatoInvalido("cumpleanos");
  return { dia, mes };
}

// Chile: el prefijo «+56 9» es fijo y la persona escribe 8 dígitos exactos. Otro país:
// número internacional completo. Es opcional: vacío da null. Se guarda como «+569XXXXXXXX».
export function normalizarTelefono(entrada: EntradaTelefono | null): string | null {
  if (!entrada) return null;
  const limpio = entrada.valor.replace(/[\s\-().]/g, "");
  if (!limpio) return null;
  if (entrada.modo === "chile") {
    if (!/^\d{8}$/.test(limpio)) throw new DatoInvalido("telefono");
    return "+569" + limpio;
  }
  if (!/^\+[1-9]\d{1,14}$/.test(limpio)) throw new DatoInvalido("telefono");
  return limpio;
}

export function validarNombreFamilia(nombre: string): string {
  const limpio = nombre.trim().replace(/\s+/g, " ");
  if (!limpio || limpio.length > 60) throw new DatoInvalido("nombre");
  return limpio;
}

export function validarRol(rol: string): RolFamiliar {
  if (!(ROLES_FAMILIARES as readonly string[]).includes(rol))
    throw new DatoInvalido("rol");
  return rol as RolFamiliar;
}

export function validarParticipacion(valor: string): Participacion {
  if (valor !== "corresponsable" && valor !== "apoyo")
    throw new DatoInvalido("participacion");
  return valor;
}

export function validarEtiqueta(valor: string | null | undefined): string | null {
  const limpia = valor?.trim() ?? "";
  if (!limpia) return null;
  if (limpia.length > 20) throw new DatoInvalido("etiqueta");
  return limpia;
}

// Partes iguales que siempre suman 100 (por ejemplo, 3 corresponsables: 34, 33, 33).
export function repartoIgual(corresponsables: number): number[] {
  if (!Number.isInteger(corresponsables) || corresponsables < 1) return [];
  const base = Math.floor(100 / corresponsables);
  const resto = 100 % corresponsables;
  return Array.from({ length: corresponsables }, (_, i) => base + (i < resto ? 1 : 0));
}
