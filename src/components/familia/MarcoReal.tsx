"use client";
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Marco } from "@/components/recorrido/MarcoRecorrido";
import { Boton } from "@/components/interfaz/Elementos";
import { HojaInferior } from "@/components/interfaz/HojaInferior";
import { interfaz as m } from "@/mensajes/es-CL";
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

export function MarcoReal({ children, familiaId, nombre, color, logotipo, isotipo }: {
  children: ReactNode; familiaId: string; nombre: string; color: string; logotipo: ReactNode; isotipo: ReactNode;
}) {
  const [abierta, abrir] = useState(false);
  const enLinea = useSyncExternalStore(escucharConexion, conectado, conectadoServidor);
  const router = useRouter();
  return (
    <captura.Provider value={() => abrir(true)}>
      <Marco baseRuta={`/familia/${familiaId}`} nombrePerfil={nombre} colorPerfil={color}
        logotipo={logotipo} isotipo={isotipo} abrirCaptura={() => abrir(true)}
        extra={abierta && <HojaInferior titulo={m.capturar} cerrar={() => abrir(false)}>
          <div className={s.pila}>
            <p>{m.capturaRealLimite}</p>
            <Boton principal onClick={() => abrir(false)}>{m.entender}</Boton>
          </div>
        </HojaInferior>}>
        {!enLinea && <section className={s.tarjeta} role="status">
          <p>{m.sinConexion}</p><p className={s.suave}>{m.ayudaConexionReal}</p>
          <Boton onClick={() => router.refresh()}>{m.reintentar}</Boton>
        </section>}
        {children}
      </Marco>
    </captura.Provider>
  );
}
