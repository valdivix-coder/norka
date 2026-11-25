// Rutas del recorrido: la muestra nunca se mezcla con una familia autenticada.
export const pestanas = ["hoy","familia","equilibrio","actividad"] as const;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function rutaRecorrido(ruta: string) {
  const partes = ruta.split("?")[0].split("/").filter(Boolean);
  if (partes[0] === "muestra" && partes[1] === "pantallas" && partes.length === 3)
    return { base: "/muestra/pantallas", pantalla: partes[2], real: false };
  if (partes[0] === "familia" && uuid.test(partes[1] ?? "") && partes.length <= 3)
    return { base: "/familia/" + partes[1], pantalla: partes[2] ?? "familia", real: true };
  return null;
}
export function destinoRecorrido(base: string, pantalla: string) {
  return base.startsWith("/familia/") && pantalla === "familia" ? base : base + "/" + pantalla;
}
export function movimientoEntre(actual: string, destino: string) {
  const a = pestanas.indexOf(actual as typeof pestanas[number]);
  const b = pestanas.indexOf(destino as typeof pestanas[number]);
  const detalle = a === -1 || b === -1;
  return { detalle, sentido: a === -1 && b !== -1 || a !== -1 && b !== -1 && a > b ? -1 : 1 };
}

// El gesto solo empieza en el borde y se confirma al superar la mitad del ancho.
export function gestoVolver(dx: number, dy: number, ancho: number) {
  return dx > 0 && dx > Math.abs(dy) && dx > ancho / 2;
}
