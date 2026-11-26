import Image from "next/image";
import Link from "next/link";
import { CampoTelefono } from "@/components/familia/CampoTelefono";
import s from "@/components/interfaz/interfaz.module.css";
import { verInvitacion } from "@/core/usecases/familias";
import { hashToken } from "@/lib/entrada/pkce";
import { proveedoresConfigurados } from "@/lib/entrada/proveedores";
import { almacenFamilias, cuentaActual, reloj } from "@/lib/familia/cuenta";
import { entrada as me, familia as m, interfaz as mi } from "@/mensajes/es-CL";
import { aceptarInvitacionAccion, type ClaveError } from "@/app/familia/acciones";
import estilos from "@/app/familia/familia.module.css";

const roles = ["madre", "padre", "cuidador", "abuelo", "tio", "otro"] as const;

export default async function Invitacion({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ error?: string; estado?: string }>;
}) {
  const { codigo } = await params;
  const { error, estado } = await searchParams;
  const valido = /^[A-Za-z0-9_-]{43}$/.test(codigo);
  const vista = valido
    ? await verInvitacion(await hashToken(codigo), almacenFamilias(), reloj)
    : null;
  const aviso = (texto: string) => (
    <main className={estilos.pagina}>
      <p role="alert">{texto}</p>
      <Link className={`${s.boton} ${s.principal}`} href="/cuenta">
        {m.invitacion.irFamilia}
      </Link>
    </main>
  );
  if (!vista) return aviso(m.invitacion.noExiste);
  if (estado === "ya") return aviso(m.invitacion.yaEres);
  if (vista.usada) return aviso(m.invitacion.usada);
  if (!vista.vigente) return aviso(m.invitacion.caducada);

  const cuenta = await cuentaActual();
  const rol = mi.roles[roles.indexOf(vista.rol_familiar)] ?? vista.rol_familiar;
  const mensajeError = error && error in m.errores ? m.errores[error as ClaveError] : null;
  return (
    <main className={estilos.pagina}>
      <header>
        <h1>{m.invitacion.titulo(vista.familia_nombre)}</h1>
        <p className={s.suave}>
          {m.invitacion.comoRol(rol)}{" "}
          {vista.participacion === "corresponsable" ? mi.corresponsable : mi.apoyo}.
        </p>
      </header>
      {cuenta ? (
        <form action={aceptarInvitacionAccion} className={s.formulario}>
          <input type="hidden" name="codigo" value={codigo} />
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
          {mensajeError && <p role="alert">{mensajeError}</p>}
          <button className={`${s.boton} ${s.principal} ${s.ancho}`} type="submit">
            {m.invitacion.unirme}
          </button>
        </form>
      ) : (
        <div className={s.formulario}>
          <p className={s.suave}>{m.invitacion.entrarParaUnirte}</p>
          {proveedoresConfigurados().includes("google") ? (
            <form action="/api/entrar/google" method="get">
              <input type="hidden" name="siguiente" value={`/invitacion/${codigo}`} />
              <button className={`${s.boton} ${s.principal} ${s.ancho}`} type="submit">
                <Image src="/proveedores/google.svg" width={24} height={24} alt="" />
                {me.continuarCon("Google")}
              </button>
            </form>
          ) : (
            <p className={s.suave}>{me.ningunProveedor}</p>
          )}
        </div>
      )}
    </main>
  );
}
