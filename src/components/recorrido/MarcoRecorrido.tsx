"use client";
import { useEffect, useRef, type ReactNode } from "react";
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
function Marco({
  children,
  logotipo,
  isotipo,
}: {
  children: ReactNode;
  logotipo: ReactNode;
  isotipo: ReactNode;
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
    else router.replace(pantalla === "persona" ? "/muestra/pantallas/familia" : "/muestra/pantallas/hoy");
  }
  const pantalla = ruta.split("/").at(-1) ?? "hoy";
  const subpantalla = !["hoy", "familia", "equilibrio", "actividad"].includes(
    pantalla,
  );
  const { abrir, personas, perfil } = useRecorrido();
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
        `${Math.min(y, valorToken("--resplandor-lado")) * 0.3}px`,
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
    const distancia = valorToken(
      subpantalla ? "--traslado-detalle" : "--traslado-pestana",
    );
    const indice = (p: string) =>
      destinos.indexOf(p as (typeof destinos)[number]);
    const direccion = subpantalla || indice(pantalla) > indice(fue) ? 1 : -1;
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
            : subpantalla
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
  const titulo =
    pantalla === "persona" && personas.length
      ? m.persona
      : (titulos[pantalla] ?? m.hoy);
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
              href="/muestra/pantallas/buscar"
              className={`${s.boton} ${s.iconoBoton}`}
              aria-label={m.buscar}
            >
              <Icono tipo="buscar" />
            </Link>
            <Link
              href="/muestra/pantallas/avisos"
              className={`${s.boton} ${s.iconoBoton}`}
              aria-label={m.avisos}
            >
              <Icono tipo="avisos" />
            </Link>
            <Link
              href="/muestra/pantallas/perfil"
              className={`${s.boton} ${s.iconoBoton}`}
              aria-label={m.perfil}
            >
              <span className={s.avatarMini}>{perfil.nombre.slice(0, 1)}</span>
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
              onClick={() => abrir({ tipo: "capturar" })}
            >
              <Icono tipo="capturar" />
            </button>
          ) : (
            <Link
              key={destino}
              className={s.destino}
              href={`/muestra/pantallas/${destino}`}
              aria-current={pantalla === destino ? "page" : undefined}
            >
              <Icono tipo={destino} />
              <span>{m[destino]}</span>
            </Link>
          ),
        )}
      </nav>
      <HojasRecorrido />
    </div>
  );
}
export function MarcoRecorrido(props: Parameters<typeof Marco>[0]) {
  return (
    <ContextoRecorrido>
      <Marco {...props} />
    </ContextoRecorrido>
  );
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
