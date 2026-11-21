import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useId } from "react";
import { mensajes } from "@/mensajes/es-CL";
import estilos from "./marca.module.css";

const piezas = {
  logotipo: "logotipo.svg",
  isotipo: "isotipo-orbita.svg",
  "isotipo-reducido": "isotipo-reducido.svg",
} as const;

type Pieza = keyof typeof piezas | "conjunto-vertical";
type Fondo = "noche" | "lima" | "claro" | "una-tinta";

const colores = {
  noche: ["#F4F2FF", "#A594FF", "#C8F135"],
  lima: ["#0B0A1A", "#0B0A1A", "#6A4BFF"],
  claro: ["#0B0A1A", "#6A4BFF", "#0B0A1A"],
  "una-tinta": ["currentColor", "currentColor", "currentColor"],
} as const;

function dibujo(pieza: keyof typeof piezas, fondo: Fondo, id: string) {
  const [letras, trazo, punto] = colores[fondo];
  const archivo = join(process.cwd(), "src/components/marca", piezas[pieza]);
  return readFileSync(archivo, "utf8")
    .replaceAll("LETRAS", letras)
    .replaceAll("TRAZO", trazo)
    .replaceAll("PUNTO", punto)
    .replace(/norka-([kor])/g, `norka-$1-${id}`);
}

// Las consultas de contenedor eligen la pieza según su ancho real.
export function Marca({ pieza, fondo }: { pieza: Pieza; fondo: Fondo }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "_");
  const partes =
    pieza === "conjunto-vertical" || pieza === "logotipo"
      ? (["isotipo", "isotipo-reducido", "logotipo"] as const)
      : pieza === "isotipo"
        ? (["isotipo", "isotipo-reducido"] as const)
        : (["isotipo-reducido"] as const);
  return (
    <span
      className={estilos.marca}
      data-pieza={pieza}
      role="img"
      aria-label={mensajes.marca}
    >
      <span className={estilos.piezas} aria-hidden="true">
        {partes.map((parte) => (
          <span
            key={parte}
            data-dibujo={parte}
            dangerouslySetInnerHTML={{ __html: dibujo(parte, fondo, id) }}
          />
        ))}
      </span>
    </span>
  );
}
