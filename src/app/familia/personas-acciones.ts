"use server";
import { ConflictoRevision } from "@/core/domain/familia";
import { cambiarPersonaReal, esUuid, type CambioPersona } from "@/core/usecases/personas-reales";
import { almacenFamiliaActual } from "@/lib/familia/servidor";

export async function cambiarPersonaAccion(familiaId: string, cambio: CambioPersona) {
  try {
    if (!esUuid(familiaId)) throw new Error("DATOS_INVALIDOS");
    const almacen = await almacenFamiliaActual(familiaId);
    const resultado = await cambiarPersonaReal(almacen, familiaId, cambio,
      () => crypto.randomUUID(), () => new Date().toISOString(), new Date().getFullYear());
    return { ok: true as const, ...resultado };
  } catch (error) {
    return { ok: false as const, error: error instanceof ConflictoRevision ? "conflicto" as const
      : error instanceof Error && error.message.startsWith("CUMPLEANOS") ? "cumple" as const : "fallo" as const };
  }
}

export async function leerPersonasAccion(familiaId: string) {
  try {
    if (!esUuid(familiaId)) throw new Error("DATOS_INVALIDOS");
    const almacen = await almacenFamiliaActual(familiaId);
    const [personas, ambitos] = await Promise.all([almacen.listar("personas_a_cargo"), almacen.listar("ambitos")]);
    return { ok: true as const, personas, ambitos };
  } catch {
    return { ok: false as const };
  }
}
