"use client";
import { useState } from "react";
import { interfaz as m } from "@/mensajes/es-CL";
import { AvatarPersona, Boton } from "@/components/interfaz/Elementos";
import { useRecorrido } from "./ContextoRecorrido";
import s from "@/components/interfaz/interfaz.module.css";
export function PerfilRecorrido() {
  const { perfil, guardarPerfil, tema, cambiarTema } = useRecorrido();
  const [borrador, editar] = useState(perfil);
  const [error, avisar] = useState("");
  return (
    <div className={s.pila}>
      <div className={s.fila}>
        <AvatarPersona nombre={perfil.nombre} color="var(--persona-1)" />
        <div>
          <strong>{perfil.nombre}</strong>
          <p className={s.contexto}>{m.perfilMuestra}</p>
        </div>
      </div>
      <form
        className={s.formulario}
        onSubmit={(e) => {
          e.preventDefault();
          const numero = borrador.telefono.replace(/\s/g, "");
          if (
            numero &&
            !(borrador.internacional ? /^\+[1-9]\d{6,14}$/ : /^\d{8}$/).test(
              numero,
            )
          ) {
            avisar(
              borrador.internacional ? m.telefonoInvalido : m.faltanDigitos,
            );
            return;
          }
          if (!borrador.nombre.trim()) {
            avisar(m.nombreRequerido);
            return;
          }
          avisar("");
          guardarPerfil({ ...borrador, nombre: borrador.nombre.trim() });
        }}
      >
        <label className={s.campo}>
          <span>{m.nombre}</span>
          <input
            className={s.entradaCampo}
            required
            value={borrador.nombre}
            onChange={(e) => editar({ ...borrador, nombre: e.target.value })}
          />
        </label>
        <label className={s.campo}>
          <span>{m.rol}</span>
          <select
            className={s.entradaCampo}
            value={borrador.rol}
            onChange={(e) => editar({ ...borrador, rol: e.target.value })}
          >
            {m.roles.map((rol) => (
              <option key={rol}>{rol}</option>
            ))}
          </select>
        </label>
        {borrador.rol === m.roles[5] && (
          <label className={s.campo}>
            <span>{m.etiquetaRol}</span>
            <input
              className={s.entradaCampo}
              maxLength={20}
              value={borrador.etiqueta}
              onChange={(e) =>
                editar({ ...borrador, etiqueta: e.target.value })
              }
            />
          </label>
        )}
        <fieldset className={s.grupo}>
          <legend className={s.leyendaCampo}>{m.participacion}</legend>
          <div className={s.opciones}>
            {[m.corresponsable, m.apoyo].map((participacion) => (
              <Boton
                key={participacion}
                className={s.opcion}
                aria-pressed={borrador.participacion === participacion}
                onClick={() => editar({ ...borrador, participacion })}
              >
                {participacion}
              </Boton>
            ))}
          </div>
          <p className={s.suave}>{m.participacionAyuda}</p>
        </fieldset>
        <div>
          <label className={s.campo}>
            <span>{m.telefono}</span>
            <span className={`${s.entradaCampo} ${s.telefono}`}>
              {!borrador.internacional && <span>{m.prefijo}</span>}
              <input
                type="tel"
                aria-label={m.telefono}
                inputMode={borrador.internacional ? "tel" : "numeric"}
                value={
                  borrador.internacional
                    ? borrador.telefono
                    : borrador.telefono.replace(/^(\d{4})(\d+)/, "$1 $2")
                }
                aria-invalid={Boolean(error)}
                aria-describedby="ayuda-telefono"
                onChange={(e) =>
                  editar({
                    ...borrador,
                    telefono: borrador.internacional
                      ? e.target.value
                      : e.target.value.replace(/\D/g, "").slice(0, 8),
                  })
                }
              />
            </span>
          </label>
          <p className={s.suave} id="ayuda-telefono">
            {m.telefonoAyuda}
          </p>
          <Boton
            texto
            onClick={() => {
              editar({
                ...borrador,
                internacional: !borrador.internacional,
                telefono: "",
              });
              avisar("");
            }}
          >
            {borrador.internacional ? m.chile : m.otroPais}
          </Boton>
        </div>
        {error && (
          <p role="alert" className={s.mensajeError}>
            {error}
          </p>
        )}
        <Boton type="submit" principal>
          {m.guardar}
        </Boton>
      </form>
      <section className={`${s.tarjeta} ${s.pila}`}>
        <h2 className={s.seccionTitulo}>{m.aspecto}</h2>
        <div className={s.opciones}>
          {(["oscuro", "claro"] as const).map((valor) => (
            <Boton
              className={s.opcion}
              aria-pressed={tema === valor}
              onClick={() => cambiarTema(valor)}
              key={valor}
            >
              {m[valor]}
            </Boton>
          ))}
        </div>
      </section>
      <section className={`${s.tarjeta} ${s.pila}`}>
        <h2 className={s.seccionTitulo}>{m.formasEntrar}</h2>
        <p className={s.suave}>{m.formasAyuda}</p>
      </section>
    </div>
  );
}
