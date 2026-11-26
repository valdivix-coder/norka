// Coordinación de la transición nativa con la llegada real de la página de Next.
import { movimientoEntre, rutaRecorrido, personaDeRuta } from "./rutas-recorrido";
let llegada: (() => void) | undefined;
let activa = false;
let transicionActual: ViewTransition | undefined;
let generacion = 0;
let compartido: string | null = null;
const marcados = new Set<HTMLElement>();
function marcar() {
  if(!compartido) return;
  const nodo=document.getElementById("persona-"+compartido);
  if(nodo) { nodo.style.viewTransitionName="norka-persona";marcados.add(nodo); }
}
function limpiar() {
  for(const nodo of marcados) nodo.style.viewTransitionName="";
  marcados.clear();compartido=null;
}
export function transicionActiva() { return activa; }
export function pantallaLista() { marcar(); llegada?.(); }
// Una silueta no es el destino final: evitar animar dos pantallas consecutivas.
export function pantallaCargando() { transicionActual?.skipTransition(); llegada?.(); }
export function cambiarPantalla(navegar: () => void, destino: string) {
  if (!document.startViewTransition) { navegar();return; }
  if (activa) {
    generacion++;
    transicionActual?.skipTransition();llegada?.();limpiar();
    activa=false;transicionActual=undefined;llegada=undefined;
    navegar();return;
  }
  const origen=location.pathname+location.search;
  const actual = rutaRecorrido(origen)?.pantalla ?? "";
  const siguiente = rutaRecorrido(destino)?.pantalla ?? "";
  const { detalle, sentido } = movimientoEntre(actual, siguiente);
  const raiz = document.documentElement;
  raiz.dataset.transicion = detalle ? "detalle" : "pestana";
  raiz.style.setProperty("--sentido", String(sentido));
  const reducida=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  compartido=!reducida ? personaDeRuta(destino) ?? personaDeRuta(origen) : null;
  marcar();
  activa = true;
  const turno=++generacion;
  let tiempo: ReturnType<typeof setTimeout> | undefined;
  const transicion = document.startViewTransition(
    () => new Promise<void>((resolver) => {
      if(turno!==generacion){resolver();return;}
      llegada = () => { clearTimeout(tiempo); llegada = undefined; resolver(); };
      // Una respuesta lenta no congela la navegación; se presenta la pantalla sin animación.
      tiempo = setTimeout(() => {transicion.skipTransition();llegada?.();}, rutaRecorrido(destino)?.real ? 320 : 2000);
      navegar();
    }),
  );
  transicionActual=transicion;
  void transicion.finished.catch(() => {}).finally(() => {
    clearTimeout(tiempo);
    if(turno===generacion){activa=false;llegada=undefined;transicionActual=undefined;limpiar();}
  });
}
