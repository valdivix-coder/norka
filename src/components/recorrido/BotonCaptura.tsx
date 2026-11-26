"use client";
import {useEffect,useRef} from "react";
import {Icono} from "@/components/Icono";
import {interfaz as m} from "@/mensajes/es-CL";
import s from "@/components/interfaz/interfaz.module.css";
export type ControlesVoz={disponible:()=>boolean;iniciar:()=>boolean;terminar:()=>void;cancelar:()=>void;grabando:boolean;texto:string};
export function BotonCaptura({abrir,voz}:{abrir:()=>void;voz?:ControlesVoz}){
 const gesto=useRef<{x:number;y:number;activo:boolean;reloj:ReturnType<typeof setTimeout>}|null>(null);
 const suprimir=useRef(false);
 useEffect(()=>()=>{if(gesto.current)clearTimeout(gesto.current.reloj);},[]);
 return <button className={s.capturar} data-grabando={voz?.grabando||undefined} aria-label={m.capturar}
 onPointerDown={e=>{
   suprimir.current=false;if(!voz?.disponible()||e.button!==0)return;
   e.currentTarget.setPointerCapture(e.pointerId);
   gesto.current={x:e.clientX,y:e.clientY,activo:false,reloj:setTimeout(()=>{
     if(gesto.current&&voz.iniciar()){gesto.current.activo=true;suprimir.current=true;}
   },400)};
 }}
 onPointerMove={e=>{const g=gesto.current;if(!g)return;
   if(Math.abs(e.clientX-g.x)>44&&Math.abs(e.clientX-g.x)>Math.abs(e.clientY-g.y)){
     clearTimeout(g.reloj);if(g.activo)voz?.cancelar();gesto.current=null;suprimir.current=true;
   }
 }}
 onPointerUp={()=>{const g=gesto.current;if(!g)return;clearTimeout(g.reloj);gesto.current=null;if(g.activo)voz?.terminar();}}
 onPointerCancel={()=>{const g=gesto.current;if(!g)return;clearTimeout(g.reloj);gesto.current=null;if(g.activo)voz?.cancelar();suprimir.current=true;}}
 onContextMenu={e=>{if(voz?.disponible())e.preventDefault();}}
 onClick={e=>{if(suprimir.current&&e.detail!==0){suprimir.current=false;return;}abrir();}}>
 {voz?.grabando?<span aria-hidden="true" className={s.ondaVoz}><i/><i/><i/><i/><i/></span>:<Icono tipo="capturar"/>}
 </button>;
}
