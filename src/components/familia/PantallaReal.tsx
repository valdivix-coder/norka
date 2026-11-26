"use client";
import { useLayoutEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/interfaz/Enlace";
import { AvatarPersona, Boton, Vacio } from "@/components/interfaz/Elementos";
import { useCapturaReal } from "./MarcoReal";
import type { PersonaACargo } from "@/core/domain/familia";
import { colorPersona } from "@/core/usecases/personas-reales";
import type { TareaCapturada } from "@/core/domain/captura";
import { interfaz as m, entrada, captura as textos } from "@/mensajes/es-CL";
import { pantallaLista } from "@/lib/transicion";
import s from "@/components/interfaz/interfaz.module.css";

export type PantallaReal = "hoy" | "equilibrio" | "actividad" | "avisos" | "buscar";
type PersonaBusca = Pick<PersonaACargo,"id"|"nombre"|"tipo"|"color">;
const contextos = { hoy:m.contextoHoy, familia:m.contextoFamilia, equilibrio:m.contextoEquilibrio,
  actividad:m.contextoActividad, avisos:m.contextoAvisos, buscar:m.contextoBuscar, perfil:m.contextoPerfil, persona:m.personas };
export function EncabezadoReal({ pantalla, titulo, contexto, persona }: {
  pantalla: keyof typeof contextos; titulo?: string; contexto?: string; persona?: PersonaBusca;
}) {
  const ruta = usePathname();
  useLayoutEffect(() => {
    if (!location.hash) {
      window.scrollTo({top:0,behavior:"instant"});
      document.querySelector<HTMLElement>("main h1")?.focus({preventScroll:true});
    }
    pantallaLista();
  },[ruta,persona?.id]);
  return <>
    <div className={s.resplandor} aria-hidden="true" style={{
      "--luz-color":persona ? colorPersona(persona.color,persona.tipo) : pantalla==="equilibrio" ? "var(--acento)" : "var(--marca)",
      "--luz-opacidad":persona ? "var(--luz-persona)" : pantalla==="hoy" ? "var(--luz-hoy)" : pantalla==="equilibrio" ? "var(--luz-equilibrio)" : "var(--luz-familia)",
    } as CSSProperties}/>
    <div className={s.encabezado} id={persona ? "persona-"+persona.id : undefined}>
      <p className={s.contexto}>{contexto ?? contextos[pantalla]}</p>
      <h1 tabIndex={-1} className={s.titulo}>{titulo ?? m[pantalla]}</h1>
    </div>
  </>;
}
function BuscarReal({base, personas}: {base:string;personas:PersonaBusca[]}) {
  const [consulta, escribir] = useState("");
  const normalizar = (t:string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es-CL");
  const q=normalizar(consulta.trim());
  const resultados=q.length>=2 ? personas.filter(p=>normalizar(p.nombre).includes(q)): [];
  return <div className={s.pila}>
    <label className={s.campo}><span className={s.soloLector}>{m.campoBuscar}</span>
      <input type="search" className={s.entradaCampo} placeholder={m.campoBuscar} value={consulta}
        autoComplete="off" onChange={e=>escribir(e.target.value)}/></label>
    <div aria-live="polite">
      {q.length<2 ? <Vacio tipo="buscar" titulo={m.sinBusqueda} ayuda={m.busquedaReal}/>
      : resultados.length ? <div className={s.lista}>{resultados.map(p=>
        <Link key={p.id} href={base+"/persona?id="+p.id} className={`${s.filaLista} ${s.enlaceFila}`}>
          <AvatarPersona nombre={p.nombre} tipo={p.tipo} color={colorPersona(p.color,p.tipo)}/>
          <span>{p.nombre}</span>
        </Link>)}</div>
      : <Vacio tipo="buscar" titulo={m.sinResultados} ayuda={m.ajustarBusqueda}>
          <Boton onClick={()=>escribir("")}>{m.limpiar}</Boton>
        </Vacio>}
    </div>
  </div>;
}
export function PantallaRealVacia({ pantalla, familiaId, personas, capturas=[] }: {
  pantalla:PantallaReal; familiaId:string; personas:PersonaBusca[]; capturas?:TareaCapturada[];
}) {
  const base="/familia/"+familiaId;
  const capturar=useCapturaReal();
  return <>
    <EncabezadoReal pantalla={pantalla}/>
    {pantalla==="buscar" ? <BuscarReal base={base} personas={personas}/>
    : pantalla==="hoy" ? <div className={`${s.pila} ${s.hoyReal}`}>
      <section className={s.fila} aria-label={m.semana}>
        <div className={s.anilloVacio} role="img" aria-label={m.sinPlazos}>
          <svg viewBox="0 0 124 124" aria-hidden="true"><circle cx="62" cy="62" r="50" fill="none" stroke="var(--borde)" strokeWidth="12"/></svg>
          <span>{m.sinPlazos}</span>
        </div>
        <dl className={s.leyenda}>{[m.alDia,m.proximas,m.vencidas].map((nombre,i)=>
          <div key={nombre}><dt><span aria-hidden="true" className={`${s.punto} ${i===1?s.puntoProximas:i===2?s.puntoVencidas:""}`}/>{nombre}</dt><dd>0</dd></div>)}</dl>
      </section>
      <h2 className={s.seccionTitulo}>{m.teToca}</h2>
      {capturas.length>0?<section className={s.pila} aria-label={textos.porRevisar}>
        <h2 className={s.seccionTitulo}>{textos.porRevisar}</h2>
        <div className={s.lista}>{capturas.map(t=><div key={t.id} className={s.filaLista}><span style={{overflowWrap:"anywhere",whiteSpace:"pre-wrap"}}>{t.titulo}</span></div>)}</div>
      </section>:<Vacio tipo="hoy" titulo={m.ayudaHoy}>
        <Boton principal onClick={()=>capturar?.()}>{m.capturarAlgo}</Boton>
      </Vacio>}
    </div> : <Vacio tipo={pantalla}
      titulo={pantalla==="equilibrio"?m.sinEquilibrio:pantalla==="actividad"?m.sinActividad:m.sinAvisos}
      ayuda={pantalla==="equilibrio"?m.ayudaEquilibrio:pantalla==="actividad"?m.ayudaActividad:m.ayudaAvisos}>
      <Link className={`${s.boton} ${s.principal}`} href={pantalla==="equilibrio"?base:base+"/hoy"}>
        {pantalla==="equilibrio"?m.verFamilia:m.volverHoy}
      </Link>
    </Vacio>}
  </>;
}
function escucharTema(cambio: () => void) {
  window.addEventListener("norka-tema", cambio);
  return () => window.removeEventListener("norka-tema", cambio);
}
const temaActual = () => document.documentElement.dataset.tema === "claro" ? "claro" : "oscuro";
const temaServidor = () => "oscuro";
export function AjustesRecorrido() {
  const tema=useSyncExternalStore(escucharTema,temaActual,temaServidor);
  return <section className={`${s.tarjeta} ${s.pila}`}>
    <h2 className={s.seccionTitulo}>{m.aspecto}</h2>
    <div className={s.opciones}>{(["oscuro","claro"] as const).map(valor=><Boton key={valor} className={s.opcion}
      aria-pressed={tema===valor} onClick={()=>{document.documentElement.dataset.tema=valor;window.dispatchEvent(new Event("norka-tema"));}}>{m[valor]}</Boton>)}</div>
    <Link className={s.boton} href="/cuenta">{entrada.cuenta.titulo}</Link>
    <form action="/api/salir" method="post"><Boton type="submit" className={s.ancho}>{entrada.cuenta.salir}</Boton></form>
  </section>;
}

export function FichaReal({familiaId,persona}: {
  familiaId:string;persona:PersonaBusca & Pick<PersonaACargo,"cumple_dia"|"cumple_mes">;
}) {
  const cumple=persona.cumple_dia && persona.cumple_mes
    ? m.fechaCumple(persona.cumple_dia,m.meses[persona.cumple_mes-1].toLocaleLowerCase("es-CL")) : m.tipos[persona.tipo];
  return <div className={s.pila}>
    <EncabezadoReal pantalla="persona" titulo={persona.nombre} contexto={persona.tipo==="hogar"?m.personas:cumple} persona={persona}/>
    <div className={s.fila}>
      <AvatarPersona nombre={persona.nombre} tipo={persona.tipo} color={colorPersona(persona.color,persona.tipo)}/>
      {persona.tipo!=="hogar" && <span>{m.tipos[persona.tipo]}</span>}
    </div>
    <Vacio titulo={m.sinResponsabilidades} ayuda={m.noResponsabilidad}>
      <Link className={`${s.boton} ${s.principal}`} href={"/familia/"+familiaId}>{m.verFamilia}</Link>
    </Vacio>
    {persona.tipo==="hogar" && <p className={s.suave}>{m.hogarAyuda}</p>}
  </div>;
}
