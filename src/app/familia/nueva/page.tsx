import { redirect } from "next/navigation";
import { CampoTelefono } from "@/components/familia/CampoTelefono";
import s from "@/components/interfaz/interfaz.module.css";
import { familia as m, interfaz as mi } from "@/mensajes/es-CL";
import { almacenFamilias, cuentaActual } from "@/lib/familia/cuenta";
import { crearFamiliaAccion, type ClaveError } from "../acciones";
import estilos from "../familia.module.css";

export const metadata = { title: m.crear.titulo };
const roles = ["madre", "padre", "cuidador", "abuelo", "tio", "otro"] as const;

export default async function NuevaFamilia({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cuenta = await cuentaActual();
  if (!cuenta) redirect("/entrar");
  const existentes = await almacenFamilias().familiasDeCuenta(cuenta);
  if (existentes[0]) redirect(`/familia/${existentes[0].familia_id}`);
  const { error } = await searchParams;
  const mensaje = error && error in m.errores ? m.errores[error as ClaveError] : null;
  return (
    <main className={estilos.pagina}>
      <header>
        <h1>{m.crear.titulo}</h1>
        <p className={s.suave}>{m.crear.bajada}</p>
      </header>
      <form action={crearFamiliaAccion} className={s.formulario}>
        <label className={s.campo}>
          <span>{m.crear.nombre}</span>
          <input
            className={s.entradaCampo}
            name="nombre"
            required
            maxLength={60}
            placeholder={m.crear.nombreEjemplo}
            autoComplete="off"
          />
        </label>
        <label className={s.campo}>
          <span>{m.crear.tuRol}</span>
          <select className={s.entradaCampo} name="rol" required defaultValue="">
            <option value="" disabled>
              {mi.rol}
            </option>
            {roles.map((r, i) => (
              <option key={r} value={r}>
                {mi.roles[i]}
              </option>
            ))}
          </select>
        </label>
        <label className={s.campo}>
          <span>{m.crear.tuParticipacion}</span>
          <select className={s.entradaCampo} name="participacion" required defaultValue="corresponsable">
            <option value="corresponsable">{mi.corresponsable}</option>
            <option value="apoyo">{mi.apoyo}</option>
          </select>
          <p className={s.suave}>{mi.participacionAyuda}</p>
        </label>
        <fieldset className={s.campo}>
          <legend className={s.leyendaCampo}>{m.crear.cumple}</legend>
          <div className={estilos.dosColumnas}>
            <input className={s.entradaCampo} name="cumple_dia" inputMode="numeric" maxLength={2} placeholder={m.crear.dia} aria-label={m.crear.dia} />
            <select className={s.entradaCampo} name="cumple_mes" defaultValue="" aria-label={m.crear.mes}>
              <option value="">{m.crear.mes}</option>
              {m.meses.map((nombre, i) => (
                <option key={nombre} value={i + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <CampoTelefono />
        {mensaje && <p role="alert">{mensaje}</p>}
        <button className={`${s.boton} ${s.principal} ${s.ancho}`} type="submit">
          {m.crear.boton}
        </button>
      </form>
    </main>
  );
}
