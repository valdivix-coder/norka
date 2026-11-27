// M6 · ablación de validadores sobre salidas brutas REALES ya obtenidas (fixtures de replay). Sin proveedor.
// Mismo contrato interno (7.1) para 7.1, 7.2 y 7.3: se aplica cada validador a la misma bruta interna.
import { readFileSync, readdirSync } from "node:fs";
import { validarV71 } from "../src/core/usecases/validar-interpretacion-v7-1";
import { validarV72 } from "../src/core/usecases/validar-interpretacion-v7-2";
import { validarV73 } from "../src/core/usecases/validar-interpretacion-v7-3";
import { contratoInterpretacion, type Interpretacion } from "../src/core/contracts/interpretacion";
import type { SalidaInternaV71 } from "../src/core/contracts/interpretacion-interna-v7-1";
import { capa } from "./comparacion-v7-2";

type Brazo = { estado: string; brutaInterna: SalidaInternaV71 | null; bruta: Interpretacion | null; resultado: Interpretacion | null };
export type Fixture = { fuente: { run: string; corpus: string; sha256Json: string }; contexto: { fecha: string; personas_a_cargo: string[]; integrantes: string[]; autor: string; ambitos: string[] }; casos: { id: number; texto: string; esperado: Interpretacion; brazos: Record<string, Brazo> }[] };
export function cargarFixtures(): Fixture[] { return readdirSync("src/laboratorio/fixtures").filter(f => f.startsWith("replay-")).sort().map(f => JSON.parse(readFileSync("src/laboratorio/fixtures/" + f, "utf8"))); }

const VALIDADORES = { "7.1": validarV71, "7.2": validarV72, "7.3": validarV73 } as const;
export function ablacionValidadores(fixtures = cargarFixtures()) {
  const filas: { run: string; corpus: string; id: number; brazo: string; bruta: [boolean, boolean]; [k: string]: unknown }[] = [];
  for (const fx of fixtures) for (const c of fx.casos) for (const [v, b] of Object.entries(c.brazos)) {
    if (v === "6.0" || b.estado !== "valida" || !b.brutaInterna || !b.bruta) continue;
    const ctx = { fecha: fx.contexto.fecha, texto: c.texto, personas: fx.contexto.personas_a_cargo, integrantes: fx.contexto.integrantes, ambitos: fx.contexto.ambitos, autor: fx.contexto.autor };
    const mb = capa(b.bruta, c.esperado);
    const fila: (typeof filas)[number] = { run: fx.fuente.run, corpus: fx.fuente.corpus, id: c.id, brazo: v, bruta: [mb.principal, mb.estricta] };
    for (const [nombre, validar] of Object.entries(VALIDADORES)) {
      const r = validar(structuredClone(b.brutaInterna), ctx);
      const pub = contratoInterpretacion.parse(r.publica); const m = capa(pub, c.esperado);
      fila["v" + nombre] = { principal: m.principal, estricta: m.estricta, ajustes: r.ajustes.map(a => a.campo + ":" + a.motivo), revisar: pub.elementos.filter(e => e.confianza === "baja" || !e.persona_a_cargo || !e.ambito).length, elementos: pub.elementos.length };
    }
    // Verificación de fidelidad: el validador de la versión que generó la salida reproduce el resultado guardado.
    fila.reproduce = v in VALIDADORES ? JSON.stringify(contratoInterpretacion.parse(VALIDADORES[v as keyof typeof VALIDADORES](structuredClone(b.brutaInterna), ctx).publica)) === JSON.stringify(b.resultado) : null;
    filas.push(fila);
  }
  const resumen: Record<string, unknown> = { casos: filas.length, brutaPrincipal: filas.filter(f => f.bruta[0]).length, brutaEstricta: filas.filter(f => f.bruta[1]).length };
  for (const n of Object.keys(VALIDADORES)) {
    const k = "v" + n; type R = { principal: boolean; estricta: boolean; revisar: number; elementos: number };
    resumen[k] = { principal: filas.filter(f => (f[k] as R).principal).length, estricta: filas.filter(f => (f[k] as R).estricta).length,
      corregidos: filas.filter(f => (!f.bruta[0] && (f[k] as R).principal) || (!f.bruta[1] && (f[k] as R).estricta)).map(f => f.run + "#" + f.id),
      empeorados: filas.filter(f => (f.bruta[0] && !(f[k] as R).principal) || (f.bruta[1] && !(f[k] as R).estricta)).map(f => f.run + "#" + f.id),
      revisar: filas.reduce((a, f) => a + (f[k] as R).revisar, 0), elementos: filas.reduce((a, f) => a + (f[k] as R).elementos, 0) };
  }
  resumen.reproduceGuardado = filas.filter(f => f.reproduce === true).length + "/" + filas.filter(f => f.reproduce !== null).length;
  return { resumen, filas };
}
