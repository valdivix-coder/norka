"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { interfaz as m } from "@/mensajes/es-CL";
import { Icono } from "@/components/Icono";
import {
  movimientoReducido,
  valorToken,
  volverConResorte,
} from "@/lib/movimiento";
import { Boton } from "./Elementos";
import s from "./interfaz.module.css";

export function HojaInferior({
  titulo,
  cerrar,
  children,
}: {
  titulo: string;
  cerrar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const origen = useRef<number | null>(null);
  const cancelarResorte = useRef<(() => void) | undefined>(undefined);
  const cerrando = useRef(false);
  useEffect(() => {
    const hoja = ref.current!;
    const previo = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    hoja.showModal();
    hoja.querySelector<HTMLElement>("[data-enfoque-inicial]")?.focus({preventScroll:true});
    if (!movimientoReducido())
      cancelarResorte.current = volverConResorte(hoja, hoja.clientHeight);
    return () => {
      cancelarResorte.current?.();
      hoja.close();
      document.body.style.overflow = overflow;
      previo?.focus();
    };
  }, []);
  function salir() {
    if (cerrando.current) return;
    cerrando.current = true;
    cancelarResorte.current?.();
    const hoja = ref.current!;
    const animacion = hoja.animate(
      movimientoReducido()
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { transform: getComputedStyle(hoja).transform, opacity: 1 },
            { transform: "translateY(100%)", opacity: 0 },
          ],
      {
        duration: valorToken(
          movimientoReducido() ? "--mov-micro" : "--mov-estandar",
        ),
        easing: getComputedStyle(document.documentElement).getPropertyValue(
          "--curva-entrada",
        ),
        fill: "forwards",
      },
    );
    animacion.onfinish = cerrar;
  }
  return (
    <dialog
      ref={ref}
      className={s.hoja}
      aria-labelledby="titulo-hoja"
      onCancel={(e) => {
        e.preventDefault();
        salir();
      }}
      onClick={(e) => {
        if (
          e.target === e.currentTarget &&
          e.clientY < e.currentTarget.getBoundingClientRect().top
        )
          salir();
      }}
    >
      <div
        className={s.agarre}
        aria-hidden="true"
        onPointerDown={(e) => {
          cancelarResorte.current?.();
          origen.current = e.clientY;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (origen.current !== null && ref.current)
            ref.current.style.transform = `translateY(${Math.max(0, e.clientY - origen.current)}px)`;
        }}
        onPointerUp={(e) => {
          if (origen.current !== null) {
            const distancia = Math.max(0, e.clientY - origen.current);
            if (distancia > ref.current!.clientHeight / 2) salir();
            else
              cancelarResorte.current = volverConResorte(
                ref.current!,
                distancia,
              );
          }
          origen.current = null;
        }}
        onPointerCancel={() => {
          origen.current = null;
          if (ref.current) ref.current.style.transform = "";
        }}
      />
      <div className={s.cabeceraHoja}>
        <h2 className={s.hojaTitulo} id="titulo-hoja">
          {titulo}
        </h2>
        <Boton aria-label={m.cerrar} className={s.iconoBoton} onClick={salir}>
          <Icono tipo="cerrar" />
        </Boton>
      </div>
      {children}
    </dialog>
  );
}
