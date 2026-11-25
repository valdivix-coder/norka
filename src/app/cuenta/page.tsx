import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { entrada as m, familia as mf, mensajes } from "@/mensajes/es-CL";
import { validarSesion } from "@/core/usecases/sesion";
import { hashToken } from "@/lib/entrada/pkce";
import { almacenes, reloj } from "@/lib/entrada/servidor";
import { almacenFamilias } from "@/lib/familia/cuenta";
import { COOKIE_SESION } from "@/lib/entrada/cookies";
import s from "@/components/interfaz/interfaz.module.css";

export const metadata = { title: `${m.cuenta.titulo} · ${mensajes.marca}` };

type Props = { searchParams: Promise<{ unida?: string }> };

export default async function Cuenta({ searchParams }: Props) {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token) redirect("/entrar");
  const almacen = almacenes();
  let cuentaId: string;
  try {
    ({ cuenta_id: cuentaId } = await validarSesion(
      await hashToken(token),
      almacen,
      reloj,
    ));
  } catch {
    redirect("/entrar");
  }
  const cuenta = await almacen.buscarCuenta(cuentaId);
  if (!cuenta) redirect("/entrar");
  const identidades = await almacen.listarIdentidades(cuentaId);
  const { unida } = await searchParams;
  const familias = await almacenFamilias().familiasDeCuenta(cuentaId);
  const primera = familias[0];
  return (
    <main className={s.entrada}>
      <div className={s.entradaSuperior}>
        <h1 className={s.entradaFrase}>{m.cuenta.titulo}</h1>
        <p>{cuenta.nombre}</p>
        <p className={s.suave}>{cuenta.correo}</p>
        <p className={s.suave}>
          {m.cuenta.entrasCon}: {identidades.map((i) => i.proveedor).join(", ")}
        </p>
        {unida && <p role="status">{m.cuenta.unida}</p>}
      </div>
      <div className={s.entradaInferior}>
        <Link
          className={`${s.boton} ${s.principal} ${s.ancho}`}
          href={primera ? `/familia/${primera.familia_id}` : "/familia/nueva"}
        >
          {primera ? mf.cuenta.miFamilia : mf.cuenta.crearFamilia}
        </Link>
        <form action="/api/salir" method="post">
          <button className={`${s.boton} ${s.ancho}`} type="submit">
            {m.cuenta.salir}
          </button>
        </form>
      </div>
    </main>
  );
}
