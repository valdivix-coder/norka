import type { ReactNode } from "react";
import { muestra as m } from "@/mensajes/es-CL";
import { Icono } from "./Icono";

export function EncabezadoPantalla({
  contexto,
  titulo,
  accesorio,
}: {
  contexto: string;
  titulo: string;
  accesorio?: ReactNode;
}) {
  return (
    <header className="encabezado">
      <small>{contexto}</small>
      <strong>{titulo}</strong>
      {accesorio}
    </header>
  );
}

export function MedallaLogro({
  nombre,
  familiar,
  nueva = false,
}: {
  nombre: string;
  familiar: boolean;
  nueva?: boolean;
}) {
  return (
    <div className="logro" data-familiar={familiar} data-nueva={nueva}>
      <span>
        <Icono tipo="logro" />
      </span>
      {nombre}
    </div>
  );
}

export function PastillaConstancia({ semanas }: { semanas: number }) {
  return semanas >= 2 ? (
    <span className="constancia">{m.semanas(semanas)}</span>
  ) : null;
}
