import Image from "next/image";
import { entrada as m } from "@/mensajes/es-CL";
import { MarcaDelTema } from "@/components/interfaz/MarcaDelTema";
import s from "@/components/interfaz/interfaz.module.css";
import { proveedoresConfigurados } from "@/lib/entrada/proveedores";

export const metadata = { title: m.titulo };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function Entrar({ searchParams }: Props) {
  const { error } = await searchParams;
  const mensajeError =
    error && error in m.errores
      ? m.errores[error as keyof typeof m.errores]
      : null;
  // Solo Google tiene su recurso oficial en el proyecto; Apple y Facebook se suman con el suyo.
  const google = proveedoresConfigurados().includes("google");
  return (
    <main className={s.entrada}>
      <div className={s.entradaSuperior}>
        <div className={s.entradaMarca}>
          <MarcaDelTema pieza="conjunto-vertical" />
        </div>
        <h1 className={s.entradaFrase}>{m.titulo}</h1>
        <p className={s.suave}>{m.bajada}</p>
      </div>
      <div className={s.entradaInferior}>
        {mensajeError && <p role="alert">{mensajeError}</p>}
        {google ? (
          <form action="/api/entrar/google" method="get">
            <button className={`${s.boton} ${s.principal} ${s.ancho}`} type="submit">
              <Image src="/proveedores/google.svg" width={24} height={24} alt="" />
              {m.continuarCon("Google")}
            </button>
          </form>
        ) : (
          <p className={s.suave}>{m.ningunProveedor}</p>
        )}
      </div>
    </main>
  );
}
