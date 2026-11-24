"use client";
import Link from "next/link";
import { interfaz as m } from "@/mensajes/es-CL";
import { Boton } from "@/components/interfaz/Elementos";
import s from "@/components/interfaz/interfaz.module.css";
export default function ErrorPantalla({ reset }: { reset: () => void }) {
  return (
    <section className={s.vacio} role="alert">
      <h1 className={s.hojaTitulo}>{m.errorCargar}</h1>
      <Boton principal onClick={reset}>
        {m.reintentar}
      </Boton>
      <Link className={s.boton} href="/muestra/pantallas/hoy">
        {m.volverHoy}
      </Link>
    </section>
  );
}
