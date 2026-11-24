import Link from "next/link";
import { interfaz as m, mensajes } from "@/mensajes/es-CL";
import { MarcaDelTema } from "@/components/interfaz/MarcaDelTema";
import s from "@/components/interfaz/interfaz.module.css";
export const metadata = { title: mensajes.marca, description: m.descripcion };
export default function Entrada() {
  return (
    <main className={s.entrada}>
      <div className={s.resplandor} aria-hidden="true" />
      <div className={s.entradaSuperior}>
        <p className={s.contexto}>{m.muestraPie}</p>
        <div className={s.entradaMarca}>
          <MarcaDelTema pieza="conjunto-vertical" />
        </div>
        <h1 className={s.entradaFrase}>{m.descripcion}</h1>
      </div>
      <div className={s.entradaInferior}>
        <p className={s.suave}>{m.limiteMuestra}</p>
        <Link
          className={`${s.boton} ${s.principal}`}
          href="/muestra/pantallas/hoy"
        >
          {m.entrarMuestra}
        </Link>
        <Link className={`${s.boton} ${s.texto}`} href="/muestra">
          {m.verComponentes}
        </Link>
        <Link className={`${s.boton} ${s.texto}`} href="/entrar">
          {m.entrarConCuenta}
        </Link>
      </div>
    </main>
  );
}
