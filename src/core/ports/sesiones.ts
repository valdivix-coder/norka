import type { SesionRegistro } from "../domain/cuenta";

// Solo se guarda el hash del token. El token en claro vive únicamente en la cookie.
export interface AlmacenSesiones {
  crear(registro: Omit<SesionRegistro, "revocada">): Promise<void>;
  buscarPorHash(hash: string): Promise<SesionRegistro | null>;
  revocar(hash: string): Promise<void>;
}
