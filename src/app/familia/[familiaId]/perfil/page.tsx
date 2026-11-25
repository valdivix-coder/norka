import Link from "@/components/interfaz/Enlace";
import { AjustesRecorrido, EncabezadoReal } from "@/components/familia/PantallaReal";
import { notFound, redirect } from "next/navigation";
import { CampoTelefono } from "@/components/familia/CampoTelefono";
import s from "@/components/interfaz/interfaz.module.css";
import { NoEsIntegrante } from "@/core/domain/integrante";
import { verFamilia } from "@/core/usecases/familias";
import { almacenFamilias, cuentaActual } from "@/lib/familia/cuenta";
import { familia as m, interfaz as mi } from "@/mensajes/es-CL";
import { guardarPerfilAccion, type ClaveError } from "../../acciones";
import estilos from "../../familia.module.css";

const roles = ["madre", "padre", "cuidador", "abuelo", "tio", "otro"] as const;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Perfil({
  params,
  searchParams,
}: {
  params: Promise<{ familiaId: string }>;
  searchParams: Promise<{ guardado?: string; error?: string }>;
}) {
  const { familiaId } = await params;
  const { guardado, error } = await searchParams;
  const cuenta = await cuentaActual();
  if (!cuenta) redirect("/entrar");
  if (!uuid.test(familiaId)) notFound();
  let yo;
  try {
    ({ yo } = await verFamilia(cuenta, familiaId, almacenFamilias()));
  } catch (e) {
    if (e instanceof NoEsIntegrante) notFound();
    throw e;
  }
  const mensajeError =
    error === "conflicto"
      ? m.perfil.conflicto
      : error && error in m.errores
        ? m.errores[error as ClaveError]
        : null;
  const chile = yo.telefono?.startsWith("+569") && yo.telefono.length === 12;
  return (
    <section className={s.pila}>
      <EncabezadoReal pantalla="perfil" titulo={m.perfil.titulo} contexto={yo.nombre}/>
      <form action={guardarPerfilAccion} className={s.formulario}>
        <input type="hidden" name="familiaId" value={familiaId} />
        <input type="hidden" name="revision" value={yo.revision} />
        <label className={s.campo}>
          <span>{mi.rol}</span>
          <select className={s.entradaCampo} name="rol" defaultValue={yo.rol_familiar}>
            {roles.map((r, i) => (
              <option key={r} value={r}>
                {mi.roles[i]}
              </option>
            ))}
          </select>
        </label>
        <label className={s.campo}>
          <span>{mi.etiquetaRol}</span>
          <input className={s.entradaCampo} name="etiqueta" maxLength={20} defaultValue={yo.rol_etiqueta ?? ""} autoComplete="off" />
        </label>
        <fieldset className={s.campo}>
          <legend className={s.leyendaCampo}>{m.crear.cumple}</legend>
          <div className={estilos.dosColumnas}>
            <input className={s.entradaCampo} name="cumple_dia" inputMode="numeric" maxLength={2} placeholder={m.crear.dia} aria-label={m.crear.dia} defaultValue={yo.cumple_dia ?? ""} />
            <select className={s.entradaCampo} name="cumple_mes" defaultValue={yo.cumple_mes ?? ""} aria-label={m.crear.mes}>
              <option value="">{m.crear.mes}</option>
              {m.meses.map((nombre, i) => (
                <option key={nombre} value={i + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <CampoTelefono
          modoInicial={!yo.telefono || chile ? "chile" : "otro"}
          valorInicial={!yo.telefono ? "" : chile ? yo.telefono.slice(4) : yo.telefono}
        />
        {guardado && <p role="status">{m.perfil.guardado}</p>}
        {mensajeError && <p role="alert">{mensajeError}</p>}
        <button className={`${s.boton} ${s.principal} ${s.ancho}`} type="submit">
          {m.perfil.guardar}
        </button>
      </form>
      <AjustesRecorrido/>
      <Link className={`${s.boton} ${s.texto}`} href={`/familia/${familiaId}`}>
        {m.perfil.volver}
      </Link>
    </section>
  );
}
