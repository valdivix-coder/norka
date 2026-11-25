import type {
  Cumpleanos,
  Integrante,
  Participacion,
  RolFamiliar,
} from "../domain/integrante";

export type NuevaFamilia = {
  cuenta_id: string;
  nombre: string;
  rol_familiar: RolFamiliar;
  rol_etiqueta: string | null;
  participacion: Participacion;
  cumple: Cumpleanos;
  telefono: string | null;
};

export type ResumenFamilia = {
  familia_id: string;
  nombre: string;
  integrante_id: string;
  permiso: "administrador" | "integrante";
};

export type NuevaInvitacion = {
  familia_id: string;
  creada_por: string;
  rol_familiar: RolFamiliar;
  participacion: Participacion;
  hash_codigo: string; // el código en claro nunca llega aquí
  creada_en_ms: number;
  caduca_en_ms: number;
};

export type VistaInvitacion = {
  familia_nombre: string;
  rol_familiar: RolFamiliar;
  participacion: Participacion;
  caduca_en_ms: number;
  usada: boolean;
};

export type CambiosPerfil = {
  rol_familiar: RolFamiliar;
  rol_etiqueta: string | null;
  cumple: Cumpleanos;
  telefono: string | null;
};

// Acceso a familias, integrantes e invitaciones. Solo lo usa el servidor.
export interface AlmacenFamilias {
  // Atómico: familia, hogar, ámbitos y su administrador, o nada.
  crearFamilia(datos: NuevaFamilia): Promise<{ familia_id: string; integrante_id: string }>;
  familiasDeCuenta(cuentaId: string): Promise<ResumenFamilia[]>;
  obtenerNombre(familiaId: string): Promise<string | null>;
  listarIntegrantes(familiaId: string): Promise<Integrante[]>;
  crearInvitacion(datos: NuevaInvitacion): Promise<void>;
  vistaInvitacion(hashCodigo: string): Promise<VistaInvitacion | null>;
  // Atómico y de un solo uso. Lanza InvitacionNoValida.
  aceptarInvitacion(datos: {
    hash_codigo: string;
    cuenta_id: string;
    ahora_ms: number;
    cumple: Cumpleanos;
    telefono: string | null;
  }): Promise<{ familia_id: string; integrante_id: string }>;
  // Lanza ConflictoPerfil si la revisión cambió.
  actualizarPerfil(
    integrante: Integrante,
    cambios: CambiosPerfil,
  ): Promise<Integrante>;
}
