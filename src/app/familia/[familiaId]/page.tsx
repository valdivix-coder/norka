import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FormularioInvitacion } from "@/components/familia/FormularioInvitacion";
import s from "@/components/interfaz/interfaz.module.css";
import { NoEsIntegrante } from "@/core/domain/integrante";
import { verFamilia } from "@/core/usecases/familias";
import { almacenFamilias, cuentaActual } from "@/lib/familia/cuenta";
import { familia as m, interfaz as mi } from "@/mensajes/es-CL";
import estilos from "../familia.module.css";

const roles = ["madre", "padre", "cuidador", "abuelo", "tio", "otro"] as const;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Familia({
  params,
}: {
  params: Promise<{ familiaId: string }>;
}) {
  const { familiaId } = await params;
  const cuenta = await cuentaActual();
  if (!cuenta) redirect("/entrar");
  if (!uuid.test(familiaId)) notFound();
  let datos;
  try {
    datos = await verFamilia(cuenta, familiaId, almacenFamilias());
  } catch (error) {
    if (error instanceof NoEsIntegrante) notFound();
    throw error;
  }
  const { familia, yo, integrantes } = datos;
  const rol = (r: string) => mi.roles[roles.indexOf(r as (typeof roles)[number])] ?? r;
  return (
    <main className={estilos.pagina}>
      <header>
        <h1>{familia.nombre}</h1>
        <p className={s.suave}>{m.ver.integrantes}</p>
      </header>
      <ul className={estilos.lista}>
        {integrantes.map((i) => (
          <li key={i.id} className={estilos.fila}>
            <span
              className={estilos.avatar}
              style={{ background: `var(--${i.color})` }}
              aria-hidden="true"
            >
              {i.nombre.charAt(0).toUpperCase()}
            </span>
            <div className={estilos.datos}>
              <strong>{i.nombre}</strong>
              <span className={s.suave}>
                {i.rol_etiqueta ?? rol(i.rol_familiar)} ·{" "}
                {i.participacion === "corresponsable" ? mi.corresponsable : mi.apoyo}
                {i.permiso === "administrador" ? ` · ${m.ver.administrador}` : ""}
              </span>
              <span className={s.suave}>
                {i.cuota_objetivo === null ? m.ver.sinCuota : m.ver.cuota(i.cuota_objetivo)}
              </span>
              <span className={estilos.fecha}>{i.telefono ?? m.ver.telefonoVacio}</span>
              {i.cumple_dia !== null && i.cumple_mes !== null && (
                <span className={s.suave}>
                  {i.cumple_dia} de {m.meses[i.cumple_mes - 1]}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Link className={`${s.boton} ${s.ancho}`} href={`/familia/${familiaId}/perfil`}>
        {m.ver.tuPerfil}
      </Link>
      {yo.permiso === "administrador" ? (
        <FormularioInvitacion familiaId={familiaId} />
      ) : (
        <p className={s.suave}>{m.invitar.soloAdministrador}</p>
      )}
      <Link className={`${s.boton} ${s.texto}`} href="/cuenta">
        {mi.volver}
      </Link>
    </main>
  );
}
