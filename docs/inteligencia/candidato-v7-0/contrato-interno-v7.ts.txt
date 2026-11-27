import { z } from "zod";
// Contrato INTERNO V7 (solo entre el adaptador y el validador). El contrato público §6.2 no cambia.
const recurrencia = z.strictObject({ tipo: z.enum(["diaria", "semanal", "mensual", "anual", "cada_n"]), cada: z.number().int().positive(), dias: z.array(z.enum(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"])) });
export const descarteV7 = z.strictObject({ evidencia: z.string().trim().min(1), motivo: z.enum(["negacion", "correccion", "instruccion"]) });
export const elementoInternoV7 = z.strictObject({
  evidencia: z.string().trim().min(1),            // primero: ancla literal de la acción
  tiempo: z.array(z.string().trim().min(1)),      // segundo: fragmentos temporales literales de ESA acción
  tipo: z.enum(["tarea", "responsabilidad", "propuesta", "nota"]),
  titulo: z.string().trim().min(1),
  persona_a_cargo: z.string().nullable(), ambito: z.string().nullable(),
  plazo_fecha: z.iso.date().nullable(), plazo_hora: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
  recurrencia: recurrencia.nullable(), dirigida_a: z.string().nullable(), confianza: z.enum(["alta", "baja"]),
  motivo_nota: z.enum(["sin_accion", "destinatario_no_valido", "no_representable"]).nullable(),
});
export const contratoInternoV7 = z.strictObject({ descartes: z.array(descarteV7), elementos: z.array(elementoInternoV7).min(1) });
export const contratoLoteInternoV7 = z.strictObject({ resultados: z.array(z.strictObject({ id: z.number().int(), descartes: z.array(descarteV7), elementos: z.array(elementoInternoV7).min(1) })).min(1).max(5) });
