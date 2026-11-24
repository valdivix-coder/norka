// Coordinación de la transición nativa con la llegada real de la página de Next.
let llegada: (() => void) | undefined;
let activa = false;
export function transicionActiva() {
  return activa;
}
export function pantallaLista() {
  llegada?.();
}
export function cambiarPantalla(navegar: () => void, destino: string) {
  if (!document.startViewTransition || activa) {
    navegar();
    return;
  }
  const orden = ["hoy", "familia", "equilibrio", "actividad"];
  const actual = location.pathname.split("/").at(-1) ?? "";
  const siguiente = destino.split("?")[0].split("/").at(-1) ?? "";
  const a = orden.indexOf(actual),
    b = orden.indexOf(siguiente);
  const raiz = document.documentElement;
  raiz.dataset.transicion = b === -1 || a === -1 ? "detalle" : "pestana";
  raiz.style.setProperty("--sentido", String(b !== -1 && a > b ? -1 : 1));
  activa = true;
  let tiempo: ReturnType<typeof setTimeout>;
  const transicion = document.startViewTransition(
    () =>
      new Promise<void>((resolver) => {
        llegada = () => {
          clearTimeout(tiempo);
          llegada = undefined;
          resolver();
        };
        // Salida ante una navegación cancelada o un error de red; nunca deja la UI bloqueada.
        tiempo = setTimeout(() => {
          transicion.skipTransition();
          llegada?.();
        }, 2000);
        navegar();
      }),
  );
  void transicion.finished
    .catch(() => {})
    .finally(() => {
      activa = false;
      llegada = undefined;
      clearTimeout(tiempo);
    });
}
