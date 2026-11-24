"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { cambiarPantalla } from "@/lib/transicion";
export default function Enlace(props: ComponentProps<typeof Link>) {
  const router = useRouter();
  return (
    <Link
      {...props}
      onNavigate={(evento) => {
        if (
          typeof props.href !== "string" ||
          !props.href.startsWith("/muestra/pantallas/") ||
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
