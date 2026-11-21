// Guía 8.1. Lienzo común y trazos que heredan el color del control.
const trazos = {
  hoy: "M3 11 12 3l9 8 M5 10v11h14V10",
  familia:
    "M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M2 20v-2a6 6 0 0 1 12 0v2 M16 5a3 3 0 0 1 0 6 M17 14q5 0 5 6",
  capturar: "M12 4v16 M4 12h16",
  equilibrio: "M3 7h18 M12 3v18 M5 8l-3 7h6z M19 8l-3 7h6z",
  actividad: "M2 12h5l3-8 4 16 3-8h5",
  colegio: "M2 9l10-5 10 5-10 5z M6 12v4q6 5 12 0v-4",
  salud: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  pagos: "M3 5h18v14H3z M3 10h18",
  puerta: "M5 21V10a7 7 0 0 1 14 0v11 M14 14h1",
  buscar: "M16 16l5 5 M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0",
  avisos: "M5 16l2-4V9a5 5 0 0 1 10 0v3l2 4z M10 20h4",
  hecho: "M4 12l5 5L20 6",
  logro: "M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  llamar: "M4 3h4l2 5-2 2q2 4 6 6l2-2 5 2v4q-2 4-10-2T3 5z",
  comentar: "M3 4h18v13H9l-6 4z",
} as const;
export function Icono({ tipo }: { tipo: keyof typeof trazos }) {
  return (
    <svg
      aria-hidden="true"
      className="icono"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <path d={trazos[tipo]} />
    </svg>
  );
}
