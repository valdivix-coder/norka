import type {ContextoInterpretacion,ElementoAplicable} from "../usecases/interpretacion";
export type ReservaInterpretacion={revision:number;intentos:number;contexto:ContextoInterpretacion};
export type ResultadoInterpretacion={estado:"aplicada"|"ya_aplicada"|"reintentar"|"sin_clasificar";objetos?:readonly {tarea_id:string|null;responsabilidad_id:string|null;propuesta_id:string|null}[]};
export interface ColaInterpretacion {
  reservar():Promise<ReservaInterpretacion|null>;
  aplicar(reserva:ReservaInterpretacion,plan:ElementoAplicable[]|null,fallida:boolean):Promise<ResultadoInterpretacion>;
}
export interface InterpretadorCaptura { interpretar(contexto:ContextoInterpretacion):Promise<unknown> }
