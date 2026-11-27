import { z } from "zod";
// Contrato INTERNO del candidato 7.1 (solo entre adaptador y validador; nunca se persiste).
// El contrato público §6.2 no cambia. Diferencias con 7.0: sin «evidencia» (costo de salida),
// con dos decisiones explícitas y baratas antes de los campos que fallaban: persona_base y alcance.
const recurrencia = z.strictObject({ tipo: z.enum(["diaria", "semanal", "mensual", "anual", "cada_n"]), cada: z.number().int().positive(), dias: z.array(z.enum(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"])) });
export const descarteV71 = z.strictObject({ evidencia: z.string().trim().min(1), motivo: z.enum(["negacion", "correccion", "instruccion"]) });
export const elementoInternoV71 = z.strictObject({
  tipo: z.enum(["tarea", "responsabilidad", "propuesta", "nota"]),
  titulo: z.string().trim().min(1),
  persona_base: z.enum(["nombrada", "referida", "ninguna"]),   // decide antes de persona_a_cargo
  persona_a_cargo: z.string().nullable(),
  ambito: z.string().nullable(),
  tiempo: z.array(z.string().trim().min(1)),                     // fragmentos literales de fecha u hora
  alcance: z.enum(["propio", "hereda", "comun", "ninguno"]),     // decide antes de plazo_fecha
  plazo_fecha: z.iso.date().nullable(),
  plazo_hora: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
  recurrencia: recurrencia.nullable(),
  dirigida_a: z.string().nullable(),
  confianza: z.enum(["alta", "baja"]),
  motivo_nota: z.enum(["sin_accion", "destinatario_no_valido", "no_representable"]).nullable(),
});
export const contratoInternoV71 = z.strictObject({ descartes: z.array(descarteV71), elementos: z.array(elementoInternoV71).min(1) });
export const contratoLoteInternoV71 = z.strictObject({ resultados: z.array(z.strictObject({ id: z.number().int(), descartes: z.array(descarteV71), elementos: z.array(elementoInternoV71).min(1) })).min(1).max(5) });
export type SalidaInternaV71 = z.infer<typeof contratoInternoV71>;
export type ElementoInternoV71 = z.infer<typeof elementoInternoV71>;
