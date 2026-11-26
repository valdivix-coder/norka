export const PROVEEDORES = ["google", "apple", "facebook"] as const;
export type Proveedor = (typeof PROVEEDORES)[number];

export type Cuenta = {
  id: string;
  correo: string; // siempre normalizado: sin espacios y en minúsculas
  nombre: string;
  foto_url: string | null;
};

export type Identidad = {
  id: string;
  cuenta_id: string;
  proveedor: Proveedor;
  sub: string;
  correo: string | null;
};

// Lo único que se conserva de lo que informa el proveedor. Nunca incluye tokens.
export type PerfilProveedor = {
  proveedor: Proveedor;
  sub: string;
  correo: string | null;
  correoVerificado: boolean;
  nombre: string | null;
  fotoUrl: string | null;
};

export type SesionRegistro = {
  cuenta_id: string;
  hash_token: string;
  creada_en_ms: number;
  caduca_en_ms: number;
  revocada: boolean;
};

export class CorreoNoVerificado extends Error {
  constructor() {
    super("CORREO_NO_VERIFICADO");
  }
}
export class IdentidadEnOtraCuenta extends Error {
  constructor() {
    super("IDENTIDAD_EN_OTRA_CUENTA");
  }
}
export class ConflictoUnico extends Error {
  constructor() {
    super("CONFLICTO_UNICO");
  }
}
export class SesionInvalida extends Error {
  constructor() {
    super("SESION_INVALIDA");
  }
}

export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}
