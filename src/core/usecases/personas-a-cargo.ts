import type { PersonaACargo } from "../domain/familia";
import type { AlmacenFamilia } from "../ports/almacen";

export function validarPersona(persona: PersonaACargo) {
  if (!persona.nombre.trim()) throw new Error("NOMBRE_REQUERIDO");
  if ((persona.cumple_dia === null) !== (persona.cumple_mes === null)) {
    throw new Error("CUMPLEANOS_INCOMPLETO");
  }
  if (persona.cumple_mes !== null && persona.cumple_dia !== null) {
    const dias = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (
      !Number.isInteger(persona.cumple_mes) ||
      !Number.isInteger(persona.cumple_dia) ||
      persona.cumple_mes < 1 ||
      persona.cumple_mes > 12 ||
      persona.cumple_dia < 1 ||
      persona.cumple_dia > dias[persona.cumple_mes - 1]
    ) {
      throw new Error("CUMPLEANOS_INVALIDO");
    }
  }
  if (persona.tipo === "hogar" && persona.archivada_en)
    throw new Error("HOGAR_NO_ARCHIVABLE");
}
export async function guardarPersona(
  almacen: AlmacenFamilia,
  persona: PersonaACargo,
  nueva: boolean,
) {
  validarPersona(persona);
  if (nueva) return almacen.crear("personas_a_cargo", persona);
  const actual = await almacen.obtener("personas_a_cargo", persona.id);
  if (
    actual.tipo === "hogar" &&
    (persona.tipo !== "hogar" || persona.archivada_en)
  ) {
    throw new Error("HOGAR_NO_ARCHIVABLE");
  }
  return almacen.actualizar("personas_a_cargo", persona);
}
