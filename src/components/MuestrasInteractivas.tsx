"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ejemplos, mensajes, muestra as m } from "@/mensajes/es-CL";
import { Avatar, PastillaCasa } from "./Piezas";
import { Icono } from "./Icono";
import { Hoja } from "./Controles";
import { Comentarios, Reacciones } from "./Conversacion";

export function Accion({
  titulo,
  resultado,
  clase = "",
}: {
  titulo: string;
  resultado: string;
  clase?: string;
}) {
  const [hecha, cambiar] = useState(false);
  const [aviso, avisar] = useState(false);
  useEffect(() => {
    if (!aviso) return;
    const fin = setTimeout(() => avisar(false), 5000);
    return () => clearTimeout(fin);
  }, [aviso]);
  if (!hecha)
    return (
      <button
        className={clase}
        onClick={() => {
          cambiar(true);
          avisar(true);
        }}
      >
        {titulo}
      </button>
    );
  return (
    <span className={aviso ? "aviso" : ""} role="status">
      {resultado}{" "}
      <button
        onClick={() => {
          cambiar(false);
          avisar(false);
        }}
      >
        {aviso ? m.deshacer : ejemplos.volver}
      </button>
    </span>
  );
}
export function TarjetaSeViene() {
  const [estado, cambiar] = useState("");
  return (
    <article className="tarjeta sugerencia">
      {estado ? (
        <div role="status">
          {estado} <button onClick={() => cambiar("")}>{m.deshacer}</button>
        </div>
      ) : (
        <>
          <b className="etiqueta">{m.seViene}</b>
          <p>{m.sugerencia}</p>
          <div className="opciones">
            <button className="invertido" onClick={() => cambiar(m.planListo)}>
              {m.aceptar}
            </button>
            <button onClick={() => cambiar(m.descartada)}>{m.descartar}</button>
          </div>
        </>
      )}
    </article>
  );
}
export function TarjetaToma() {
  return (
    <article className="tarjeta toma">
      <b className="etiqueta">{m.toma}</b>
      <div className="linea">
        <div>
          <b>{m.remedio}</b>
          <small>{m.ultima}</small>
        </div>
        <Accion titulo={m.hecho} resultado={m.hecho} clase="hecho" />
      </div>
    </article>
  );
}
export function LineaTomas() {
  return (
    <div className="tarjeta">
      <div className="fila">
        <Icono tipo="hecho" />
        <b>{m.horas[0]}</b>
        <small>{m.anterior}</small>
      </div>
      <div className="fila">
        <span className="pendiente" />
        <b>{m.horas[1]}</b>
        <small>{m.siguiente}</small>
        <Accion titulo={m.hecho} resultado={m.hecho} clase="hecho" />
      </div>
    </div>
  );
}
export function Navegacion() {
  const [activo, activar] = useState(0);
  const hoja = useRef<HTMLDialogElement>(null);
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const larga = useRef(false);
  const [voz, cambiarVoz] = useState(false);
  useEffect(() => () => clearTimeout(espera.current), []);
  function terminar() {
    clearTimeout(espera.current);
    cambiarVoz(false);
  }
  return (
    <>
      <nav className="nav" aria-label={m.secciones[12]}>
        {(
          ["hoy", "familia", "capturar", "equilibrio", "actividad"] as const
        ).map((tipo, i) => (
          <button
            key={tipo}
            aria-label={voz && i === 2 ? ejemplos.pruebaVoz : m.nav[i]}
            aria-pressed={i === activo}
            data-voz={i === 2 && voz}
            onPointerDown={(e) => {
              if (i !== 2) return;
              larga.current = false;
              e.currentTarget.setPointerCapture(e.pointerId);
              espera.current = setTimeout(() => {
                larga.current = true;
                cambiarVoz(true);
              }, 500);
            }}
            onPointerUp={terminar}
            onPointerCancel={terminar}
            onClick={() => {
              if (i === 2 && !larga.current) hoja.current?.showModal();
              if (i !== 2) activar(i);
              larga.current = false;
            }}
          >
            {i === 2 && voz ? (
              <span className="onda" aria-hidden="true" />
            ) : (
              <Icono tipo={tipo} />
            )}
            {i !== 2 && m.nav[i]}
          </button>
        ))}
      </nav>
      <dialog ref={hoja} aria-label={m.nav[2]}>
        <h3>{m.nav[2]}</h3>
        <label>
          {ejemplos.capturaTexto}
          <textarea />
        </label>
        <form method="dialog">
          <button>{m.cerrar}</button>
        </form>
      </dialog>
    </>
  );
}
export function Cabecera({
  logotipo,
  isotipo,
}: {
  logotipo: ReactNode;
  isotipo: ReactNode;
}) {
  const [pos, cambiar] = useState(0);
  const [recogida, recoger] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  return (
    <div
      className="recorrido"
      ref={contenedor}
      onScroll={(e) => {
        const y = e.currentTarget.scrollTop;
        cambiar(Math.min(Math.max(0, y), 48));
        if (y > 24) recoger(true);
        if (y <= 0) recoger(false);
      }}
    >
      <header className="cabecera" style={{ height: 56 - pos / 4 }}>
        <button
          className="sello"
          aria-label={mensajes.marca}
          onClick={() => contenedor.current?.scrollTo({ top: 0 })}
        >
          {recogida ? (
            <>
              <span>{isotipo}</span>
              {m.nav[0]}
            </>
          ) : (
            logotipo
          )}
        </button>
        <a aria-label={m.buscar} href="#m2">
          <Icono tipo="buscar" />
        </a>
        <a aria-label={m.avisos} href="#m17">
          <Icono tipo="avisos" />
          <i>{ejemplos.numeroAvisos}</i>
        </a>
        <a aria-label={m.perfil} href="#m9">
          <Avatar nombre={ejemplos.perfil} />
        </a>
      </header>
      <div className="recorrido-filas">
        {ejemplos.tareas.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
    </div>
  );
}
export function TarjetaActividad() {
  const [gracias, agradecer] = useState(false);
  return (
    <article className="tarjeta" onDoubleClick={() => agradecer(true)}>
      <div className="fila">
        <Avatar nombre={m.ana} />
        <div>
          <b>{m.actividad}</b>
          <small>{m.hace}</small>
        </div>
      </div>
      <div className="opciones">
        <button
          aria-label={mensajes.reacciones[1].nombre}
          aria-pressed={gracias}
          onClick={() => agradecer(!gracias)}
        >
          {mensajes.reacciones[1].emoji} {gracias ? 3 : 2}
        </button>
        <Hoja titulo={mensajes.reaccionar}>
          <Reacciones />
        </Hoja>
        <Hoja titulo={mensajes.comentar}>
          <Comentarios />
        </Hoja>
      </div>
    </article>
  );
}
const casas = [m.casaAna, m.casaPablo] as const;
export function TiraEstadia() {
  const [dias, cambiar] = useState(
    Array.from({ length: 14 }, (_, i) => Math.floor(i / 4) % 2),
  );
  const [fecha, elegir] = useState(0);
  const hoja = useRef<HTMLDialogElement>(null);
  function abrir(i: number) {
    elegir(i);
    if (!hoja.current?.open) hoja.current?.showModal();
  }
  return (
    <>
      <div className="tira">
        {dias.map((casa, i) => (
          <button
            key={i}
            aria-label={ejemplos.dia(i + 1, casas[casa])}
            onContextMenu={(e) => {
              e.preventDefault();
              abrir(i);
            }}
            onClick={() => abrir(i)}
          >
            <span
              data-hoy={i === 0}
              style={{ background: `var(--casa-${casa + 1})` }}
            >
              {m.dias[i % 7]}
            </span>
          </button>
        ))}
      </div>
      <div className="opciones">
        {casas.map((casa) => (
          <PastillaCasa key={casa} casa={casa} casas={casas} />
        ))}
      </div>
      <dialog ref={hoja} aria-label={m.cambiarDia}>
        <h3>{m.cambiarDia}</h3>
        <div className="opciones">
          {casas.map((nombre, casa) => (
            <button
              key={nombre}
              aria-pressed={dias[fecha] === casa}
              onClick={() => {
                cambiar(dias.map((valor, i) => (i === fecha ? casa : valor)));
                hoja.current?.close();
              }}
            >
              {nombre}
            </button>
          ))}
        </div>
        <form method="dialog">
          <button>{m.cerrar}</button>
        </form>
      </dialog>
    </>
  );
}
export function CambioCasa() {
  return (
    <Hoja titulo={m.cambio}>
      <small>{m.cuando}</small>
      <p>
        {m.casaAna} → {m.casaPablo}
      </p>
      <b>{m.viaja}</b>
      {m.cosas.map((cosa) => (
        <label className="check" key={cosa}>
          <input type="checkbox" />
          {cosa}
        </label>
      ))}
      <label>
        {m.nota}
        <textarea maxLength={200} aria-describedby="ayuda-nota" />
      </label>
      <small id="ayuda-nota">{m.ayudaNota}</small>
      <form method="dialog">
        <button className="hecho">{m.listo}</button>
      </form>
    </Hoja>
  );
}
