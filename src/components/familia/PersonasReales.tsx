"use client";
import { useEffect, useRef, useState } from "react";
import type { Ambito, PersonaACargo } from "@/core/domain/familia";
import { colorPersona, type CambioPersona } from "@/core/usecases/personas-reales";
import { cambiarPersonaAccion, leerPersonasAccion } from "@/app/familia/personas-acciones";
import { AvatarPersona, Boton } from "@/components/interfaz/Elementos";
import { HojaInferior } from "@/components/interfaz/HojaInferior";
import { Archivo, FormularioPersona } from "@/components/recorrido/HojasRecorrido";
import { Icono } from "@/components/Icono";
import { interfaz as m } from "@/mensajes/es-CL";
import s from "@/components/interfaz/interfaz.module.css";

const iconos = { cruz: "salud", birrete: "colegio", tarjeta: "pagos", corazon: "crianza",
  puerta: "puerta", huella: "mascota", documento: "tramites", bolsa: "compras" } as const;
const colores = /^(ambito-(salud|colegio|pagos|crianza|hogar|mascotas|tramites|compras)|persona-[1-8])$/;
type Hoja = { tipo: "editar" | "archivar"; persona: PersonaACargo } | { tipo: "crear" };

export function PersonasReales({ familiaId, iniciales, ambitosIniciales }: {
  familiaId: string; iniciales: PersonaACargo[]; ambitosIniciales: Ambito[];
}) {
  const [personas, ponerPersonas] = useState(iniciales);
  const [ambitos, ponerAmbitos] = useState(ambitosIniciales);
  const [hoja, abrir] = useState<Hoja | null>(null);
  const [aviso, avisar] = useState("");
  const [vuelta, ponerVuelta] = useState<CambioPersona | null>(null);
  const [ocupado, ocupar] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const operando = useRef(false);
  useEffect(() => () => clearTimeout(temporizador.current), []);
  function anunciar(texto: string, deshacer: CambioPersona | null = null) {
    clearTimeout(temporizador.current);
    avisar(texto);
    ponerVuelta(deshacer);
    if (deshacer) temporizador.current = setTimeout(() => { avisar(""); ponerVuelta(null); }, 5000);
  }
  async function refrescar() {
    if (operando.current) return;
    operando.current = true;
    ocupar(true);
    try {
      const r = await leerPersonasAccion(familiaId);
      if (!r.ok) throw new Error("FALLO");
      ponerPersonas(r.personas); ponerAmbitos(r.ambitos); anunciar("");
    } catch { anunciar(m.errorCargar); }
    finally { operando.current = false; ocupar(false); }
  }
  async function aplicar(cambio: CambioPersona, esDeshacer = false) {
    if (operando.current) throw new Error("OCUPADO");
    operando.current = true;
    ocupar(true);
    try {
      const r = await cambiarPersonaAccion(familiaId, cambio);
      if (!r.ok) throw new Error(r.error === "conflicto" ? "CONFLICTO_REVISION" : r.error === "cumple" ? "CUMPLEANOS_INVALIDO" : "FALLO");
      const { actual, anterior } = r;
      ponerPersonas(prev => [...prev.filter(p => p.id !== actual.id), actual]);
      abrir(null);
      const reverso: CambioPersona = cambio.tipo === "crear"
        ? { tipo: "archivar", id: actual.id, revision: actual.revision }
        : cambio.tipo === "archivar"
          ? { tipo: "restaurar", id: actual.id, revision: actual.revision }
          : { tipo: "editar", persona: { ...anterior!, revision: actual.revision } };
      anunciar(esDeshacer ? m.cambioDeshecho : cambio.tipo === "crear" ? m.agregadaReal
        : cambio.tipo === "archivar" ? m.archivada : m.guardadaReal, esDeshacer ? null : reverso);
    } finally { operando.current = false; ocupar(false); }
  }
  const activas = personas.filter(p => !p.archivada_en).sort((a,b) =>
    Number(b.tipo === "hogar") - Number(a.tipo === "hogar") || a.nombre.localeCompare(b.nombre, "es-CL"));
  const visual = (p: PersonaACargo) => ({ ...p, color: colorPersona(p.color, p.tipo) });
  return (
    <section className={s.pila} aria-label={m.personas}>
      <div className={s.repartida}>
        <h2 className={s.seccionTitulo}>{m.personas}</h2>
        <Boton principal disabled={ocupado} onClick={() => abrir({tipo:"crear"})}>
          <Icono tipo="capturar" />{m.agregarPersona}
        </Boton>
      </div>
      <div className={s.rejilla}>
        {activas.map(p => (
          <div id={"persona-"+p.id} key={p.id} className={`${s.tarjeta} ${s.personaTarjeta}`}>
            <AvatarPersona nombre={p.nombre} tipo={p.tipo} color={colorPersona(p.color,p.tipo)} />
            <strong>{p.nombre}</strong>
            <span className={s.suave}>{m.tipos[p.tipo]}</span>
            {p.tipo === "hogar" ? <span className={s.suave}>{m.hogarAyuda}</span> : <>
              <Boton disabled={ocupado} onClick={() => abrir({tipo:"editar",persona:visual(p)})}>{m.editarPersona}</Boton>
              <Boton texto disabled={ocupado} onClick={() => abrir({tipo:"archivar",persona:p})}>{m.archivar}</Boton>
            </>}
          </div>
        ))}
      </div>
      {activas.length === 1 && <p className={s.suave}>{m.ayudaPersonas}</p>}
      <h2 className={s.seccionTitulo}>{m.ambitos}</h2>
      <div className={s.lista}>
        {[...ambitos].sort((a,b) => a.orden-b.orden).map(a => (
          <div key={a.id} className={s.filaLista}>
            <span className={s.ambitoIcono} style={{color: colores.test(a.color) ? `var(--${a.color})` : "var(--tinta-suave)"}}>
              <Icono tipo={Object.hasOwn(iconos,a.icono) ? iconos[a.icono as keyof typeof iconos] : "persona"}/>
            </span><span>{a.nombre}</span>
          </div>
        ))}
      </div>
      <Boton texto disabled={ocupado} onClick={() => void refrescar()}>{m.actualizarPersonas}</Boton>
      {hoja && <HojaInferior titulo={hoja.tipo === "crear" ? m.agregarPersona : hoja.tipo === "editar" ? m.editarPersona : m.confirmarArchivo} cerrar={() => abrir(null)}>
        {hoja.tipo === "archivar"
          ? <Archivo persona={hoja.persona} cancelar={() => abrir(null)} archivar={p => aplicar({tipo:"archivar",id:p.id,revision:p.revision})}/>
          : <FormularioPersona familiaId={familiaId} personas={personas.map(visual)}
              persona={hoja.tipo === "editar" ? hoja.persona : undefined}
              guardar={(persona,nueva) => aplicar({tipo:nueva ? "crear" : "editar",persona})}/>}
      </HojaInferior>}
      {aviso && <div role="status" className={s.aviso}>
        <span>{aviso}</span>
        {vuelta && <Boton texto disabled={ocupado} onClick={async () => {
          try { await aplicar(vuelta,true); } catch { anunciar(m.conflictoPersona); }
        }}>{m.deshacer}</Boton>}
      </div>}
    </section>
  );
}
