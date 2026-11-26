export type PersonaACargo = {
  id: string;
  familia_id: string;
  tipo: "hija_hijo" | "mascota" | "adulto_dependiente" | "hogar";
  nombre: string;
  cumple_dia: number | null;
  cumple_mes: number | null;
  anio_nacimiento: number | null;
  va_al_colegio: boolean;
  color: string;
  icono: string;
  archivada_en: string | null;
  revision: number;
};

export type Ambito = {
  id: string;
  familia_id: string;
  nombre: string;
  color: string;
  icono: string;
  orden: number;
  exige_plazo: boolean;
  revision: number;
};

export type DatosFamilia = {
  personas_a_cargo: PersonaACargo;
  ambitos: Ambito;
};

export class FueraDeFamilia extends Error {
  constructor() {
    super("FUERA_DE_FAMILIA");
  }
}
export class ConflictoRevision extends Error {
  constructor(public readonly actual: PersonaACargo | Ambito) {
    super("CONFLICTO_REVISION");
  }
}
export class RegistroAusente extends Error {
  constructor() {
    super("REGISTRO_AUSENTE");
  }
}
