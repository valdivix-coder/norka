"use client";
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import Link from "@/components/interfaz/Enlace";
import { usePathname, useRouter } from "next/navigation";
import { Icono } from "@/components/Icono";
import { interfaz as m } from "@/mensajes/es-CL";
import { movimientoReducido, valorToken } from "@/lib/movimiento";
import { Boton } from "@/components/interfaz/Elementos";
import { ContextoRecorrido, useRecorrido } from "./ContextoRecorrido";
import { HojasRecorrido } from "./HojasRecorrido";
import s from "@/components/interfaz/interfaz.module.css";

import { transicionActiva, cambiarPantalla } from "@/lib/transicion";
import { destinoRecorrido, rutaRecorrido, movimientoEntre } from "@/lib/rutas-recorrido";

const destinos = [
  "hoy",
  "familia",
  "capturar",
  "equilibrio",
  "actividad",
] as const;
const titulos: Record<string, string> = {
  hoy: m.hoy,
  familia: m.familia,
  equilibrio: m.equilibrio,
  actividad: m.actividad,
  buscar: m.buscar,
  avisos: m.avisos,
  perfil: m.perfil,
  persona: m.persona,
};
export function Marco({
  children,
  logotipo,
  isotipo,
  baseRuta, nombrePerfil, colorPerfil, abrirCaptura, extra,
}: {
  children: ReactNode;
  logotipo: ReactNode;
  isotipo: ReactNode;
  baseRuta: string; nombrePerfil: string; colorPerfil?: string; abrirCaptura: () => void; extra?: ReactNode;
}) {
  const ruta = usePathname();
  const router = useRouter();
  const historial = useRef<string[]>([]);
  useEffect(() => {
    const actual = location.pathname + location.search;
    const rutas = historial.current;
    if (rutas.at(-1) === actual) return;
    if (rutas.at(-2) === actual) rutas.pop();
    else rutas.push(actual);
  }, [ruta]);
  function volver() {
    const previa = historial.current.at(-2);
    if (previa) cambiarPantalla(() => router.back(), previa);
    else router.replace(destinoRecorrido(baseRuta, pantalla === "persona" || pantalla === "perfil" ? "familia" : "hoy"));
  }
  const pantalla = rutaRecorrido(ruta)?.pantalla ?? "hoy";
  const subpantalla = !["hoy", "familia", "equilibrio", "actividad"].includes(
    pantalla,
  );
  const raiz = useRef<HTMLDivElement>(null);
  const contenido = useRef<HTMLElement>(null);
  const anterior = useRef(pantalla);
  useEffect(() => {
    const elemento = raiz.current!;
    let cuadro = 0;
    const actualizar = () => {
      const y = window.scrollY;
      elemento.style.setProperty(
        "--recogida",
        String(
          Math.min(1, Math.max(0, y / valorToken("--cabecera-recorrido"))),
        ),
      );
      elemento.style.setProperty(
        "--paralaje",
        `${movimientoReducido() ? 0 : Math.min(y, valorToken("--resplandor-lado")) * 0.3}px`,
      );
    };
    const scroll = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(actualizar);
    };
    actualizar();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(cuadro);
    };
  }, []);
  useEffect(() => {
    const fue = anterior.current;
    anterior.current = pantalla;
    if (fue === pantalla || transicionActiva()) return;
    const nodo = contenido.current!;
    const { detalle, sentido: direccion } = movimientoEntre(fue, pantalla);
    const distancia = valorToken(detalle ? "--traslado-detalle" : "--traslado-pestana");
    const animacion = nodo.animate(
      movimientoReducido()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: `translateX(${distancia * direccion}px)` },
            { opacity: 1, transform: "translateX(0)" },
          ],
      {
        duration: valorToken(
          movimientoReducido()
            ? "--mov-micro"
            : detalle
              ? "--mov-pantalla"
              : "--mov-estandar",
        ),
        easing: getComputedStyle(document.documentElement).getPropertyValue(
          "--curva-salida",
        ),
      },
    );
    window.scrollTo({ top: 0, behavior: "instant" });
    nodo.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    return () => animacion.cancel();
  }, [pantalla, subpantalla]);
  const titulo = titulos[pantalla] ?? m.hoy;
  return (
    <div className={s.app} ref={raiz}>
      <a className={`${s.boton} ${s.principal} ${s.saltar}`} href="#contenido">
        {m.saltar}
      </a>
      <header className={s.cabecera}>
        <div className={s.fondoCabecera} />
        <div className={s.filaCabecera}>
          {subpantalla ? (
            <Boton
              className={`${s.iconoBoton} ${s.volverCabecera}`}
              onClick={volver}
              aria-label={m.volver}
            >
              <Icono tipo="volver" />
            </Boton>
          ) : (
            <button
              className={s.marcaBoton}
              aria-label={m.irInicio}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: movimientoReducido() ? "instant" : "smooth",
                })
              }
            >
              <span className={s.logoCabecera} aria-hidden="true">
                {logotipo}
              </span>
              <span className={s.marcaRecogida} aria-hidden="true">
                <span className={s.isotipo}>{isotipo}</span>
                <span className={s.marcaTexto}>{titulo}</span>
              </span>
            </button>
          )}
          <nav className={s.accionesCabecera} aria-label={m.perfil}>
            <Link
              href={destinoRecorrido(baseRuta, "buscar")}
              className={`${s.boton} ${s.iconoBoton}`}
              aria-label={m.buscar}
            >
              <Icono tipo="buscar" />
            </Link>
            <Link
              href={destinoRecorrido(baseRuta, "avisos")}
              className={`${s.boton} ${s.iconoBoton}`}
              aria-label={m.avisos}
            >
              <Icono tipo="avisos" />
            </Link>
            <Link
              href={destinoRecorrido(baseRuta, "perfil")}
              className={`${s.boton} ${s.iconoBoton}`}
              aria-label={m.perfil}
            >
              <span className={s.avatarMini} style={{ "--color-avatar-cabecera": colorPerfil } as CSSProperties}>{nombrePerfil.slice(0, 1).toLocaleUpperCase("es-CL")}</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className={s.principalContenido} id="contenido" ref={contenido}>
        {children}
      </main>
      <nav className={s.nav} aria-label={m.navegacion}>
        {destinos.map((destino) =>
          destino === "capturar" ? (
            <button
              key={destino}
              className={s.capturar}
              aria-label={m.capturar}
              onClick={abrirCaptura}
            >
              <Icono tipo="capturar" />
            </button>
          ) : (
            <Link
              key={destino}
              className={s.destino}
              href={destinoRecorrido(baseRuta, destino)}
              aria-current={pantalla === destino ? "page" : undefined}
            >
              <Icono tipo={destino} />
              <span>{m[destino]}</span>
            </Link>
          ),
        )}
      </nav>
      {extra}
    </div>
  );
}
type MarcoMuestraProps = Pick<Parameters<typeof Marco>[0], "children" | "logotipo" | "isotipo">;
function MarcoMuestra(props: MarcoMuestraProps) {
  const { perfil, abrir } = useRecorrido();
  return <Marco {...props} baseRuta="/muestra/pantallas" nombrePerfil={perfil.nombre}
    abrirCaptura={() => abrir({tipo:"capturar"})} extra={<HojasRecorrido/>}/>;
}
export function MarcoRecorrido(props: MarcoMuestraProps) {
  return <ContextoRecorrido><MarcoMuestra {...props}/></ContextoRecorrido>;
}
export function OpcionesMuestra() {
  const { estado, cambiarEstado, ejemplos, tema, cambiarTema } = useRecorrido();
  return (
    <details className={s.pruebas}>
      <summary>{m.opcionesMuestra}</summary>
      <div className={s.pila}>
        <p>{m.limiteMuestra}</p>
        <fieldset className={s.grupo}>
          <legend>{m.estado}</legend>
          <div className={s.opciones}>
            {(Object.keys(m.estados) as (keyof typeof m.estados)[]).map((e) => (
              <Boton
                className={s.opcion}
                aria-pressed={estado === e}
                key={e}
                onClick={() => cambiarEstado(e)}
              >
                {m.estados[e]}
              </Boton>
            ))}
          </div>
        </fieldset>
        <div className={s.opciones}>
          <Boton onClick={() => void ejemplos()}>{m.ejemplos}</Boton>
          <Boton
            onClick={() => cambiarTema(tema === "oscuro" ? "claro" : "oscuro")}
          >
            {tema === "oscuro" ? m.claro : m.oscuro}
          </Boton>
          <Link className={s.boton} href="/">
            {m.revisarEntrada}
          </Link>
        </div>
      </div>
    </details>
  );
}
