"use client";
import { useActionState, useState } from "react";
import { familia as m, interfaz as mi } from "@/mensajes/es-CL";
import s from "@/components/interfaz/interfaz.module.css";
import { crearInvitacionAccion, type EstadoInvitacion } from "@/app/familia/acciones";

const roles = ["madre", "padre", "cuidador", "abuelo", "tio", "otro"] as const;

export function FormularioInvitacion({ familiaId }: { familiaId: string }) {
  const [estado, enviar, pendiente] = useActionState<EstadoInvitacion, FormData>(
    crearInvitacionAccion,
    { enlace: null, error: null },
  );
  const [copiado, copiar] = useState(false);
  return (
    <form action={enviar} className={s.formulario}>
      <input type="hidden" name="familiaId" value={familiaId} />
      <h2>{m.invitar.titulo}</h2>
      <p className={s.suave}>{m.invitar.ayuda}</p>
      <label className={s.campo}>
        <span>{mi.rol}</span>
        <select className={s.entradaCampo} name="rol" defaultValue="padre">
          {roles.map((r, i) => (
            <option key={r} value={r}>
              {mi.roles[i]}
            </option>
          ))}
        </select>
      </label>
      <label className={s.campo}>
        <span>{mi.participacion}</span>
        <select className={s.entradaCampo} name="participacion" defaultValue="corresponsable">
          <option value="corresponsable">{mi.corresponsable}</option>
          <option value="apoyo">{mi.apoyo}</option>
        </select>
      </label>
      {estado.error && <p role="alert">{m.errores[estado.error]}</p>}
      <button className={`${s.boton} ${s.principal}`} type="submit" disabled={pendiente}>
        {m.invitar.boton}
      </button>
      {estado.enlace && (
        <div className={s.campo}>
          <span>{m.invitar.enlace}</span>
          <input
            className={s.entradaCampo}
            readOnly
            value={estado.enlace}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={m.invitar.enlace}
          />
          <button
            type="button"
            className={s.boton}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(estado.enlace as string);
                copiar(true);
              } catch {
                copiar(false);
              }
            }}
          >
            {copiado ? m.invitar.copiado : m.invitar.copiar}
          </button>
        </div>
      )}
    </form>
  );
}
