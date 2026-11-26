import type { CSSProperties } from "react";
import { avance } from "@/mensajes/es-CL";
import estilos from "./anillo.module.css";

const medidas = {
  grande: [124, 50, 12],
  mediano: [84, 34, 9],
  pequeno: [40, 16, 5],
  lista: [24, 9, 3],
} as const;
type Props = {
  tamano: keyof typeof medidas;
  nombre: string;
  alDia: number;
  proximas: number;
  vencidas: number;
  persona?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  destino: string;
};

export function AnilloAvance({
  tamano,
  nombre,
  alDia,
  proximas,
  vencidas,
  persona,
  destino,
}: Props) {
  const [lado, radio, trazo] = medidas[tamano];
  const total = alDia + proximas + vencidas;
  const cantidad = total ? avance.cantidad(alDia, total) : avance.sinPlazos;
  const centro = lado / 2;
  const perimetro = 2 * Math.PI * radio;
  const colores = ["var(--marca)", "var(--proximas)", "var(--vencidas)"];
  const valores = tamano === "grande" ? [alDia, proximas, vencidas] : [alDia];
  const varios = valores.filter(Boolean).length > 1;
  const espacio = varios ? trazo * 1.9 : 0;
  return (
    <a
      className={estilos.enlace}
      data-tamano={tamano}
      href={destino}
      aria-label={avance.detalle(nombre, cantidad)}
    >
      <span className={estilos.anillo} aria-hidden="true">
        <svg viewBox={`0 0 ${lado} ${lado}`} fill="none">
          <circle
            cx={centro}
            cy={centro}
            r={radio}
            stroke="var(--borde)"
            strokeWidth={trazo}
          />
          {valores.map((valor, indice) => {
            if (!valor || !total) return null;
            const inicio = valores
              .slice(0, indice)
              .reduce((suma, n) => suma + n, 0);
            const tramo = Math.max(0, (perimetro * valor) / total - espacio);
            return (
              <circle
                key={indice}
                cx={centro}
                cy={centro}
                r={radio}
                stroke={
                  persona && tamano !== "grande"
                    ? `var(--persona-${persona})`
                    : colores[indice]
                }
                strokeWidth={trazo}
                strokeLinecap="round"
                transform={`rotate(-90 ${centro} ${centro})`}
                strokeDasharray={`${tramo} ${perimetro - tramo}`}
                style={
                  {
                    "--desfase": -((perimetro * inicio) / total + espacio / 2),
                  } as CSSProperties
                }
                className={estilos.tramo}
              />
            );
          })}
        </svg>
        {!!total && (tamano === "grande" || tamano === "mediano") && (
          <span className={estilos.centro}>
            <strong>
              {alDia} <small>{avance.de(total)}</small>
            </strong>
            {tamano === "grande" && <span>{avance.semana}</span>}
          </span>
        )}
      </span>
      {!total
        ? avance.sinPlazos
        : tamano === "pequeno"
          ? nombre
          : tamano === "lista"
            ? cantidad
            : null}
    </a>
  );
}
