import type { CSSProperties, ReactNode } from "react";
import { muestra as m, avance } from "@/mensajes/es-CL";
import { Icono } from "./Icono";

export function Avatar({
  nombre,
  color = 1,
}: {
  nombre: string;
  color?: number;
}) {
  return (
    <span
      className="avatar"
      aria-label={nombre}
      style={{ background: `var(--persona-${color})` }}
    >
      {nombre.slice(0, 1)}
    </span>
  );
}
export function FilaTarea({
  titulo,
  detalle,
  accion,
}: {
  titulo: string;
  detalle: string;
  accion: ReactNode;
}) {
  return (
    <div className="fila">
      <span className="pastilla-icono">
        <Icono tipo="pagos" />
      </span>
      <span>
        {titulo}
        <small>{detalle}</small>
      </span>
      {accion}
    </div>
  );
}
export function TarjetaAmbito({
  tipo,
  titulo,
  cuenta,
  total,
  detalle,
}: {
  tipo: "colegio" | "salud";
  titulo: string;
  cuenta: number;
  total: number;
  detalle: string;
}) {
  return (
    <article
      className="tarjeta ambito"
      style={{ color: `var(--ambito-${tipo})` }}
    >
      <Icono tipo={tipo} />
      <b>{titulo}</b>
      <strong>
        {cuenta} <small>{avance.de(total)}</small>
      </strong>
      <small>{detalle}</small>
    </article>
  );
}
export function BarraAvance({
  nombre,
  actual,
  total,
  leyenda,
}: {
  nombre: string;
  actual: number;
  total: number;
  leyenda: string;
}) {
  return (
    <div>
      <div className="linea">
        <b>{nombre}</b>
        <small>{leyenda}</small>
      </div>
      <progress
        aria-label={nombre}
        value={Math.min(actual, total)}
        max={total}
      />
    </div>
  );
}
export function PastillaCasa({
  casas,
  casa,
}: {
  casas: readonly string[];
  casa: string;
}) {
  return casas.length < 2 ? null : (
    <span
      className="casa"
      style={
        {
          color: "var(--color-casa)",
          "--color-casa": `var(--casa-${casas.indexOf(casa) + 1})`,
        } as CSSProperties
      }
    >
      <Icono tipo="puerta" />
      {m.enCasa(casa)}
    </span>
  );
}
export function BotonesContacto({
  telefono,
  pedir,
}: {
  telefono?: string;
  pedir: ReactNode;
}) {
  return telefono ? (
    <div className="opciones">
      <a className="boton principal" href={`tel:${telefono}`}>
        <Icono tipo="llamar" />
        {m.llamar}
      </a>
      <a
        className="boton"
        href={`https://wa.me/${telefono.replace(/\D/g, "")}`}
      >
        <Icono tipo="comentar" />
        {m.whatsapp}
      </a>
    </div>
  ) : (
    pedir
  );
}
type Proveedor = {
  nombre: "Apple" | "Google" | "Facebook";
  iconoOficial: ReactNode;
  ruta?: string;
};
export function BotonesEntrada({
  configurados,
}: {
  configurados: readonly Proveedor[];
}) {
  return (
    <div className="entrada">
      {(["Apple", "Google", "Facebook"] as const).map((nombre) => {
        const proveedor = configurados.find((p) => p.nombre === nombre);
        if (!proveedor) return null;
        if (!proveedor.ruta)
          return (
            <button key={nombre} disabled>
              {proveedor.iconoOficial}
              {m.entrar(nombre)}
            </button>
          );
        return (
          <a className="boton" key={nombre} href={proveedor.ruta}>
            {proveedor.iconoOficial}
            {m.entrar(nombre)}
          </a>
        );
      })}
    </div>
  );
}
