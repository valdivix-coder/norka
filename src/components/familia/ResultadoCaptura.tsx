"use client";
import type { ReactNode } from "react";
import { Boton } from "@/components/interfaz/Elementos";
import { captura as textos, interfaz as m } from "@/mensajes/es-CL";
import s from "@/components/interfaz/interfaz.module.css";

export type FilaResultadoCaptura={
  id:string;titulo:string;tipo:"tarea"|"responsabilidad"|"propuesta";
  porRevisar:boolean;detalle?:string;
};
export function ResultadoCaptura({filas,ocupada,editar,deshacer,cerrar,error}:{
  filas:readonly FilaResultadoCaptura[];ocupada:boolean;editar:(id:string)=>void;
  deshacer:()=>void;cerrar:()=>void;error?:ReactNode;
}){
  if(!filas.length)return null;
  return <section className={`${s.tarjeta} ${s.pila} ${s.resultadoCaptura}`} aria-label={textos.resultado}>
    {filas.length>1&&<h2 className={s.seccionTitulo}>{textos.resultados(filas.length)}</h2>}
    <div className={s.repartida}>
      <Boton disabled={ocupada} onClick={deshacer}>{m.deshacer}</Boton>
      <Boton texto onClick={cerrar}>{m.cerrar}</Boton>
    </div>
    <div className={s.resultadoFilas}>
      {filas.map(fila=><div className={s.resultadoFila} key={fila.id}>
        <div className={s.resultadoTexto}>
          {filas.length>1&&<span className={s.suave}>{textos.tipoResultado[fila.tipo]}</span>}
          {fila.porRevisar&&<span className={s.suave}>{textos.porRevisar}</span>}
          <p>{fila.titulo}</p>
          {fila.detalle&&<p className={s.suave}>{fila.detalle}</p>}
        </div>
        <Boton disabled={ocupada} onClick={()=>editar(fila.id)} aria-label={filas.length>1?textos.editarResultado(fila.titulo):textos.editar}>{textos.editar}</Boton>
      </div>)}
    </div>
    {error}
  </section>;
}
