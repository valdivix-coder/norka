"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { muestra as m, ejemplos } from "@/mensajes/es-CL";

export function Tema() {
  return (
    <button
      onClick={() => {
        const raiz = document.documentElement;
        raiz.dataset.tema = raiz.dataset.tema === "claro" ? "oscuro" : "claro";
      }}
    >
      {m.tema}
    </button>
  );
}

export function Opciones({ opciones }: { opciones: readonly string[] }) {
  const [elegida, elegir] = useState("");
  return (
    <div className="opciones">
      {opciones.map((opcion) => (
        <button
          key={opcion}
          aria-pressed={elegida === opcion}
          onClick={() => elegir(opcion)}
        >
          {opcion}
        </button>
      ))}
    </div>
  );
}

export function Hoja({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const inicio = useRef<number | null>(null);
  return (
    <>
      <button onClick={() => ref.current?.showModal()}>{titulo}</button>
      <dialog
        ref={ref}
        aria-label={titulo}
        onClick={(e) => {
          if (
            e.target === e.currentTarget &&
            e.clientY < e.currentTarget.getBoundingClientRect().top
          )
            ref.current?.close();
        }}
      >
        <div
          className="agarre"
          onPointerDown={(e) => {
            inicio.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (inicio.current !== null && ref.current)
              ref.current.style.translate = `0 ${Math.max(0, e.clientY - inicio.current)}px`;
          }}
          onPointerCancel={() => {
            inicio.current = null;
            ref.current?.style.removeProperty("translate");
          }}
          onPointerUp={(e) => {
            if (inicio.current !== null && e.clientY - inicio.current > 44)
              ref.current?.close();
            inicio.current = null;
            ref.current?.style.removeProperty("translate");
          }}
        />
        <h3>{titulo}</h3>
        {children}
        <form method="dialog">
          <button>{m.cerrar}</button>
        </form>
      </dialog>
    </>
  );
}

export function FilaDeslizable() {
  const [resultado, cambiar] = useState("");
  const [distancia, mover] = useState(0);
  const inicio = useRef<number | null>(null);
  const reloj = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [aviso, avisar] = useState(false);
  useEffect(() => () => clearTimeout(reloj.current), []);
  function confirmar(texto: string) {
    cambiar(texto);
    avisar(Boolean(texto));
    mover(0);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => avisar(false), 5000);
  }
  return resultado ? (
    <div role="status" className={aviso ? "aviso" : ""}>
      {resultado}
      <button onClick={() => confirmar("")}>
        {aviso ? m.deshacer : ejemplos.volver}
      </button>
    </div>
  ) : (
    <div className="deslizable">
      <div className="bajo" data-posponer={distancia < 0}>
        {distancia < 0 ? m.posponer : m.hecho}
      </div>
      <div
        className="fila frente"
        style={{ transform: `translateX(${distancia}px)` }}
        onPointerDown={(e) => {
          inicio.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (inicio.current !== null) mover(e.clientX - inicio.current);
        }}
        onPointerCancel={() => {
          inicio.current = null;
          mover(0);
        }}
        onPointerUp={(e) => {
          if (inicio.current !== null) {
            const delta = e.clientX - inicio.current;
            if (Math.abs(delta) >= e.currentTarget.clientWidth / 2)
              confirmar(delta > 0 ? m.hecha : m.pospuesta);
          }
          inicio.current = null;
          mover(0);
        }}
      >
        <span>
          {m.tarea}
          <small>{m.detalle}</small>
        </span>
      </div>
      <div className="opciones">
        <button onClick={() => confirmar(m.hecha)}>{m.hecho}</button>
        <button onClick={() => confirmar(m.pospuesta)}>{m.posponer}</button>
      </div>
    </div>
  );
}

export function CampoTelefono() {
  const [local, modo] = useState(true);
  const [valor, escribir] = useState("");
  const [revisado, revisar] = useState(false);
  const error = revisado && valor.length > 0 && local && valor.length < 8;
  return (
    <div>
      <label className="telefono">
        {local && <span>{m.prefijo}</span>}
        <input
          type="tel"
          aria-label={m.telefono}
          inputMode={local ? "numeric" : "tel"}
          aria-invalid={error}
          value={local ? valor.replace(/^(\d{4})(\d+)/, "$1 $2") : valor}
          onBlur={() => revisar(true)}
          onChange={(e) =>
            escribir(
              local
                ? e.target.value.replace(/\D/g, "").slice(0, 8)
                : e.target.value,
            )
          }
        />
      </label>
      {error && <small role="alert">{m.faltan}</small>}
      <button
        onClick={() => {
          modo(!local);
          escribir("");
          revisar(false);
        }}
      >
        {local ? m.otroPais : m.chile}
      </button>
    </div>
  );
}
