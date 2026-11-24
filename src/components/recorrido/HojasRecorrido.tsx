"use client";
import { useState, type CSSProperties, type FormEvent } from "react";
import type { PersonaACargo } from "@/core/domain/familia";
import { familiaMuestraId } from "@/data/familia-muestra";
import { interfaz as m } from "@/mensajes/es-CL";
import { Icono } from "@/components/Icono";
import { Boton } from "@/components/interfaz/Elementos";
import { HojaInferior } from "@/components/interfaz/HojaInferior";
import { useRecorrido } from "./ContextoRecorrido";
import s from "@/components/interfaz/interfaz.module.css";

function FormularioPersona({ persona }: { persona?: PersonaACargo }) {
  const { guardar, personas } = useRecorrido();
  const [tipo, elegirTipo] = useState<PersonaACargo["tipo"]>(
    persona?.tipo ?? "hija_hijo",
  );
  const [color, elegirColor] = useState(
    persona?.color ?? `var(--persona-${((personas.length - 1) % 8) + 1})`,
  );
  const [error, avisar] = useState("");
  const [ocupado, ocupar] = useState(false);
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ocupado) return;
    const datos = new FormData(e.currentTarget);
    const numero = (clave: string) =>
      datos.get(clave) ? Number(datos.get(clave)) : null;
    const nombre = String(datos.get("nombre") ?? "").trim();
    const anio = numero("anio");
    if (!nombre) {
      avisar(m.nombreRequerido);
      return;
    }
    if (
      anio !== null &&
      (!Number.isInteger(anio) || anio < 1 || anio > new Date().getFullYear())
    ) {
      avisar(m.anioInvalido);
      return;
    }
    ocupar(true);
    avisar("");
    try {
      await guardar(
        {
          id: persona?.id ?? crypto.randomUUID(),
          familia_id: familiaMuestraId,
          tipo,
          nombre,
          cumple_dia: numero("dia"),
          cumple_mes: numero("mes"),
          anio_nacimiento: anio,
          va_al_colegio: tipo === "hija_hijo" && datos.get("colegio") === "on",
          color,
          icono:
            tipo === "mascota"
              ? "mascota"
              : tipo === "hogar"
                ? "puerta"
                : "persona",
          archivada_en: null,
          revision: persona?.revision ?? 0,
        },
        !persona,
      );
    } catch (causa) {
      avisar(
        causa instanceof Error && causa.message.startsWith("CUMPLEANOS")
          ? m.cumpleInvalido
          : m.errorGuardar,
      );
    } finally {
      ocupar(false);
    }
  }
  return (
    <form className={s.formulario} onSubmit={enviar}>
      <label className={s.campo}>
        <span>{m.nombre}</span>
        <input
          className={s.entradaCampo}
          name="nombre"
          autoFocus
          autoComplete="off"
          defaultValue={persona?.nombre}
          required
          maxLength={120}
        />
      </label>
      {tipo !== "hogar" && (
        <>
          <fieldset className={s.grupo}>
            <legend className={s.leyendaCampo}>{m.tipo}</legend>
            <div className={s.opciones}>
              {(["hija_hijo", "mascota", "adulto_dependiente"] as const).map(
                (t) => (
                  <Boton
                    key={t}
                    className={s.opcion}
                    aria-pressed={tipo === t}
                    onClick={() => elegirTipo(t)}
                  >
                    {m.tipos[t]}
                  </Boton>
                ),
              )}
            </div>
          </fieldset>
          <fieldset className={s.grupo}>
            <legend className={s.leyendaCampo}>
              {m.cumple} <span className={s.suave}>· {m.opcional}</span>
            </legend>
            <div className={s.fechas}>
              <label className={s.campo}>
                <span>{m.dia}</span>
                <input
                  name="dia"
                  className={s.entradaCampo}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={31}
                  defaultValue={persona?.cumple_dia ?? ""}
                />
              </label>
              <label className={s.campo}>
                <span>{m.mes}</span>
                <select
                  name="mes"
                  aria-label={m.mes}
                  className={s.entradaCampo}
                  defaultValue={persona?.cumple_mes ?? ""}
                >
                  <option value="">{m.opcional}</option>
                  {m.meses.map((mes, n) => (
                    <option key={mes} value={n + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
          <label className={s.campo}>
            <span>
              {m.anio} · {m.opcional}
            </span>
            <input
              name="anio"
              className={s.entradaCampo}
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              defaultValue={persona?.anio_nacimiento ?? ""}
            />
          </label>
          {tipo === "hija_hijo" && (
            <label className={s.interruptor}>
              <span>{m.colegio}</span>
              <input
                type="checkbox"
                name="colegio"
                defaultChecked={persona?.va_al_colegio}
              />
            </label>
          )}
        </>
      )}
      <fieldset className={s.grupo}>
        <legend className={s.leyendaCampo}>{m.color}</legend>
        <div className={s.opciones}>
          {m.colores.map((nombre, n) => {
            const valor = `var(--persona-${n + 1})`;
            return (
              <Boton
                key={nombre}
                className={s.color}
                aria-label={nombre}
                aria-pressed={color === valor}
                style={{ "--color-persona": valor } as CSSProperties}
                onClick={() => elegirColor(valor)}
              >
                <span>{color === valor && <Icono tipo="hecho" />}</span>
              </Boton>
            );
          })}
        </div>
      </fieldset>
      {error && (
        <p className={s.mensajeError} role="alert">
          {error}
        </p>
      )}
      <Boton type="submit" principal disabled={ocupado} className={s.ancho}>
        {ocupado ? m.guardando : m.guardar}
      </Boton>
    </form>
  );
}
function Archivo({ persona }: { persona: PersonaACargo }) {
  const { archivar, abrir } = useRecorrido();
  const [error, avisar] = useState("");
  const [ocupado, ocupar] = useState(false);
  return (
    <div className={s.pila}>
      <p>{m.archivoAyuda}</p>
      {error && <p role="alert">{error}</p>}
      <Boton
        principal
        disabled={ocupado}
        onClick={async () => {
          ocupar(true);
          try {
            await archivar(persona);
          } catch {
            avisar(m.errorGuardar);
          } finally {
            ocupar(false);
          }
        }}
      >
        {m.archivar}
      </Boton>
      <Boton texto onClick={() => abrir(null)}>
        {m.ahoraNo}
      </Boton>
    </div>
  );
}
export function HojasRecorrido() {
  const { hoja, abrir, familia, nombrar } = useRecorrido();
  if (!hoja) return null;
  const titulo =
    hoja.tipo === "persona"
      ? hoja.persona
        ? m.editarPersona
        : m.agregarPersona
      : hoja.tipo === "archivar"
        ? m.confirmarArchivo
        : hoja.tipo === "capturar"
          ? m.capturar
          : hoja.tipo === "familia"
            ? m.crearTitulo
            : m.invitar;
  return (
    <HojaInferior titulo={titulo} cerrar={() => abrir(null)}>
      {hoja.tipo === "persona" && <FormularioPersona persona={hoja.persona} />}
      {hoja.tipo === "archivar" && <Archivo persona={hoja.persona} />}
      {hoja.tipo === "capturar" && (
        <div className={s.pila}>
          <label className={s.campo}>
            <span>{m.capturaAyuda}</span>
            <textarea
              autoFocus
              className={`${s.entradaCampo} ${s.textarea}`}
              placeholder={m.capturaCampo}
              aria-describedby="limite-captura"
            />
          </label>
          <p className={s.suave} id="limite-captura">
            {m.capturaLimite}
          </p>
          <Boton disabled>{m.enviara}</Boton>
        </div>
      )}
      {hoja.tipo === "invitar" && (
        <div className={s.pila}>
          <p>{m.invitacionAyuda}</p>
          <Boton principal onClick={() => abrir(null)}>
            {m.entender}
          </Boton>
        </div>
      )}
      {hoja.tipo === "familia" && (
        <form
          className={s.formulario}
          onSubmit={(e) => {
            e.preventDefault();
            const nombre = String(
              new FormData(e.currentTarget).get("familia") ?? "",
            ).trim();
            if (nombre) {
              nombrar(nombre);
              abrir(null);
            }
          }}
        >
          <p className={s.suave}>{m.crearAyuda}</p>
          <label className={s.campo}>
            <span>{m.nombreFamilia}</span>
            <input
              name="familia"
              className={s.entradaCampo}
              defaultValue={familia}
              required
              maxLength={120}
            />
          </label>
          <Boton type="submit" principal>
            {m.guardarFamilia}
          </Boton>
        </form>
      )}
    </HojaInferior>
  );
}
