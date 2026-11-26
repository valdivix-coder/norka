import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Icono } from "@/components/Icono";
import { interfaz as m } from "@/mensajes/es-CL";
import s from "./interfaz.module.css";

export function Boton({
  principal = false,
  texto = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  principal?: boolean;
  texto?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      className={`${s.boton} ${principal ? s.principal : ""} ${texto ? s.texto : ""} ${className}`}
    />
  );
}
export function Ilustracion({
  tipo = "hoy",
}: {
  tipo?: "hoy" | "familia" | "equilibrio" | "actividad" | "avisos" | "buscar";
}) {
  // Geometría original de estados vacíos, guía 8.2; nunca una pieza de marca.
  return (
    <svg
      className={s.ilustracion}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      {tipo === "hoy" && (
        <>
          <path
            d="M34 31h52v64H34z"
            stroke="var(--borde)"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            d="M48 49h24M48 65h16"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="86" cy="31" r="8" fill="var(--acento)" />
        </>
      )}
      {tipo === "familia" && (
        <>
          <path
            d="M18 91V74a14 14 0 0 1 28 0v17M48 91V60a14 14 0 0 1 28 0v31M78 91V74a14 14 0 0 1 28 0v17"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="62" cy="24" r="8" fill="var(--acento)" />
        </>
      )}
      {tipo === "equilibrio" && (
        <>
          <path
            d="M60 36v60M28 54h64M28 54l-14 26h28L28 54ZM92 54 78 80h28L92 54Z"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="60" cy="24" r="8" fill="var(--acento)" />
        </>
      )}
      {tipo === "actividad" && (
        <>
          <path
            d="M20 58h20l12-24 16 52 12-28h20"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="58" r="8" fill="var(--acento)" />
        </>
      )}
      {tipo === "avisos" && (
        <>
          <path
            d="M32 82h56l-8-16V47a20 20 0 0 0-40 0v19l-8 16ZM52 97h16"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="81" cy="28" r="8" fill="var(--acento)" />
        </>
      )}
      {tipo === "buscar" && (
        <>
          <circle
            cx="52"
            cy="52"
            r="28"
            stroke="currentColor"
            strokeWidth="8"
          />
          <path
            d="m73 73 25 25"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="52" cy="52" r="8" fill="var(--acento)" />
        </>
      )}
    </svg>
  );
}
export function Vacio({
  tipo,
  titulo,
  ayuda,
  children,
}: {
  tipo?: Parameters<typeof Ilustracion>[0]["tipo"];
  titulo: string;
  ayuda?: string;
  children?: ReactNode;
}) {
  return (
    <section className={s.vacio}>
      <Ilustracion tipo={tipo} />
      <p>{titulo}</p>
      {ayuda && <p className={s.suave}>{ayuda}</p>}
      {children}
    </section>
  );
}
export function AvatarPersona({
  nombre,
  color = "var(--persona-hogar)",
  tipo,
}: {
  nombre: string;
  color?: string;
  tipo?: string;
}) {
  return (
    <span
      className={s.avatar}
      style={{ "--color-persona": color } as CSSProperties}
      aria-hidden="true"
    >
      {tipo === "hogar" ? (
        <Icono tipo="puerta" />
      ) : tipo === "mascota" ? (
        <Icono tipo="mascota" />
      ) : (
        nombre.slice(0, 1).toLocaleUpperCase("es-CL")
      )}
    </span>
  );
}
export function Cargando() {
  return (
    <div role="status" aria-label={m.cargando} className={s.pila}>
      <span className={s.soloLector}>{m.cargando}</span>
      {[0, 1, 2].map((n) => (
        <div aria-hidden="true" className={s.esqueleto} key={n} />
      ))}
    </div>
  );
}
