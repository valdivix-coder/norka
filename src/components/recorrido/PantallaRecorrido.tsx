"use client";
import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "@/components/interfaz/Enlace";
import { interfaz as m } from "@/mensajes/es-CL";
import { Icono } from "@/components/Icono";
import {
  AvatarPersona,
  Boton,
  Cargando,
  Vacio,
} from "@/components/interfaz/Elementos";
import { useRecorrido } from "./ContextoRecorrido";
import { OpcionesMuestra } from "./MarcoRecorrido";
import { PerfilRecorrido } from "./PerfilRecorrido";
import s from "@/components/interfaz/interfaz.module.css";

import { pantallaLista, transicionActiva } from "@/lib/transicion";

export const pantallas = [
  "hoy",
  "familia",
  "equilibrio",
  "actividad",
  "buscar",
  "avisos",
  "perfil",
  "persona",
] as const;
export type Pantalla = (typeof pantallas)[number];
const contexto = {
  hoy: m.contextoHoy,
  familia: m.contextoFamilia,
  equilibrio: m.contextoEquilibrio,
  actividad: m.contextoActividad,
  buscar: m.contextoBuscar,
  avisos: m.contextoAvisos,
  perfil: m.contextoPerfil,
  persona: m.personas,
};
const tiposAmbito = [
  "salud",
  "colegio",
  "pagos",
  "crianza",
  "puerta",
  "mascota",
  "tramites",
  "compras",
] as const;
const coloresAmbito = [
  "salud",
  "colegio",
  "pagos",
  "crianza",
  "hogar",
  "mascotas",
  "tramites",
  "compras",
];
function Hoy() {
  const { abrir } = useRecorrido();
  return (
    <div className={s.pila}>
      <section className={s.fila} aria-label={m.semana}>
        <div className={s.anilloVacio} role="img" aria-label={m.sinPlazos}>
          <svg viewBox="0 0 124 124" aria-hidden="true">
            <circle
              cx="62"
              cy="62"
              r="50"
              fill="none"
              stroke="var(--borde)"
              strokeWidth="12"
            />
          </svg>
          <span>{m.sinPlazos}</span>
        </div>
        <dl className={s.leyenda}>
          {[m.alDia, m.proximas, m.vencidas].map((nombre, i) => (
            <div key={nombre}>
              <dt>
                <span
                  aria-hidden="true"
                  className={`${s.punto} ${i === 1 ? s.puntoProximas : i === 2 ? s.puntoVencidas : ""}`}
                />
                {nombre}
              </dt>
              <dd>0</dd>
            </div>
          ))}
        </dl>
      </section>
      <h2 className={s.seccionTitulo}>{m.teToca}</h2>
      <Vacio tipo="hoy" titulo={m.ayudaHoy}>
        <Boton principal onClick={() => abrir({ tipo: "capturar" })}>
          {m.capturarAlgo}
        </Boton>
      </Vacio>
    </div>
  );
}
function Familia() {
  const { personas, abrir, familia, perfil } = useRecorrido();
  const activas = personas.filter((p) => !p.archivada_en);
  return (
    <div className={s.pila}>
      <div className={s.repartida}>
        <p className={s.contexto}>{familia}</p>
        <Boton
          texto
          aria-label={m.nombreFamilia}
          onClick={() => abrir({ tipo: "familia" })}
        >
          <Icono tipo="editar" />
        </Boton>
      </div>
      <div className={s.repartida}>
        <h2 className={s.seccionTitulo}>{m.personas}</h2>
        <Boton principal onClick={() => abrir({ tipo: "persona" })}>
          <Icono tipo="capturar" />
          {m.agregarPersona}
        </Boton>
      </div>
      <div className={s.rejilla}>
        {activas.map((p) => (
          <Link
            key={p.id}
            href={`/muestra/pantallas/persona?id=${encodeURIComponent(p.id)}`}
            className={`${s.tarjeta} ${s.personaTarjeta}`}
          >
            <AvatarPersona nombre={p.nombre} color={p.color} tipo={p.tipo} />
            <strong>{p.nombre}</strong>
            <span className={s.suave}>{m.sinPlazos}</span>
          </Link>
        ))}
      </div>
      {activas.length === 1 && <p className={s.suave}>{m.ayudaPersonas}</p>}
      <h2 className={s.seccionTitulo}>{m.integrantes}</h2>
      <div className={s.lista}>
        <Link
          className={`${s.filaLista} ${s.enlaceFila}`}
          href="/muestra/pantallas/perfil"
        >
          <AvatarPersona nombre={perfil.nombre} color="var(--persona-1)" />
          <span>
            {perfil.nombre}
            <span className={s.suave}> · {m.perfilMuestra}</span>
          </span>
          <Icono tipo="siguiente" />
        </Link>
        <button
          className={`${s.filaLista} ${s.enlaceFila}`}
          onClick={() => abrir({ tipo: "invitar" })}
        >
          <Icono tipo="capturar" />
          <span>{m.invitar}</span>
          <Icono tipo="siguiente" />
        </button>
      </div>
      <h2 className={s.seccionTitulo}>{m.ambitos}</h2>
      <div className={s.lista}>
        {m.nombresAmbitos.map((nombre, i) => (
          <div className={s.filaLista} key={nombre}>
            <span
              className={s.ambitoIcono}
              style={{ color: `var(--ambito-${coloresAmbito[i]})` }}
            >
              <Icono tipo={tiposAmbito[i]} />
            </span>
            <span>{nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Buscar() {
  const [consulta, escribir] = useState("");
  const { personas } = useRecorrido();
  const normalizar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es-CL");
  const resultados =
    consulta.trim().length >= 2
      ? personas.filter(
          (p) =>
            !p.archivada_en &&
            normalizar(p.nombre).includes(normalizar(consulta.trim())),
        )
      : [];
  return (
    <div className={s.pila}>
      <label className={s.campo}>
        <span className={s.soloLector}>{m.campoBuscar}</span>
        <input
          autoFocus
          type="search"
          className={s.entradaCampo}
          placeholder={m.campoBuscar}
          value={consulta}
          onChange={(e) => escribir(e.target.value)}
          autoComplete="off"
        />
      </label>
      <p className={s.suave}>{m.busquedaMuestra}</p>
      <div aria-live="polite">
        {consulta.trim().length < 2 ? (
          <Vacio tipo="buscar" titulo={m.sinBusqueda} ayuda={m.ayudaBusqueda} />
        ) : resultados.length ? (
          <section className={s.pila}>
            <h2 className={s.seccionTitulo}>{m.personas}</h2>
            <div className={s.lista}>
              {resultados.map((p) => (
                <Link
                  className={`${s.enlaceFila} ${s.filaLista}`}
                  key={p.id}
                  href={`/muestra/pantallas/persona?id=${encodeURIComponent(p.id)}`}
                >
                  <AvatarPersona
                    nombre={p.nombre}
                    color={p.color}
                    tipo={p.tipo}
                  />
                  <span>{p.nombre}</span>
                  <Icono tipo="siguiente" />
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <Vacio
            tipo="buscar"
            titulo={m.sinResultados}
            ayuda={m.ajustarBusqueda}
          >
            <Boton onClick={() => escribir("")}>{m.limpiar}</Boton>
          </Vacio>
        )}
      </div>
    </div>
  );
}
function Persona({ id }: { id?: string }) {
  const { personas, abrir } = useRecorrido();
  const persona = personas.find((p) => p.id === id && !p.archivada_en);
  if (!persona)
    return (
      <Vacio tipo="familia" titulo={m.sinPersonas}>
        <Link
          className={`${s.boton} ${s.principal}`}
          href="/muestra/pantallas/familia"
        >
          {m.verFamilia}
        </Link>
      </Vacio>
    );
  return (
    <div className={s.pila}>
      <div className={s.repartida}>
        <div className={s.fila}>
          <AvatarPersona
            nombre={persona.nombre}
            color={persona.color}
            tipo={persona.tipo}
          />
          <span>{m.tipos[persona.tipo]}</span>
        </div>
        <Boton onClick={() => abrir({ tipo: "persona", persona })}>
          {m.editarPersona}
        </Boton>
      </div>
      {persona.cumple_dia && persona.cumple_mes && (
        <p className={s.suave}>
          {m.fechaCumple(
            persona.cumple_dia,
            m.meses[persona.cumple_mes - 1].toLocaleLowerCase("es-CL"),
          )}
        </p>
      )}
      <Vacio titulo={m.sinResponsabilidades} ayuda={m.noResponsabilidad}>
        <Link
          className={`${s.boton} ${s.principal}`}
          href="/muestra/pantallas/familia"
        >
          {m.verFamilia}
        </Link>
      </Vacio>
      {persona.tipo === "hogar" ? (
        <p className={s.suave}>{m.hogarAyuda}</p>
      ) : (
        <Boton texto onClick={() => abrir({ tipo: "archivar", persona })}>
          {m.archivar}
        </Boton>
      )}
    </div>
  );
}
export function PantallaRecorrido({
  pantalla,
  id,
}: {
  pantalla: Pantalla;
  id?: string;
}) {
  const { estado, cambiarEstado, personas } = useRecorrido();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (transicionActiva() && pantalla !== "buscar")
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
    pantallaLista();
  }, [pantalla, id]);
  const persona =
    pantalla === "persona" ? personas.find((p) => p.id === id) : undefined;
  let contenido: ReactNode;
  if (estado === "cargando") contenido = <Cargando />;
  else if (estado === "error")
    contenido = (
      <section className={s.vacio} role="alert">
        <Icono tipo="aviso" />
        <p>{m.errorCargar}</p>
        <Boton principal onClick={() => cambiarEstado("vacio")}>
          {m.reintentar}
        </Boton>
      </section>
    );
  else if (estado === "sinConexion")
    contenido = (
      <section className={s.vacio} role="status">
        <Icono tipo="conexion" />
        <p>{m.sinConexion}</p>
        <p className={s.suave}>{m.ayudaConexion}</p>
        <Boton principal onClick={() => cambiarEstado("vacio")}>
          {m.seguir}
        </Boton>
      </section>
    );
  else if (pantalla === "hoy") contenido = <Hoy />;
  else if (pantalla === "familia") contenido = <Familia />;
  else if (pantalla === "buscar") contenido = <Buscar />;
  else if (pantalla === "persona") contenido = <Persona id={id} />;
  else if (pantalla === "perfil") contenido = <PerfilRecorrido />;
  else
    contenido = (
      <Vacio
        tipo={pantalla}
        titulo={
          pantalla === "equilibrio"
            ? m.sinEquilibrio
            : pantalla === "actividad"
              ? m.sinActividad
              : m.sinAvisos
        }
        ayuda={
          pantalla === "equilibrio"
            ? m.ayudaEquilibrio
            : pantalla === "actividad"
              ? m.ayudaActividad
              : m.ayudaAvisos
        }
      >
        <Link
          className={`${s.boton} ${s.principal}`}
          href={
            pantalla === "equilibrio"
              ? "/muestra/pantallas/familia"
              : "/muestra/pantallas/hoy"
          }
        >
          {pantalla === "equilibrio" ? m.verFamilia : m.volverHoy}
        </Link>
      </Vacio>
    );
  return (
    <>
      <div
        className={s.resplandor}
        aria-hidden="true"
        style={
          {
            "--luz-color":
              persona?.color ??
              (pantalla === "equilibrio" ? "var(--acento)" : "var(--marca)"),
            "--luz-opacidad":
              pantalla === "hoy"
                ? "var(--luz-hoy)"
                : pantalla === "equilibrio"
                  ? "var(--luz-equilibrio)"
                  : persona
                    ? "var(--luz-persona)"
                    : "var(--luz-familia)",
          } as CSSProperties
        }
      />
      <p className={s.avisoMuestra}>{m.muestraPie}</p>
      <div className={s.encabezado}>
        <p className={s.contexto}>{contexto[pantalla]}</p>
        <h1 tabIndex={-1} className={s.titulo}>
          {persona?.nombre ?? m[pantalla]}
        </h1>
      </div>
      {contenido}
      <OpcionesMuestra />
    </>
  );
}
