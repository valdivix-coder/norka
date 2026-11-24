import { Marca } from "@/components/marca/Marca";
import s from "./interfaz.module.css";
export function MarcaDelTema({
  pieza,
}: {
  pieza: "logotipo" | "isotipo" | "conjunto-vertical";
}) {
  return (
    <>
      <span className={s.soloOscuro}>
        <Marca pieza={pieza} fondo="noche" />
      </span>
      <span className={s.soloClaro}>
        <Marca pieza={pieza} fondo="claro" />
      </span>
    </>
  );
}
