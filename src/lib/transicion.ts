// Coordinación de la transición nativa con la llegada real de la página de Next.
import { movimientoEntre, rutaRecorrido } from "./rutas-recorrido";
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
  const actual = rutaRecorrido(location.pathname)?.pantalla ?? "";
  const siguiente = rutaRecorrido(destino)?.pantalla ?? "";
  const { detalle, sentido } = movimientoEntre(actual, siguiente);
  const raiz = document.documentElement;
  raiz.dataset.transicion = detalle ? "detalle" : "pestana";
  raiz.style.setProperty("--sentido", String(sentido));
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
        }, rutaRecorrido(destino)?.real ? 320 : 2000);
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
