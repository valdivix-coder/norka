import { ConflictoRevision, type PersonaACargo } from "../domain/familia";
import type { AlmacenFamilia } from "../ports/almacen";
import { guardarPersona } from "./personas-a-cargo";

export type CambioPersona =
  | { tipo: "crear" | "editar"; persona: PersonaACargo }
  | { tipo: "archivar" | "restaurar"; id: string; revision: number };

export const esUuid = (id: unknown): id is string =>
  typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function colorPersona(color: string, tipo: PersonaACargo["tipo"]): string {
  if (tipo === "hogar") return "var(--persona-hogar)";
  const token = /^var\(--(persona-[1-8])\)$/.exec(color)?.[1] ?? color;
  return /^persona-[1-8]$/.test(token) ? `var(--${token})` : "var(--persona-1)";
}

export async function cambiarPersonaReal(
  almacen: AlmacenFamilia, familiaId: string, cambio: CambioPersona,
  idNuevo: () => string, ahora: () => string, anioActual: number,
): Promise<{ actual: PersonaACargo; anterior: PersonaACargo | null }> {
  if (!esUuid(familiaId) || !cambio || typeof cambio !== "object")
    throw new Error("DATOS_INVALIDOS");
  if (cambio.tipo === "archivar" || cambio.tipo === "restaurar") {
    if (!esUuid(cambio.id) || !Number.isSafeInteger(cambio.revision) || cambio.revision < 0)
      throw new Error("DATOS_INVALIDOS");
    const anterior = await almacen.obtener("personas_a_cargo", cambio.id);
    if (anterior.revision !== cambio.revision) throw new ConflictoRevision(anterior);
    if (anterior.tipo === "hogar") throw new Error("HOGAR_NO_ARCHIVABLE");
    if (Boolean(anterior.archivada_en) !== (cambio.tipo === "restaurar"))
      throw new Error("ESTADO_INVALIDO");
    const actual = await guardarPersona(almacen, {
      ...anterior, archivada_en: cambio.tipo === "archivar" ? ahora() : null,
    }, false);
    return { actual, anterior };
  }
  if (cambio.tipo !== "crear" && cambio.tipo !== "editar") throw new Error("DATOS_INVALIDOS");
  const p = cambio.persona;
  if (!p || typeof p.nombre !== "string" || !p.nombre.trim() || p.nombre.trim().length > 120 ||
      !["hija_hijo", "mascota", "adulto_dependiente"].includes(p.tipo) ||
      !Number.isSafeInteger(p.revision) || p.revision < 0 ||
      typeof p.va_al_colegio !== "boolean" ||
      (p.cumple_dia !== null && !Number.isInteger(p.cumple_dia)) ||
      (p.cumple_mes !== null && !Number.isInteger(p.cumple_mes)) ||
      (p.anio_nacimiento !== null && (!Number.isInteger(p.anio_nacimiento) ||
       p.anio_nacimiento < 1 || p.anio_nacimiento > anioActual)) ||
      typeof p.color !== "string")
    throw new Error("DATOS_INVALIDOS");
  const color = /^var\(--(persona-[1-8])\)$/.exec(p.color)?.[1] ?? p.color;
  if (!/^persona-[1-8]$/.test(color)) throw new Error("DATOS_INVALIDOS");
  const nueva = cambio.tipo === "crear";
  if (!nueva && !esUuid(p.id)) throw new Error("DATOS_INVALIDOS");
  const anterior = nueva ? null : await almacen.obtener("personas_a_cargo", p.id);
  if (anterior && (anterior.tipo === "hogar" || anterior.archivada_en))
    throw new Error("ESTADO_INVALIDO");
  if (anterior && anterior.revision !== p.revision) throw new ConflictoRevision(anterior);
  const actual = await guardarPersona(almacen, {
    id: nueva ? idNuevo() : p.id, familia_id: familiaId, tipo: p.tipo,
    nombre: p.nombre.trim(), cumple_dia: p.cumple_dia, cumple_mes: p.cumple_mes,
    anio_nacimiento: p.anio_nacimiento, va_al_colegio: p.tipo === "hija_hijo" && p.va_al_colegio,
    color, icono: p.tipo === "mascota" ? "mascota" : "persona",
    archivada_en: null, revision: nueva ? 0 : p.revision,
  }, nueva);
  return { actual, anterior };
}
