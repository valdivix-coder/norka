export type OrigenCaptura = "texto" | "voz";
export type EntradaCaptura = { id:string; texto:string; origen:OrigenCaptura };
export type CapturaGuardada = { captura_id:string; tarea_id:string };
export type CapturaPendiente = EntradaCaptura & { familiaId:string; cuentaId:string };
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validarCaptura(dato:unknown): EntradaCaptura {
  if(!dato || typeof dato!=="object") throw new Error("CAPTURA_INVALIDA");
  const d=dato as Partial<EntradaCaptura>;
  if(typeof d.id!=="string" || !uuid.test(d.id) || typeof d.texto!=="string" ||
     !d.texto.trim() || (d.origen!=="texto" && d.origen!=="voz")) throw new Error("CAPTURA_INVALIDA");
  return {id:d.id,texto:d.texto,origen:d.origen};
}

export type TareaCapturada={id:string;familia_id:string;titulo:string;revision:number;captura_id:string};
