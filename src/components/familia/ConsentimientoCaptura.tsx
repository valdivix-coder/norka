"use client";
import { Boton } from "@/components/interfaz/Elementos";
import { HojaInferior } from "@/components/interfaz/HojaInferior";
import { captura as textos, interfaz as m } from "@/mensajes/es-CL";
import s from "@/components/interfaz/interfaz.module.css";
// No solicitar consentimiento hasta que exista una modalidad autorizada para datos familiares.
// El estado "disponible" solo podrá proceder de una política comprobada en el servidor.
export function ConsentimientoCaptura({disponible,ocupada=false,decidir,cerrar}:{
 disponible:boolean;ocupada?:boolean;decidir?:(acepta:boolean)=>void;cerrar:()=>void;
}){
 return <HojaInferior titulo={textos.iaTitulo} cerrar={cerrar}>
   <div className={s.pila}>
     {disponible&&decidir?<><p>{textos.iaEnvio}</p><p className={s.suave}>{textos.iaRechazo}</p>
       <Boton principal disabled={ocupada} onClick={()=>decidir(true)}>{textos.iaAceptar}</Boton>
       <Boton disabled={ocupada} onClick={()=>decidir(false)}>{textos.iaNo}</Boton></>:
       <><p>{textos.iaDesactivada}</p><p className={s.suave}>{textos.iaLocal}</p>
       <Boton principal onClick={cerrar}>{m.cerrar}</Boton></>}
   </div>
 </HojaInferior>;
}
