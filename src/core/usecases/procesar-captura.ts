import type {ColaInterpretacion,InterpretadorCaptura,ResultadoInterpretacion} from "../ports/interpretacion";
import {planInterpretacion} from "./interpretacion";
// El adaptador de cola debe acotar la familia, verificar consentimiento y reservar en BD
// antes de devolver el contexto. No se activa por defecto ni se llama desde pantallas.
export async function procesarCaptura(cola:ColaInterpretacion,ia:InterpretadorCaptura,habilitada:boolean):Promise<ResultadoInterpretacion|null>{
  if(!habilitada)return null;
  for(let i=0;i<2;i++){
    const reserva=await cola.reservar();
    if(!reserva)return null;
    let plan=null;
    try{plan=planInterpretacion(await ia.interpretar(reserva.contexto),reserva.contexto);}catch{/* nunca registrar texto */}
    const resultado=await cola.aplicar(reserva,plan,plan===null);
    if(resultado.estado!=="reintentar")return resultado;
  }
  return null;
}
