import {z} from "zod";
export const recurrenciaInterpretada=z.strictObject({
  tipo:z.enum(["diaria","semanal","mensual","anual","cada_n"]),
  cada:z.number().int().positive(),
  dias:z.array(z.enum(["lunes","martes","miércoles","jueves","viernes","sábado","domingo"])),
});
export const elementoInterpretado=z.strictObject({
  tipo:z.enum(["tarea","responsabilidad","propuesta","nota"]),
  titulo:z.string().trim().min(1),
  persona_a_cargo:z.string().nullable(),
  ambito:z.string().nullable(),
  plazo_fecha:z.iso.date().nullable(),
  plazo_hora:z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
  recurrencia:recurrenciaInterpretada.nullable(),
  dirigida_a:z.string().nullable(),
  confianza:z.enum(["alta","baja"]),
});
export const contratoInterpretacion=z.strictObject({elementos:z.array(elementoInterpretado).min(1)});
export type ElementoInterpretado=z.infer<typeof elementoInterpretado>;
export type Interpretacion=z.infer<typeof contratoInterpretacion>;
