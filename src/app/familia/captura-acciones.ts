"use server";
import { guardarCaptura } from "@/core/usecases/capturas";
import { esUuid } from "@/core/usecases/personas-reales";
import { cuentaActual } from "@/lib/familia/cuenta";
import { configuracion } from "@/lib/entrada/servidor";
import { crearAlmacenCaptura } from "@/data/capturas-supabase";
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
