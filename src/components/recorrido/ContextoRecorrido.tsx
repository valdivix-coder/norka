"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { PersonaACargo } from "@/core/domain/familia";
import { guardarPersona } from "@/core/usecases/personas-a-cargo";
import {
  crearAlmacenMuestra,
  hogarMuestra,
  personasEjemplo,
} from "@/data/familia-muestra";
import { interfaz as m } from "@/mensajes/es-CL";
import { Boton } from "@/components/interfaz/Elementos";
import s from "@/components/interfaz/interfaz.module.css";

export type EstadoPantalla = keyof typeof m.estados;
export type HojaRecorrido =
  | { tipo: "capturar" | "invitar" | "familia" }
  | { tipo: "persona"; persona?: PersonaACargo }
  | { tipo: "archivar"; persona: PersonaACargo };
export type PerfilMuestra = {
  nombre: string;
  rol: string;
  etiqueta: string;
  participacion: string;
  telefono: string;
  internacional: boolean;
};
type Contexto = {
  perfil: PerfilMuestra;
  guardarPerfil: (perfil: PerfilMuestra) => void;
  personas: PersonaACargo[];
  guardar: (persona: PersonaACargo, nueva: boolean) => Promise<void>;
  archivar: (persona: PersonaACargo) => Promise<void>;
  ejemplos: () => Promise<void>;
  estado: EstadoPantalla;
  cambiarEstado: (estado: EstadoPantalla) => void;
  hoja: HojaRecorrido | null;
  abrir: (hoja: HojaRecorrido | null) => void;
  familia: string;
  nombrar: (nombre: string) => void;
  tema: "oscuro" | "claro";
  cambiarTema: (tema: "oscuro" | "claro") => void;
};
const contexto = createContext<Contexto | null>(null);
export function useRecorrido() {
  const valor = useContext(contexto);
  if (!valor) throw new Error("RECORRIDO_REQUERIDO");
  return valor;
}
export function ContextoRecorrido({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [base] = useState(crearAlmacenMuestra);
  const [personas, actualizar] = useState<PersonaACargo[]>([hogarMuestra]);
  const [estado, cambiarEstado] = useState<EstadoPantalla>("vacio");
  const [hoja, abrir] = useState<HojaRecorrido | null>(null);
  const [familia, nombrar] = useState<string>(m.familiaMuestra);
  const [perfil, ponerPerfil] = useState<PerfilMuestra>({
    nombre: m.nombrePerfil,
    rol: m.roles[5],
    etiqueta: "",
    participacion: m.corresponsable,
    telefono: "",
    internacional: false,
  });
  const [tema, ponerTema] = useState<"oscuro" | "claro">("oscuro");
  const [aviso, avisar] = useState("");
  const [puedeDeshacer, mostrarDeshacer] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const deshacer = useRef<(() => Promise<void>) | null>(null);
  const [ocupado, ocupar] = useState(false);
  useEffect(() => () => clearTimeout(temporizador.current), []);
  function anunciar(
    texto: string,
    vuelta: (() => Promise<void>) | null = null,
  ) {
    clearTimeout(temporizador.current);
    deshacer.current = vuelta;
    mostrarDeshacer(Boolean(vuelta));
    avisar(texto);
    temporizador.current = setTimeout(() => {
      avisar("");
      deshacer.current = null;
    }, 5000);
  }
  async function refrescar() {
    actualizar(await base.almacen.listar("personas_a_cargo"));
  }
  async function guardar(persona: PersonaACargo, nueva: boolean) {
    await base.preparado;
    const anterior = nueva
      ? null
      : await base.almacen.obtener("personas_a_cargo", persona.id);
    const guardada = await guardarPersona(base.almacen, persona, nueva);
    await refrescar();
    abrir(null);
    cambiarEstado("datos");
    anunciar(nueva ? m.agregada : m.guardada, async () => {
      const actual = await base.almacen.obtener(
        "personas_a_cargo",
        guardada.id,
      );
      await guardarPersona(
        base.almacen,
        anterior
          ? { ...anterior, revision: actual.revision }
          : { ...actual, archivada_en: new Date().toISOString() },
        false,
      );
      await refrescar();
    });
  }
  async function archivar(persona: PersonaACargo) {
    await guardarPersona(
      base.almacen,
      { ...persona, archivada_en: new Date().toISOString() },
      false,
    );
    await refrescar();
    abrir(null);
    router.push("/muestra/pantallas/familia");
    anunciar(m.archivada, async () => {
      const actual = await base.almacen.obtener("personas_a_cargo", persona.id);
      await guardarPersona(
        base.almacen,
        { ...actual, archivada_en: null },
        false,
      );
      await refrescar();
    });
  }
  async function ejemplos() {
    await base.preparado;
    for (const persona of personasEjemplo) {
      const actual = (await base.almacen.listar("personas_a_cargo")).find(
        (p) => p.id === persona.id,
      );
      if (!actual) await guardarPersona(base.almacen, persona, true);
      else if (actual.archivada_en)
        await guardarPersona(
          base.almacen,
          { ...actual, archivada_en: null },
          false,
        );
    }
    await refrescar();
    cambiarEstado("datos");
    anunciar(m.avisoEjemplos);
  }
  function cambiarTema(valor: "oscuro" | "claro") {
    document.documentElement.dataset.tema = valor;
    ponerTema(valor);
  }
  return (
    <contexto.Provider
      value={{
        perfil,
        guardarPerfil: (valor) => {
          ponerPerfil(valor);
          anunciar(m.guardada);
        },
        personas,
        guardar,
        archivar,
        ejemplos,
        estado,
        cambiarEstado,
        hoja,
        abrir,
        familia,
        nombrar,
        tema,
        cambiarTema,
      }}
    >
      {children}
      {aviso && (
        <div role="status" className={s.aviso}>
          <span>{aviso}</span>
          {puedeDeshacer && (
            <Boton
              texto
              disabled={ocupado}
              onClick={async () => {
                const accion = deshacer.current;
                if (!accion || ocupado) return;
                ocupar(true);
                clearTimeout(temporizador.current);
                try {
                  await accion();
                  deshacer.current = null;
                  avisar("");
                } catch {
                  avisar(m.errorGuardar);
                } finally {
                  ocupar(false);
                }
              }}
            >
              {m.deshacer}
            </Boton>
          )}
        </div>
      )}
    </contexto.Provider>
  );
}
