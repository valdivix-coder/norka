// Guía 8.1. Lienzo común y trazos que heredan el color del control.
const trazos = {
  hoy: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
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
  volver: "M15 5l-7 7 7 7 M8 12h13",
  cerrar: "M6 6l12 12 M18 6 6 18",
  siguiente: "M9 5l7 7-7 7",
  persona: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21v-2a8 8 0 0 1 16 0v2",
  editar: "M4 16 16 4l4 4L8 20H4z M13 7l4 4",
  reloj: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
  mascota:
    "M7 14q5-5 10 0l2 4q0 4-7 1-7 3-7-1z M4 9a1 2 0 1 0 2 0 1 2 0 1 0-2 0 M9 5a1 2 0 1 0 2 0 1 2 0 1 0-2 0 M14 5a1 2 0 1 0 2 0 1 2 0 1 0-2 0 M19 9a1 2 0 1 0 2 0 1 2 0 1 0-2 0",
  crianza: "M12 21 3 12C-3 4 7-1 12 6c5-7 15-2 9 6z",
  tramites: "M5 3h10l4 4v14H5z M15 3v5h4 M8 12h8 M8 16h6",
  compras: "M4 7h16l1 14H3z M8 7V5a4 4 0 0 1 8 0v2",
  conexion: "M2 7q10-8 20 0 M5 11q7-6 14 0 M9 15q3-2 6 0 M12 19h.01 M3 3l18 18",
  aviso: "M12 3 2 21h20z M12 9v5 M12 17h.01",
  sol: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M19 5l-1 1 M6 18l-1 1",
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
