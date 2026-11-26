"use server";
import { guardarCaptura } from "@/core/usecases/capturas";
import { esUuid } from "@/core/usecases/personas-reales";
import { cuentaActual } from "@/lib/familia/cuenta";
import { configuracion } from "@/lib/entrada/servidor";
import { crearAlmacenCaptura, editarResultadoCaptura, ErrorEdicionCaptura } from "@/data/capturas-supabase";
export async function guardarCapturaAccion(familiaId:string,cuentaEsperada:string,entrada:unknown){
  try{
    if(!esUuid(familiaId)) throw new Error("DATOS_INVALIDOS");
    const cuentaId=await cuentaActual();
    if(!cuentaId||cuentaId!==cuentaEsperada) throw new Error("SESION_INVALIDA");
    const {url,claveServicio}=configuracion();
    const guardada=await guardarCaptura(entrada,crearAlmacenCaptura({url,claveServicio,familiaId,cuentaId}));
    return {ok:true as const,guardada};
  }catch{return {ok:false as const};}
}

export async function editarCapturaAccion(familiaId:string,cuentaEsperada:string,dato:{capturaId:string;tareaId:string;revision:number;titulo:string|null;descartar:boolean}){
  try{
    if(!esUuid(familiaId)||!esUuid(dato.capturaId)||!esUuid(dato.tareaId)||!Number.isSafeInteger(dato.revision)||dato.revision<0||
      typeof dato.descartar!=="boolean"||(!dato.descartar&&(typeof dato.titulo!=="string"||!dato.titulo.trim())))throw new Error("DATOS_INVALIDOS");
    const cuentaId=await cuentaActual();
    if(!cuentaId||cuentaId!==cuentaEsperada)return {ok:false as const,motivo:"sesion" as const};
    const resultado=await editarResultadoCaptura({...configuracion(),familiaId,cuentaId},dato);
    return {ok:true as const,resultado};
  }catch(error){
    const motivo=error instanceof ErrorEdicionCaptura?error.motivo:"conexion";
    // Solo categorías técnicas: no registrar títulos, identificadores ni cuerpo de respuesta.
    console.warn("captura_edicion",motivo);
    return {ok:false as const,motivo};
  }
}
