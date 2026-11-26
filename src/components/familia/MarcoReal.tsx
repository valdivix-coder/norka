"use client";
import { createContext,useContext,useState,useSyncExternalStore,useEffect,useRef,useCallback,type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Marco } from "@/components/recorrido/MarcoRecorrido";
import { Boton } from "@/components/interfaz/Elementos";
import { HojaInferior } from "@/components/interfaz/HojaInferior";
import { interfaz as m, captura as textos } from "@/mensajes/es-CL";
import { guardarCapturaAccion } from "@/app/familia/captura-acciones";
import { colaCapturasWeb } from "@/data/cola-capturas-web";
import { sincronizarCapturas } from "@/core/usecases/capturas";
import type { CapturaPendiente } from "@/core/domain/captura";
import s from "@/components/interfaz/interfaz.module.css";

const captura = createContext<(() => void) | null>(null);
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
  const [texto,escribir]=useState("");
  const [ocupada,ocupar]=useState(false);
  const [aviso,avisar]=useState("");
  const [pendientes,ponerPendientes]=useState(0);
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
        if(r.enviadas){avisar(textos.guardada);router.refresh();}
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
  async function enviar(){
    if(enviando.current||!texto.trim()) return;
    enviando.current=true;ocupar(true);avisar("");
    const entrada:CapturaPendiente={id:id.current??crypto.randomUUID(),texto,origen:"texto",familiaId,cuentaId};
    id.current=entrada.id;
    try{
      // Guardar en el teléfono antes de la red. Si no hay almacenamiento, solo
      // confirmar tras respuesta del servidor; si falla, conservar el texto.
      let local=false;
      try{await colaCapturasWeb.guardar(entrada);local=true;}catch{/* alternativa en línea */}
      if(!local){await guardar(entrada);avisar(textos.guardada);router.refresh();}
      else {ponerPendientes((await colaCapturasWeb.listar(cuentaId,familiaId)).length);avisar(textos.enCola);}
      escribir("");id.current=null;abrir(false);
      if(local) void sincronizar();
    }catch{avisar(m.errorGuardar);}
    finally{enviando.current=false;ocupar(false);}
  }
  return <captura.Provider value={()=>abrir(true)}>
    <Marco baseRuta={`/familia/${familiaId}`} nombrePerfil={nombre} colorPerfil={color}
      logotipo={logotipo} isotipo={isotipo} abrirCaptura={()=>abrir(true)}
      extra={abierta&&<HojaInferior titulo={m.capturar} cerrar={()=>{if(!enviando.current)abrir(false);}}>
        <form className={s.pila} onSubmit={e=>{e.preventDefault();void enviar();}}>
          <label className={s.campo}><span>{m.capturaAyuda}</span>
            <textarea className={s.entradaCampo} data-enfoque-inicial="" rows={4} value={texto} disabled={ocupada}
              onChange={e=>{escribir(e.target.value);id.current=null;}} placeholder={m.capturaCampo}/>
          </label>
          {aviso&&<p role="status">{aviso}</p>}
          <Boton principal type="submit" disabled={ocupada||!texto.trim()}>{ocupada?m.guardando:m.enviara}</Boton>
        </form>
      </HojaInferior>}>
      {!enLinea&&<section className={s.tarjeta} role="status"><p>{m.sinConexion}</p><p className={s.suave}>{textos.ayudaSinConexion}</p></section>}
      {pendientes>0&&<section className={s.tarjeta} role="status"><p>{textos.pendientes(pendientes)}</p>
        <Boton texto disabled={!enLinea} onClick={()=>void sincronizar()}>{m.reintentar}</Boton>
      </section>}
      {!abierta&&aviso&&<p role="status" className={s.aviso}>{aviso}</p>}
      {children}
    </Marco>
  </captura.Provider>;
}
