// Candidato 7.1, uso exclusivamente sintético. Puro: sin reloj del entorno, sin red, sin registros de texto.
// Recibe la salida INTERNA 7.1 y devuelve el contrato público §6.2 más ajustes {indice,campo,motivo}.
// Principio (D-09): solo corrige cuando la corrección es inequívoca y se apoya en el texto; en lo demás
// marca confianza baja. Nunca agrega acciones, nunca inventa entidades, fechas ni montos.
// Reutiliza el calendario civil y el léxico de 7.0 (importados, no modificados).
import { diaSemana, montos, norm, resolverTiempo, SEMANA, type ElementoPublico } from "./validar-interpretacion-v7";
import { intervaloExplicito } from "./revisar-interpretacion";
import type { SalidaInternaV71 } from "../contracts/interpretacion-interna-v7-1";

export type ContextoV71 = { fecha: string; texto: string; personas: readonly string[]; integrantes: readonly string[]; autor: string; ambitos: readonly string[] };
export type AjusteV71 = { indice: number; campo: string; motivo: string };

// Calendario derivado para la entrada del modelo: próximos 7 días; el día de semana de hoy apunta a +7.
export function calendarioContextoV71(fechaLocal: string) {
  const hoy = fechaLocal.slice(0, 10);
  const sumar = (n: number) => { // aritmética civil pura (regla 14: sin Date en el núcleo)
    let [a, m, d] = hoy.split("-").map(Number);
    const dm = (y: number, mm: number) => mm === 2 ? (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28) : [4, 6, 9, 11].includes(mm) ? 30 : 31;
    for (let k = 0; k < n; k++) { d++; if (d > dm(a, m)) { d = 1; m++; if (m > 12) { m = 1; a++; } } }
    return `${String(a).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };
  const proximos: Record<string, string> = {};
  for (let i = 1; i <= 7; i++) { const f = sumar(i); proximos[SEMANA[diaSemana(f)]] = f; }
  return { hoy: `${hoy} ${SEMANA[diaSemana(hoy)]}`, manana: sumar(1), pasado_manana: sumar(2), proximos };
}

const VAGAS = /\b(la otra semana|la proxima semana|la semana que viene|el finde|fin de semana|fin de mes|a fin de mes|principios de|pronto|despues|en estos dias|un dia de estos|cuando pueda|algun dia|esta semana|el mes que viene|el proximo mes)\b/;
const HOGAR = /\b(casa|hogar|depto|departamento|auto|camioneta|patio|jardin|terraza|living|cocina|bano|bodega|pieza|calefon|refrigerador|refri|lavadora|ventanas?|techo|plantas|reja|revision tecnica|permiso de circulacion|luz|agua|gas|internet|dividendo|arriendo|contribuciones|basura|gasfiter)\b/;
const REPETICION = /\b(todos los|todas las|cada|por medio|diariamente|a diario|semanalmente|mensualmente|anualmente|siempre)\b|\blos (lunes|martes|miercoles|jueves|viernes|sabados|domingos)\b/;
const NEGADA = /^(no|nunca|ya no|tampoco)\s+/;
const NO_AFIRMATIVA = /^(no (olvidar|olvides|te olvides|se me olvide|me puedo olvidar|dejar de|dejes de)|nunca olvidar)/;
const CLINICO = /\b(diagnostico|diagnosticad[oa]|resultado de examen|historia clinica|biopsia|tratamiento de)\b/;
const VACIAS = new Set(["para", "por", "con", "del", "los", "las", "una", "uno", "que", "de", "la", "el", "en", "y", "a", "al", "mas", "hay", "comprar", "hacer"]);

const menciona = (t: string, nombre: string) => { const n = norm(nombre).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); return n.length > 0 && new RegExp("(^|[^\\p{L}\\p{N}])" + n + "($|[^\\p{L}\\p{N}])", "u").test(norm(t)); };
const contiene = (t: string, f: string) => norm(f).length > 0 && norm(t).includes(norm(f));
const palabras = (s: string) => norm(s).split(" ").filter(w => w.length > 2 && !VACIAS.has(w));

export function validarV71(interna: SalidaInternaV71, c: ContextoV71): { publica: { elementos: ElementoPublico[] }; ajustes: AjusteV71[] } {
  const ajustes: AjusteV71[] = []; const T = c.texto;
  const descartes = (interna.descartes ?? []).filter(d => contiene(T, d.evidencia));
  const negaciones = descartes.filter(d => d.motivo === "negacion" && NEGADA.test(norm(d.evidencia)) && !NO_AFIRMATIVA.test(norm(d.evidencia)));
  let anterior: string | null = null;
  const unica = interna.elementos.length === 1;
  const publicos = interna.elementos.map((o, i) => {
    const e: ElementoPublico = { tipo: o.tipo, titulo: o.titulo, persona_a_cargo: o.persona_a_cargo, ambito: o.ambito, plazo_fecha: o.plazo_fecha, plazo_hora: o.plazo_hora, recurrencia: o.recurrencia ? { ...o.recurrencia, dias: [...o.recurrencia.dias] } : null, dirigida_a: o.dirigida_a, confianza: o.confianza };
    const marcar = (campo: string, motivo: string) => { ajustes.push({ indice: i, campo, motivo }); e.confianza = "baja"; };

    // 1. Notas: sin clasificación cuando no hay acción; títulos sin datos clínicos (D-10).
    if (e.tipo === "nota" && CLINICO.test(norm(e.titulo))) { e.titulo = "Revisar captura"; marcar("titulo", "dato_clinico"); }
    if (e.tipo === "nota" && (o.motivo_nota ?? "sin_accion") === "sin_accion")
      for (const k of ["persona_a_cargo", "ambito", "plazo_fecha", "plazo_hora", "recurrencia", "dirigida_a"] as const)
        if (e[k] !== null) { Object.assign(e, { [k]: null }); marcar(k, "nota_sin_clasificacion"); }

    // 2. Entidades (reglas V6, conservadoras).
    if (e.persona_a_cargo !== null) {
      if (!c.personas.includes(e.persona_a_cargo) || (e.persona_a_cargo !== "El hogar" && !menciona(T, e.persona_a_cargo))) { e.persona_a_cargo = null; marcar("persona_a_cargo", "sin_evidencia_nombre"); }
      else if (o.persona_base === "ninguna") marcar("persona_a_cargo", "base_contradictoria");
      else if (e.persona_a_cargo === "El hogar" && !HOGAR.test(norm(T))) marcar("persona_a_cargo", "hogar_sin_ancla");
      else if (e.persona_a_cargo !== "El hogar" && c.integrantes.includes(e.persona_a_cargo)) marcar("persona_a_cargo", "homonimo_integrante");
    }
    if (e.ambito !== null && !c.ambitos.includes(e.ambito)) { e.ambito = null; marcar("ambito", "fuera_catalogo"); }
    if (e.dirigida_a !== null && (!c.integrantes.includes(e.dirigida_a) || e.dirigida_a === c.autor || !menciona(T, e.dirigida_a))) {
      e.dirigida_a = null; marcar("dirigida_a", "sin_evidencia_destinatario"); if (e.tipo === "propuesta") e.tipo = "nota";
    }
    if (e.tipo === "propuesta" && e.dirigida_a === null) { e.tipo = "nota"; marcar("tipo", "propuesta_sin_destinatario"); }

    // 3. Tiempo: solo se recalcula ante una expresión literal inequívoca; nunca se rellena desde la nada.
    if (e.tipo !== "nota") {
      const fr = (o.tiempo ?? []).filter(f => { if (contiene(T, f)) return true; marcar("tiempo", "fragmento_no_literal"); return false; });
      if (fr.length === 0) {
        if (o.alcance === "ninguno") {
          if (e.plazo_fecha !== null) { e.plazo_fecha = null; marcar("plazo_fecha", "sin_evidencia_temporal"); }
          if (e.plazo_hora !== null) { e.plazo_hora = null; marcar("plazo_hora", "sin_evidencia_temporal"); }
        } else if (e.plazo_fecha !== null || e.plazo_hora !== null) marcar("plazo", "sin_fragmento");
      } else if (fr.some(f => VAGAS.test(" " + norm(f) + " "))) {
        if (e.plazo_fecha !== null || e.plazo_hora !== null) { e.plazo_fecha = null; e.plazo_hora = null; marcar("plazo", "expresion_vaga"); }
        else marcar("plazo", "expresion_vaga");
      } else {
        const t = resolverTiempo(c.fecha, fr, o.alcance === "hereda" || o.alcance === "propio" ? anterior : null);
        if (t.clase === "inequivoca" || t.clase === "heredada") {
          if (e.plazo_fecha !== t.fecha) { e.plazo_fecha = t.fecha; marcar("plazo_fecha", "recalculada"); }
          if (e.plazo_hora !== t.hora) { e.plazo_hora = t.hora; marcar("plazo_hora", "recalculada"); }
        } else if (t.clase === "convencion" || t.clase === "ambigua" || t.clase === "desconocida") marcar("plazo", t.clase);
      }
      anterior = e.plazo_fecha;
    }

    // 4. Recurrencia: unidad explícita (V6) para una única acción; nunca cada_n; nunca inventada.
    if (e.recurrencia && !REPETICION.test(" " + norm(T) + " ")) { e.recurrencia = null; marcar("recurrencia", "sin_evidencia"); }
    if (e.recurrencia && unica && (e.tipo === "responsabilidad" || e.tipo === "propuesta")) {
      const iv = intervaloExplicito(T);
      if (iv && (e.recurrencia.tipo !== iv.tipo || e.recurrencia.cada !== iv.cada)) { e.recurrencia = { ...iv, dias: iv.tipo === "semanal" ? e.recurrencia.dias : [] }; marcar("recurrencia", "unidad_explicita"); }
    }
    if (e.recurrencia?.tipo === "cada_n") { e.recurrencia = null; marcar("recurrencia", "cada_n_no_permitido"); }
    if (e.recurrencia && e.tipo === "tarea") { e.tipo = "responsabilidad"; marcar("tipo", "recurrente"); }

    // 5. Números del título respaldados por el texto (global; el alcance por acción queda marcado, no corregido).
    const enTexto = new Set([...norm(T).replace(/(\d)[.\s](?=\d{3}\b)/g, "$1").matchAll(/\d+/g)].map(m => Number(m[0])).concat(montos(T)));
    if ([...norm(e.titulo).replace(/(\d)[.\s](?=\d{3}\b)/g, "$1").matchAll(/\d+/g)].some(m => !enTexto.has(Number(m[0])))) marcar("titulo", "numero_no_respaldado");

    // 6. Acción que coincide con un fragmento negado: se marca (no se borra: podría ser la acción afirmada).
    if (e.tipo !== "nota" && negaciones.some(d => { const p = new Set(palabras(d.evidencia)); return palabras(e.titulo).filter(w => p.has(w)).length >= 1 && palabras(e.titulo).every(w => p.has(w)); })) marcar("tipo", "posible_accion_negada");
    return e;
  });
  // 7. Montos del texto que no aparecen en ningún título; títulos duplicados.
  const titulos = publicos.map(e => montos(e.titulo)).flat();
  if (montos(T).some(x => !titulos.includes(x)) && publicos[0].tipo !== "nota") { ajustes.push({ indice: 0, campo: "titulo", motivo: "monto_omitido" }); publicos[0].confianza = "baja"; }
  const vistos = new Set<string>();
  publicos.forEach((e, i) => { const k = norm(e.titulo); if (vistos.has(k)) { ajustes.push({ indice: i, campo: "titulo", motivo: "duplicado" }); e.confianza = "baja"; } vistos.add(k); });
  return { publica: { elementos: publicos }, ajustes };
}
