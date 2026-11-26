import {z} from "zod";
export const cambioResultado=z.strictObject({
 id:z.uuid(),tipo:z.enum(["tarea","responsabilidad"]),
 revision:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER-1),
 revision_propuesta:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER-1).nullable(),
 titulo:z.string().min(1).nullable(),
});
export const cambiosResultados=z.strictObject({
 capturaId:z.uuid(),deshacer:z.boolean(),cambios:z.array(cambioResultado).min(1).max(50),
}).superRefine((v,ctx)=>{
 const ids=new Set<string>();
 for(const c of v.cambios){
  if(ids.has(c.id)||(!v.deshacer&&!c.titulo?.trim()))ctx.addIssue({code:"custom",message:"CAMBIOS_INVALIDOS"});
  ids.add(c.id);
 }
});
export type CambiosResultados=z.infer<typeof cambiosResultados>;
export const respuestaResultados=z.array(z.strictObject({id:z.uuid(),tipo:z.enum(["tarea","responsabilidad"]),revision:z.number().int().nonnegative()})).min(1).max(50);
