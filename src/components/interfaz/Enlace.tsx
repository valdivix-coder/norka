"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { cambiarPantalla } from "@/lib/transicion";
import { rutaRecorrido } from "@/lib/rutas-recorrido";
export default function Enlace(props: ComponentProps<typeof Link>) {
  const router = useRouter();
  return (
    <Link
      {...props}
      onNavigate={(evento) => {
        // Evitar que Next intente una navegación de servidor al perder red.
        if(!navigator.onLine&&rutaRecorrido(location.pathname)?.real){evento.preventDefault();return;}
        if (
          typeof props.href !== "string" ||
          !rutaRecorrido(props.href) ||
          rutaRecorrido(location.pathname)?.base !== rutaRecorrido(props.href)?.base ||
          location.pathname + location.search === props.href
        )
          return;
        evento.preventDefault();
        cambiarPantalla(
          () => router.push(String(props.href)),
          String(props.href),
        );
      }}
    />
  );
}
