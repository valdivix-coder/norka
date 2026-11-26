"use client";
import { createContext,useContext,useState,useSyncExternalStore,useEffect,useRef,useCallback,type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { vozWeb,vibracionWeb } from "@/data/voz-web";
import type { SesionVoz } from "@/core/ports/voz";
import { Marco } from "@/components/recorrido/MarcoRecorrido";
import { ResultadoCaptura } from "./ResultadoCaptura";
import { Boton } from "@/components/interfaz/Elementos";
import { HojaInferior } from "@/components/interfaz/HojaInferior";
import { interfaz as m, captura as textos } from "@/mensajes/es-CL";
import { guardarCapturaAccion, editarCapturaAccion } from "@/app/familia/captura-acciones";
import { colaCapturasWeb } from "@/data/cola-capturas-web";
import { sincronizarCapturas } from "@/core/usecases/capturas";
import type { CapturaPendiente, TareaCapturada } from "@/core/domain/captura";
import s from "@/components/interfaz/interfaz.module.css";

const captura = createContext<(() => void) | null>(null);
const gestionCaptura=createContext<{abrir:(t:TareaCapturada,descartar:boolean)=>void;bloqueada:boolean}|null>(null);
export function useGestionCaptura(){return useContext(gestionCaptura);}
export function useCapturaReal() { return useContext(captura); }
function escucharConexion(cambio: () => void) {
  window.addEventListener("online", cambio);
  window.addEventListener("offline", cambio);
  return () => { window.removeEventListener("online", cambio); window.removeEventListener("offline", cambio); };
}
const conectado = () => navigator.onLine;
const conectadoServidor = () => true;
export function MarcoReal({ children, familiaId, cuentaId, nombre, color, logotipo, isotipo }: {
  children:ReactNode;familiaId:string;cuentaId:string;nombre:string;color:string;logotipo:ReactNode;isotipo:ReactNode;
}) {
  const [abierta,abrir]=useState(false);
  const [grabando,ponerGrabando]=useState(false);
  const [dictado,ponerDictado]=useState("");
  const sesionVoz=useRef<SesionVoz|null>(null);
  const soltarVoz=useRef(false);
  const origen=useRef<"texto"|"voz">("texto");
  useEffect(()=>()=>sesionVoz.current?.cancelar(),[]);
  const [texto,escribir]=useState("");
  const [ocupada,ocupar]=useState(false);
  const [aviso,avisar]=useState("");
  useEffect(()=>{
    if(!aviso||aviso===m.errorGuardar||aviso===textos.vozError)return;
    const reloj=setTimeout(()=>avisar(""),5000);
    return()=>clearTimeout(reloj);
  },[aviso]);
  const [pendientes,ponerPendientes]=useState(0);
  const [resultado,ponerResultado]=useState<TareaCapturada|null>(null);
  const [objetivo,ponerObjetivo]=useState<{tarea:TareaCapturada;descartar:boolean}|null>(null);
  const editando=objetivo!==null;
  const [borrador,ponerBorrador]=useState("");
  const [errorEdicion,ponerErrorEdicion]=useState(false);
  const cambiando=useRef(false);
  const enLinea=useSyncExternalStore(escucharConexion,conectado,conectadoServidor);
  const router=useRouter();
  const bloqueo=useRef(false);
  const enviando=useRef(false);
  const id=useRef<string|null>(null);
  const guardar=useCallback(async (entrada:unknown)=>{
    const r=await guardarCapturaAccion(familiaId,cuentaId,entrada);
    if(!r.ok) throw new Error("CAPTURA_NO_GUARDADA");
    return r.guardada;
  },[familiaId,cuentaId]);
  const sincronizar=useCallback(async ()=>{
    if(bloqueo.current) return;
    bloqueo.current=true;
    try{
      if(navigator.onLine){
        const r=await sincronizarCapturas(colaCapturasWeb,cuentaId,familiaId,{guardar});
        ponerPendientes(r.pendientes);
        if(r.enviadas){
          if(r.ultima) ponerResultado({id:r.ultima.guardada.tarea_id,captura_id:r.ultima.guardada.captura_id,familia_id:familiaId,titulo:r.ultima.entrada.texto,revision:0});
          avisar(textos.guardada);router.refresh();
        }
      }else ponerPendientes((await colaCapturasWeb.listar(cuentaId,familiaId)).length);
    }catch{/* La cola persistente se conserva; no se confirma un envío fallido. */}
    finally{bloqueo.current=false;}
  },[cuentaId,familiaId,guardar,router]);
  useEffect(()=>{
    const iniciar=()=>void sincronizar();
    const visible=()=>{if(document.visibilityState==="visible") iniciar();};
    const reloj=setInterval(iniciar,30000);
    window.addEventListener("online",iniciar);
    document.addEventListener("visibilitychange",visible);
    queueMicrotask(iniciar);
    return()=>{clearInterval(reloj);window.removeEventListener("online",iniciar);document.removeEventListener("visibilitychange",visible);};
  },[sincronizar]);
  async function enviar(valor=texto,fuente=origen.current){
    if(enviando.current||!valor.trim()) return;
    enviando.current=true;ocupar(true);avisar("");
    const entrada:CapturaPendiente={id:id.current??crypto.randomUUID(),texto:valor,origen:fuente,familiaId,cuentaId};
    id.current=entrada.id;
    try{
      // Guardar en el teléfono antes de la red. Si no hay almacenamiento, solo
      // confirmar tras respuesta del servidor; si falla, conservar el texto.
      let local=false;
      try{await colaCapturasWeb.guardar(entrada);local=true;}catch{/* alternativa en línea */}
      if(!local){const r=await guardar(entrada);ponerResultado({id:r.tarea_id,captura_id:r.captura_id,familia_id:familiaId,titulo:entrada.texto,revision:0});avisar(textos.guardada);router.refresh();}
      else {ponerPendientes((await colaCapturasWeb.listar(cuentaId,familiaId)).length);avisar(textos.enCola);}
      escribir("");id.current=null;origen.current="texto";abrir(false);
      if(fuente==="voz")vibracionWeb.corta();
      if(local) void sincronizar();
    }catch{escribir(valor);origen.current=fuente;abrir(true);avisar(m.errorGuardar);}
    finally{enviando.current=false;ocupar(false);}
  }
  function iniciarVoz(){
    if(abierta||editando||ocupada||texto.trim()||sesionVoz.current)return false;
    soltarVoz.current=false;ponerDictado("");avisar("");
    const conservar=(t:string)=>{sesionVoz.current=null;ponerGrabando(false);escribir(t);origen.current=t?"voz":"texto";abrir(true);avisar(textos.vozError);};
    try{
      sesionVoz.current=vozWeb.iniciar({texto:ponerDictado,fin:t=>{
        sesionVoz.current=null;ponerGrabando(false);
        if(soltarVoz.current&&t.trim())void enviar(t,"voz");else conservar(t);
      },error:conservar});
      ponerGrabando(true);vibracionWeb.corta();return true;
    }catch{conservar("");return true;}
  }
  function terminarVoz(){soltarVoz.current=true;sesionVoz.current?.terminar();}
  function cancelarVoz(){sesionVoz.current?.cancelar();sesionVoz.current=null;ponerGrabando(false);ponerDictado("");}
  function abrirGestion(tarea:TareaCapturada,descartar=false){
    if(ocupada||!enLinea||abierta||grabando||cambiando.current)return;
    ponerBorrador(tarea.titulo);ponerErrorEdicion(false);avisar("");ponerObjetivo({tarea,descartar});
  }
  async function cambiar(descartar:boolean,tarea:TareaCapturada|null=objetivo?.tarea??resultado){
    if(!tarea||cambiando.current||(!descartar&&!borrador.trim()))return;
    cambiando.current=true;ocupar(true);ponerErrorEdicion(false);
    try{
      const r=await editarCapturaAccion(familiaId,cuentaId,{capturaId:tarea.captura_id,tareaId:tarea.id,revision:tarea.revision,titulo:descartar?null:borrador,descartar});
      if(!r.ok)throw new Error("NO_EDITADA");
      ponerResultado(actual=>actual?.id===tarea.id?(descartar?null:r.resultado):actual);
      ponerObjetivo(null);avisar(descartar?textos.deshecha:m.guardadaReal);router.refresh();
    }catch{ponerErrorEdicion(true);}
    finally{cambiando.current=false;ocupar(false);}
  }
  return <captura.Provider value={()=>abrir(true)}>
    <gestionCaptura.Provider value={{abrir:abrirGestion,bloqueada:ocupada||!enLinea||editando||abierta||grabando}}>
    <Marco baseRuta={`/familia/${familiaId}`} nombrePerfil={nombre} colorPerfil={color}
      logotipo={logotipo} isotipo={isotipo} abrirCaptura={()=>abrir(true)}
      voz={{disponible:vozWeb.disponible,iniciar:iniciarVoz,terminar:terminarVoz,cancelar:cancelarVoz,grabando,texto:dictado}}
      extra={objetivo?<HojaInferior titulo={objetivo.descartar?textos.eliminar:textos.editar} cerrar={()=>{if(!cambiando.current){ponerObjetivo(null);ponerErrorEdicion(false);}}}>
        {objetivo.descartar?<div className={s.pila}>
          <p>{textos.confirmarEliminar}</p><p className={s.suave}>{objetivo.tarea.titulo}</p>
          {errorEdicion&&<p role="alert">{textos.errorEdicion}</p>}
          <Boton principal disabled={ocupada} onClick={()=>void cambiar(true)}>{textos.eliminar}</Boton>
          <Boton disabled={ocupada} onClick={()=>ponerObjetivo(null)}>{textos.cancelar}</Boton>
        </div>:<form className={s.pila} onSubmit={e=>{e.preventDefault();void cambiar(false);}}>
          <label className={s.campo}><span>{textos.titulo}</span><textarea data-enfoque-inicial="" className={s.entradaCampo} rows={3} value={borrador} onChange={e=>ponerBorrador(e.target.value)} disabled={ocupada}/></label>
          {errorEdicion&&<p role="alert">{textos.errorEdicion}</p>}
          <Boton principal type="submit" disabled={ocupada||!borrador.trim()}>{m.guardar}</Boton>
        </form>}
      </HojaInferior>:abierta&&<HojaInferior titulo={m.capturar} cerrar={()=>abrir(false)}>
        <form className={s.pila} onSubmit={e=>{e.preventDefault();void enviar();}}>
          <label className={s.campo}><span>{m.capturaAyuda}</span>
            <textarea className={s.entradaCampo} data-enfoque-inicial="" rows={4} value={texto} disabled={ocupada}
              onChange={e=>{escribir(e.target.value);id.current=null;}} placeholder={m.capturaCampo}/>
          </label>
          {aviso&&<p role="status">{aviso}</p>}
          <Boton principal type="submit" disabled={ocupada||!texto.trim()}>{ocupada?m.guardando:m.enviara}</Boton>
        </form>
      </HojaInferior>}>
      {grabando&&<section className={s.tarjetaVoz} role="status"><strong>{textos.vozEscuchando}</strong><p>{dictado||textos.vozCancelar}</p></section>}
      {!enLinea&&<section className={s.tarjeta} role="status"><p>{m.sinConexion}</p><p className={s.suave}>{textos.ayudaSinConexion}</p></section>}
      {pendientes>0&&<section className={s.tarjeta} role="status"><p>{textos.pendientes(pendientes)}</p>
        <Boton texto disabled={!enLinea} onClick={()=>void sincronizar()}>{m.reintentar}</Boton>
      </section>}
      {!abierta&&!editando&&aviso&&<p role="status" className={`${s.aviso} ${s.avisoCaptura}`}>{aviso}</p>}
      {resultado&&<ResultadoCaptura filas={[{id:resultado.id,titulo:resultado.titulo,tipo:"tarea",porRevisar:true}]}
        ocupada={ocupada||!enLinea} editar={id=>{if(id===resultado.id)abrirGestion(resultado);}}
        deshacer={()=>void cambiar(true)} cerrar={()=>{ponerResultado(null);ponerErrorEdicion(false);}}
        error={errorEdicion&&!editando&&<p role="alert">{textos.errorEdicion}</p>}/>}
      {children}
    </Marco>
    </gestionCaptura.Provider>
  </captura.Provider>;
}
