// Candidato V7, uso exclusivamente sintético. Puro: sin reloj del entorno, sin red, sin registros de texto.
// Recibe la salida INTERNA del modelo (con evidencia y tiempo literales) y devuelve el contrato público §6.2
// más ajustes {indice,campo,motivo}. Nunca agrega acciones, nunca inventa entidades, solo anula, recalcula
// desde evidencia literal o baja la confianza.

export type Recurrencia = { tipo: "diaria" | "semanal" | "mensual" | "anual" | "cada_n"; cada: number; dias: string[] };
export type ElementoPublico = {
  tipo: "tarea" | "responsabilidad" | "propuesta" | "nota"; titulo: string;
  persona_a_cargo: string | null; ambito: string | null; plazo_fecha: string | null; plazo_hora: string | null;
  recurrencia: Recurrencia | null; dirigida_a: string | null; confianza: "alta" | "baja";
};
export type ElementoInterno = ElementoPublico & { evidencia: string; tiempo: string[]; motivo_nota?: "sin_accion" | "destinatario_no_valido" | "no_representable" | null };
export type Descarte = { evidencia: string; motivo: "negacion" | "correccion" | "instruccion" };
export type SalidaInterna = { descartes: Descarte[]; elementos: ElementoInterno[] };
export type Contexto = { fecha: string; texto: string; personas: readonly string[]; integrantes: readonly string[]; autor: string; ambitos: readonly string[] };
export type Ajuste = { indice: number; campo: string; motivo: string };

// ---------------- Calendario civil ----------------
const bisiesto = (a: number) => a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0);
const diasMes = (a: number, m: number) => m === 2 ? (bisiesto(a) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31;
const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const iso = (a: number, m: number, d: number) => `${pad(a, 4)}-${pad(m)}-${pad(d)}`;
function leer(f: string) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(f); if (!m) return null; const [a, me, d] = m.slice(1).map(Number); return me >= 1 && me <= 12 && d >= 1 && d <= diasMes(a, me) ? { a, m: me, d } : null; }
function sumar(f: string, n: number): string { // aritmética por número de día juliano, sin Date
  const x = leer(f)!; const jd = aJuliano(x.a, x.m, x.d) + n; return deJuliano(jd);
}
function aJuliano(a: number, m: number, d: number) { const y = a + 4800 - Math.floor((14 - m) / 12), mm = m + 12 * Math.floor((14 - m) / 12) - 3; return d + Math.floor((153 * mm + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045; }
function deJuliano(j: number) { const a = j + 32044, b = Math.floor((4 * a + 3) / 146097), c = a - Math.floor(146097 * b / 4), d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor(1461 * d / 4), m = Math.floor((5 * e + 2) / 153); return iso(100 * b + d - 4800 + Math.floor(m / 10), m + 3 - 12 * Math.floor(m / 10), e - Math.floor((153 * m + 2) / 5) + 1); }
export const SEMANA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] as const;
export const diaSemana = (f: string) => { const x = leer(f)!; return (aJuliano(x.a, x.m, x.d) % 7 + 7) % 7; }; // 0 = lunes
export function calendarioContexto(fechaLocal: string) { // dato derivado opcional para la entrada del modelo
  const hoy = fechaLocal.slice(0, 10), proximos: Record<string, string> = {};
  for (let i = 1; i <= 6; i++) { const f = sumar(hoy, i); proximos[SEMANA[diaSemana(f)]] = f; }
  return { hoy: `${hoy} ${SEMANA[diaSemana(hoy)]}`, manana: sumar(hoy, 1), proximos };
}

// ---------------- Normalización y léxico ----------------
export const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[¿?¡!.,;:()"«»]/g, " ").replace(/\s+/g, " ").trim();
const NUM: Record<string, number> = { un: 1, uno: 1, una: 1, primero: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintiun: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, "treinta y uno": 31, "treinta y un": 31 };
const NUMRE = "(\\d{1,2}|treinta y uno|treinta y un|" + Object.keys(NUM).filter(k => !k.includes(" ")).sort((a, b) => b.length - a.length).join("|") + ")";
const num = (s: string) => /^\d+$/.test(s) ? Number(s) : NUM[s];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS_N = SEMANA.map(d => norm(d));

export type Clase = "inequivoca" | "convencion" | "heredada" | "ambigua" | "desconocida" | "sin_tiempo";
export type Tiempo = { fecha: string | null; hora: string | null; clase: Clase; parcial?: "solo_hora" | "solo_dia" };
const VAGAS = /\b(la otra semana|la proxima semana|la semana que viene|el finde|fin de semana|fin de mes|a fin de mes|principios de|pronto|despues|en estos dias|un dia de estos|cuando pueda|algun dia|esta semana|el mes que viene|el proximo mes)\b/;

// Resuelve los fragmentos de UNA acción. "anterior" = fecha ya resuelta de la acción previa de la misma captura.
export function resolverTiempo(fechaLocal: string, fragmentos: string[], anterior: string | null): Tiempo {
  const hoy = fechaLocal.slice(0, 10); if (!leer(hoy)) return { fecha: null, hora: null, clase: "desconocida" };
  if (fragmentos.length === 0) return { fecha: null, hora: null, clase: "sin_tiempo" };
  let fecha: string | null = null, hora: string | null = null, clase: Clase = "inequivoca", fechas = 0, soloDia: number | null = null, reconocido = 0, horaAmbigua = false;
  const peor = (c: Clase) => { const orden: Clase[] = ["inequivoca", "heredada", "convencion", "desconocida", "ambigua"]; if (orden.indexOf(c) > orden.indexOf(clase)) clase = c; };
  for (const bruto of fragmentos) {
    let s = " " + bruto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[¿?¡!.,;()"«»]/g, " ").replace(/\s+/g, " ").trim() + " ";
    if (VAGAS.test(s)) { peor("ambigua"); reconocido++; continue; }
    // Hora primero (para no confundir "en la mañana" con el día siguiente).
    let periodo: "am" | "pm" | null = null;
    if (/\b(de|en|por) la manana\b/.test(s)) { periodo = "am"; s = s.replace(/\b(de|en|por) la manana\b/, " "); }
    if (/\b(de|en|por) la (tarde|noche)\b/.test(s)) { periodo = "pm"; s = s.replace(/\b(de|en|por) la (tarde|noche)\b/, " "); }
    const horasNumericas = [...s.matchAll(/\b(\d{1,2}):(\d{1,2})(?:\s*(am|pm))?\b/g)];
    const verbal = new RegExp("\\ba (?:las|la) " + NUMRE + "(?: y (media|cuarto))?(?: (?:hrs|horas|am|pm))?\\b","g");
    const horasVerbales = [...s.replace(/\b\d{1,2}:\d{1,2}(?:\s*(?:am|pm))?\b/g," ").matchAll(verbal)];
    const mediodia = /\b(al|a) mediodia\b/.test(s);
    const guardarHora = (h: number, min: number) => {
      const nueva = pad(h)+":"+pad(min);
      if (hora && hora!==nueva) horaAmbigua=true;
      else hora=nueva;
    };
    if (horasNumericas.length+horasVerbales.length+Number(mediodia)>1 ||
        /\b\d{1,2}:/.test(s) && horasNumericas.length===0) {
      horaAmbigua=true; reconocido++;
    } else if (mediodia) {
      guardarHora(12,0); reconocido++; s=s.replace(/\b(al|a) mediodia\b/," ");
    } else if (horasNumericas.length===1 || horasVerbales.length===1) {
      const numerica=horasNumericas.length===1;
      const mh=numerica?horasNumericas[0]:horasVerbales[0];
      reconocido++;
      s=s.replace(mh[0]," ").replace(/\ba (?:las|la)\s+/g," ");
      let h=num(mh[1]);
      const min=numerica?Number(mh[2]):mh[2]==="media"?30:mh[2]==="cuarto"?15:0;
      if (numerica && mh[3]==="pm" || / pm\b/.test(mh[0])) periodo="pm";
      if (numerica && mh[3]==="am" || / am\b/.test(mh[0])) periodo="am";
      if (h===undefined || h>23 || min>59 || numerica&&mh[2].length!==2) { horaAmbigua=true; h=-1; }
      else if (periodo) {
        if(h<1||h>12){horaAmbigua=true;h=-1;}
        else if(periodo==="pm") h=h===12?12:h+12;
        else if(h===12) h=0;
      } else if(numerica || h>=13 || h>=8&&h<=12) { /* literal 24h o convención D-06 */ }
      else if(h>=1&&h<=6) h+=12;
      else {horaAmbigua=true;h=-1;}
      if(h>=0&&h<=23) guardarHora(h,min);
    } else if(periodo) reconocido++; // franja sin número
    // Fecha
    const marcarFecha = (f: string | null, c: Clase) => { fechas++; reconocido++; if (f === null) peor("ambigua"); else { if (fecha && fecha !== f) peor("ambigua"); fecha = f; peor(c); } };
    if (/\bpasado manana\b/.test(s)) marcarFecha(sumar(hoy, 2), "inequivoca");
    else if (/\bmanana\b/.test(s)) marcarFecha(sumar(hoy, 1), "inequivoca");
    else if (/\bhoy\b/.test(s)) marcarFecha(hoy, "inequivoca");
    else if (/\bal tiro\b/.test(s)) marcarFecha(hoy, "convencion");
    else if (/\bayer\b/.test(s)) marcarFecha(sumar(hoy, -1), "convencion");
    const en = new RegExp("\\b(?:en|dentro de) " + NUMRE + " dias?\\b").exec(s);
    if (en) marcarFecha(sumar(hoy, num(en[1])), "inequivoca");
    const ds = /\b(?:(este|el proximo|proximo|el|este proximo) )?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/.exec(s);
    const esRecurrencia = /\b(todos los|cada|los) (lunes|martes|miercoles|jueves|viernes|sabados?|domingos?)\b/.test(s);
    if (esRecurrencia) reconocido++; // la repetición no es plazo
    const mdm = new RegExp("\\b" + NUMRE + "(?: de (" + MESES.join("|") + "))?(?: (?:de|del) (\\d{4}))?\\b").exec(s.replace(/\ba (?:las|la) \S+/g, " "));
    const conPrefijoDia = new RegExp("\\b(?:el|del|al|antes del|hasta el|para el|vence el|vencimiento el)\\s+" + NUMRE + "\\b").test(s) || (mdm && mdm[2]);
    if (ds && !esRecurrencia) {
      const objetivo = DIAS_N.indexOf(ds[2]), hoyD = diaSemana(hoy), prefijo = ds[1] ?? "";
      const delta = (objetivo - hoyD + 7) % 7;
      if (delta === 0) {
        if (prefijo.includes("proximo")) marcarFecha(sumar(hoy, 7), "inequivoca");
        else if (anterior && anterior > hoy && sumar(hoy, 7) > anterior) marcarFecha(sumar(hoy, 7), "heredada"); // la secuencia ya avanzó a días posteriores
        else marcarFecha(null, "ambigua");
      }
      else marcarFecha(sumar(hoy, delta), prefijo.includes("proximo") ? "convencion" : "inequivoca");
    }
    if (mdm && conPrefijoDia && !en) {
      const d = num(mdm[1]); const mes = mdm[2] ? MESES.indexOf(mdm[2]) + 1 : 0; const anioExp = mdm[3] ? Number(mdm[3]) : 0;
      if (mes) {
        let a = anioExp || Number(hoy.slice(0, 4)); let f = leer(iso(a, mes, d)) ? iso(a, mes, d) : null;
        if (f && !anioExp && f < hoy) { a++; f = leer(iso(a, mes, d)) ? iso(a, mes, d) : null; }
        marcarFecha(f, "inequivoca");
      } else { soloDia = d; fechas++; reconocido++; }
    }
  }
  if (soloDia !== null && fecha === null) { // día del mes sin mes: hereda mes de la acción anterior o próxima ocurrencia
    const base = anterior ?? hoy, b = leer(base)!; let a = b.a, m = b.m;
    const cand = () => leer(iso(a, m, soloDia!)) ? iso(a, m, soloDia!) : null;
    let f = cand(); if (!f || f < base) { m++; if (m > 12) { m = 1; a++; } f = cand(); }
    fecha = f; if (!f) peor("ambigua"); else peor(anterior ? "heredada" : "inequivoca");
  }
  if (reconocido === 0) return { fecha: null, hora: null, clase: "desconocida" };
  if ((clase as Clase) === "ambigua") return { fecha: null, hora: null, clase };
  if (horaAmbigua) return fecha ? { fecha, hora: null, clase: "convencion" } : { fecha: null, hora: null, clase: "ambigua" }; // hora dudosa no anula una fecha clara
  if (fecha === null && hora !== null && fechas === 0) {
    if (anterior) return { fecha: anterior, hora, clase: clase === "inequivoca" ? "heredada" : clase, parcial: "solo_hora" };
    return { fecha: null, hora, clase: "ambigua", parcial: "solo_hora" }; // hora sin día: conservar hora, revisar
  }
  return { fecha, hora, clase };
}

// ---------------- Recurrencia desde evidencia ----------------
export function recurrenciaDesde(evidencia: string): Recurrencia | null | "ambigua" {
  const s = " " + norm(evidencia) + " ";
  if (/\bdia por medio\b/.test(s)) return { tipo: "diaria", cada: 2, dias: [] };
  if (/\bsemana por medio\b/.test(s)) { return { tipo: "semanal", cada: 2, dias: diasNombrados(s) }; }
  if (/\b(quincenal|quincenalmente)\b/.test(s)) return "ambigua"; // "cada quince días" se toma literal: diaria cada 15
  if (/\b(todos los dias|a diario|diariamente)\b/.test(s)) return { tipo: "diaria", cada: 1, dias: [] };
  if (/\b(una vez al mes|todos los meses|mensualmente)\b/.test(s)) return { tipo: "mensual", cada: 1, dias: [] };
  if (/\b(una vez al ano|todos los anos|anualmente)\b/.test(s)) return { tipo: "anual", cada: 1, dias: [] };
  const c = [...s.matchAll(new RegExp("\\bcada (?:" + NUMRE + " )?(dias?|semanas?|mes(?:es)?|anos?)\\b", "g"))];
  if (c.length > 1) return "ambigua";
  if (c.length === 1) {
    const n = c[0][1] ? num(c[0][1]) : 1, u = c[0][2];
    if (!n) return "ambigua";
    if (u.startsWith("dia")) return { tipo: "diaria", cada: n, dias: [] };
    if (u.startsWith("semana")) return { tipo: "semanal", cada: n, dias: diasNombrados(s) };
    if (u.startsWith("mes")) return { tipo: "mensual", cada: n, dias: [] };
    return { tipo: "anual", cada: n, dias: [] };
  }
  if (/\b(todos los|cada|los) (lunes|martes|miercoles|jueves|viernes|sabados?|domingos?)\b/.test(s)) return { tipo: "semanal", cada: 1, dias: diasNombrados(s) };
  return null;
}
function diasNombrados(s: string) { const r: string[] = []; for (let i = 0; i < 7; i++) if (new RegExp("\\b" + DIAS_N[i] + "s?\\b").test(s)) r.push(SEMANA[i]); return r; }

// ---------------- Montos ----------------
export function montos(texto: string): number[] {
  const s = " " + norm(texto).replace(/(\d)[.\s](?=\d{3}\b)/g, "$1") + " "; const r: number[] = [];
  for (const m of s.matchAll(/\$\s?(\d+)|\b(\d+) (?:pesos|clp)\b|\b(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|quince|veinte|treinta|cuarenta|cincuenta|cien) (lucas?|mil|palos?)\b/g)) {
    if (m[1] || m[2]) r.push(Number(m[1] ?? m[2]));
    else { const n = /^\d+$/.test(m[3]) ? Number(m[3]) : ({ ...NUM, cuarenta: 40, cincuenta: 50, cien: 100 } as Record<string, number>)[m[3]]; r.push(n * (m[4].startsWith("palo") ? 1_000_000 : 1000)); }
  }
  return r;
}

// ---------------- Validación por acción ----------------
const COMPARTIDO = /\b(ambas|ambos|las dos cosas|los dos|todo eso|todo lo anterior|las tres cosas)\b/;
const HOGAR = /\b(casa|hogar|depto|departamento|auto|patio|jardin|living|cocina|bano|bodega|calefon|refrigerador|refri|lavadora|ventanas?|techo|plantas|revision tecnica|permiso de circulacion|luz|agua|gas|internet|dividendo|arriendo|contribuciones|basura)\b/;
const SOLICITUD = (n: string) => new RegExp("(^|\\b)(que (el |la )?" + n + "\\b|(pedirle|pidele|decirle|dile|avisarle|avisale|recordarle|recuerdale) a (el |la )?" + n + "\\b|" + n + " (puedes|podrias|porfa))");
const NEGADA = /^(no|nunca|ya no|tampoco)\s+(hay que\s+|tengo que\s+|tienes que\s+)?(\w+)/;
const NO_AFIRMATIVA = /^(no (olvidar|olvides|te olvides|se me olvide|me puedo olvidar|dejar de|dejes de)|nunca olvidar)/;

function contiene(t: string, f: string) { return norm(t).includes(norm(f)); }
function posicion(t: string, f: string) { return norm(t).indexOf(norm(f)); }
function menciona(t: string, nombre: string) { const n = norm(nombre).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); return n.length > 0 && new RegExp("(^|[^\\p{L}\\p{N}])" + n + "($|[^\\p{L}\\p{N}])", "u").test(norm(t)); }
const mismaRec = (a: Recurrencia | null, b: Recurrencia | null) => JSON.stringify(a && { ...a, dias: [...a.dias].sort() }) === JSON.stringify(b && { ...b, dias: [...b.dias].sort() });

export function validarV7(interna: SalidaInterna, c: Contexto): { publica: { elementos: ElementoPublico[] }; ajustes: Ajuste[] } {
  const ajustes: Ajuste[] = []; const T = c.texto;
  // Un encabezado requiere un separador real, no los dos puntos de HH:MM.
  const encabezado = /^([^:\n]{1,60}):(?=\s)/.exec(T.trim())?.[1] ?? "";
  const comun = (f: string) => Boolean(encabezado && contiene(encabezado, f) &&
    (COMPARTIDO.test(norm(encabezado)) || /^(hoy|manana|pasado manana|(?:el|este|proximo) (?:lunes|martes|miercoles|jueves|viernes|sabado|domingo))\b/.test(norm(encabezado)))) ||
    COMPARTIDO.test(norm(f));
  const spans: [number, number][] = [];
  let anterior: string | null = null; const sinTiempo: number[] = [];
  const publicos = interna.elementos.map((o, i) => {
    const e: ElementoPublico = { tipo: o.tipo, titulo: o.titulo, persona_a_cargo: o.persona_a_cargo, ambito: o.ambito, plazo_fecha: o.plazo_fecha, plazo_hora: o.plazo_hora, recurrencia: o.recurrencia ? { ...o.recurrencia, dias: [...o.recurrencia.dias] } : null, dirigida_a: o.dirigida_a, confianza: o.confianza };
    const marcar = (campo: string, motivo: string) => { ajustes.push({ indice: i, campo, motivo }); e.confianza = "baja"; };
    // 1. Evidencia literal y segmentos sin superposición
    const ev = o.evidencia ?? ""; const literal = ev.trim().length > 0 && contiene(T, ev);
    if (!literal) marcar("evidencia", "no_literal");
    else { const p = posicion(T, ev), q = p + norm(ev).length; if (spans.some(([a, b]) => p < b && a < q)) marcar("evidencia", "superpuesta"); spans.push([p, q]); }
    const base = literal ? ev : "";
    // 2. Negación
    const n0 = norm(ev);
    const negada = literal && NEGADA.test(n0) && !NO_AFIRMATIVA.test(n0);
    const inyectada = literal && /^(ignora|omite|olvida|revela|muestra|cambia)\b.{0,80}\b(reglas|instrucciones|contexto|formato|sistema)\b/.test(n0);
    const descarteConfirmado = literal && (interna.descartes ?? []).some(d => norm(d.evidencia).length >= 4 && contiene(ev,d.evidencia) && contiene(T,d.evidencia) &&
      (d.motivo === "negacion" && NEGADA.test(norm(d.evidencia)) && !NO_AFIRMATIVA.test(norm(d.evidencia)) ||
       d.motivo === "instruccion" && /\b(reglas|instrucciones|contexto|formato|sistema)\b/.test(norm(d.evidencia))));
    if (e.tipo !== "nota" && (negada || inyectada || descarteConfirmado)) {
      e.tipo = "nota"; e.titulo = "Revisar captura"; e.persona_a_cargo = null; e.ambito = null;
      e.plazo_fecha = null; e.plazo_hora = null; e.recurrencia = null; e.dirigida_a = null;
      marcar("tipo", negada ? "accion_negada" : "incluye_descarte"); anterior = null; return e;
    }
    if (e.tipo === "nota" && /\b(diagnostico|diagnosticad[oa]|resultado de examen|historia clinica)\b/.test(norm(e.titulo))) {
      e.titulo = "Revisar captura"; marcar("titulo","dato_clinico");
    }
    // 3. Nota sin solicitud: sin clasificación
    if (e.tipo === "nota" && (o.motivo_nota ?? "sin_accion") === "sin_accion") for (const k of ["persona_a_cargo", "ambito", "plazo_fecha", "plazo_hora", "recurrencia", "dirigida_a"] as const) if (e[k] !== null) { Object.assign(e,{[k]:null}); marcar(k, "nota_sin_clasificacion"); }
    // 4. Entidades (reglas v6 + ancla por acción)
    if (e.persona_a_cargo !== null) {
      if (!c.personas.includes(e.persona_a_cargo) || (e.persona_a_cargo !== "El hogar" && !menciona(T, e.persona_a_cargo))) { e.persona_a_cargo = null; marcar("persona_a_cargo", "sin_evidencia_nombre"); }
      else if (e.persona_a_cargo === "El hogar" && (!HOGAR.test(norm(base)) || (/\b(agua|luz|gas)\b/.test(norm(base)) && !/\b(casa|hogar|depto|departamento|pagar|cuenta|boleta|cortar|reponer|arriendo)\b/.test(norm(base)) && c.personas.some(n=>n!=="El hogar" && menciona(base,n))))) marcar("persona_a_cargo", "hogar_sin_ancla");
      else if (e.persona_a_cargo !== "El hogar" && literal && !menciona(ev, e.persona_a_cargo) && !/\b(su|sus|le|les)\b/.test(norm(ev))) marcar("persona_a_cargo", "beneficiario_sin_ancla_en_accion");
    }
    if (e.persona_a_cargo !== null && e.persona_a_cargo !== "El hogar" && c.integrantes.includes(e.persona_a_cargo)) marcar("persona_a_cargo", "homonimo_integrante");
    if (literal && e.persona_a_cargo === null && e.tipo !== "nota" && e.confianza === "alta") { // nombre propio fuera de las listas
      const conocidos = new Set([...c.personas, ...c.integrantes, ...c.ambitos].flatMap(x => norm(x).split(" ")));
      const inicio = posicion(T, ev) === 0;
      const propios = [...ev.matchAll(/(?<![\p{L}])(\p{Lu}[\p{Ll}]+)/gu)].filter((m, k) => !(k === 0 && m.index === 0 && inicio) && !conocidos.has(norm(m[1])));
      if (propios.length) marcar("persona_a_cargo", "nombre_fuera_de_lista");
    }
    if (e.ambito !== null && !c.ambitos.includes(e.ambito)) { e.ambito = null; marcar("ambito", "fuera_catalogo"); }
    if (e.dirigida_a !== null) {
      const ok = c.integrantes.includes(e.dirigida_a) && e.dirigida_a !== c.autor && menciona(T, e.dirigida_a);
      if (!ok) { e.dirigida_a = null; marcar("dirigida_a", "sin_evidencia_destinatario"); if (e.tipo === "propuesta") e.tipo = "nota"; }
      else if (!SOLICITUD(norm(e.dirigida_a)).test(norm(T))) marcar("dirigida_a", "sin_forma_de_peticion");
    }
    if (e.tipo === "propuesta" && e.dirigida_a === null) { e.tipo = "nota"; marcar("tipo", "propuesta_sin_destinatario"); }
    // 5. Tiempo por acción
    const fr = (o.tiempo ?? []).filter(f => {
      if (!contiene(T, f)) { marcar("tiempo", "fragmento_no_literal"); return false; }
      if (!literal || (!contiene(ev, f) && !comun(f))) { marcar("tiempo", "fuera_de_alcance"); return false; }
      return true;
    });
    if (e.tipo !== "nota") {
      const t = resolverTiempo(c.fecha, fr, anterior);
      if (t.clase === "sin_tiempo") {
        if (e.plazo_fecha !== null) { e.plazo_fecha = null; marcar("plazo_fecha", "sin_evidencia_temporal"); }
        if (e.plazo_hora !== null) { e.plazo_hora = null; marcar("plazo_hora", "sin_evidencia_temporal"); }
        sinTiempo.push(i); // si otra acción de la captura tiene plazo, el alcance es incierto (se marca al final)
      } else if (t.clase === "ambigua") {
        if (t.parcial === "solo_hora" && t.hora) { if (e.plazo_hora !== t.hora) { e.plazo_hora = t.hora; marcar("plazo_hora", "recalculada"); } if (e.plazo_fecha !== null) { e.plazo_fecha = null; marcar("plazo_fecha", "hora_sin_fecha"); } else marcar("plazo_fecha", "hora_sin_fecha"); }
        else { if (e.plazo_fecha !== null) { e.plazo_fecha = null; } if (e.plazo_hora !== null) e.plazo_hora = null; marcar("plazo", "expresion_ambigua"); }
      } else if (t.clase === "desconocida") marcar("plazo", "no_verificable");
      else {
        if (e.plazo_fecha !== t.fecha) { e.plazo_fecha = t.fecha; marcar("plazo_fecha", "recalculada"); }
        if (e.plazo_hora !== t.hora) { e.plazo_hora = t.hora; marcar("plazo_hora", "recalculada"); }
        if (t.clase === "convencion") marcar("plazo", "convencion");
      }
      anterior = e.plazo_fecha; // solo la acción inmediatamente anterior
    }
    // 6. Recurrencia por acción (ya no exige una sola acción)
    if (literal && e.tipo !== "nota") {
      const r = recurrenciaDesde(ev);
      if (r === "ambigua") { if (e.recurrencia) marcar("recurrencia", "ambigua"); }
      else if (r && !mismaRec(r, e.recurrencia)) { e.recurrencia = r; marcar("recurrencia", "recalculada"); }
      else if (!r && e.recurrencia) { e.recurrencia = null; marcar("recurrencia", "sin_evidencia"); }
      if (e.recurrencia && e.tipo === "tarea") { e.tipo = "responsabilidad"; marcar("tipo", "recurrente"); }
      // Una responsabilidad puede ser sostenida sin recurrencia explícita (§5.1).
    }
    if (e.recurrencia?.tipo === "cada_n") { e.recurrencia = null; marcar("recurrencia", "cada_n_no_permitido"); }
    // 7. Montos y números del título
    if (literal) {
      const mt = montos(ev), mtit = montos(e.titulo);
      if (mt.some(x => !mtit.includes(x))) marcar("titulo", "monto_omitido");
      if (mtit.some(x => !mt.includes(x))) marcar("titulo", "monto_ajeno_a_accion");
      const enTexto = new Set([...norm(ev).matchAll(/\d+/g)].map(m => Number(m[0].replace(/\D/g, ""))).concat(montos(ev)));
      if ([...norm(e.titulo).replace(/(\d)[.\s](?=\d{3}\b)/g, "$1").matchAll(/\d+/g)].some(m => !enTexto.has(Number(m[0])))) marcar("titulo", "numero_no_respaldado");
    }
    return e;
  });
  if (publicos.some(e => e.plazo_fecha !== null)) for (const i of sinTiempo) { ajustes.push({ indice: i, campo: "plazo_fecha", motivo: "alcance_incierto" }); publicos[i].confianza = "baja"; }
  // 8. Duplicados y omisiones posibles
  const vistos = new Set<string>(); publicos.forEach((e, i) => { const k = norm(interna.elementos[i].evidencia ?? ""); if (k && vistos.has(k)) { ajustes.push({ indice: i, campo: "evidencia", motivo: "duplicada" }); e.confianza = "baja"; } vistos.add(k); });
  const descartesValidos = (interna.descartes ?? []).filter(d => contiene(T,d.evidencia) &&
    (d.motivo === "negacion" ? NEGADA.test(norm(d.evidencia)) && !NO_AFIRMATIVA.test(norm(d.evidencia)) :
     d.motivo === "correccion" ? /\b(no|perdon|mejor|digo|corrijo)\b/.test(norm(T)) :
     /\b(reglas|instrucciones|contexto|formato|sistema)\b/.test(norm(d.evidencia))));
  const cubierto = new Set(norm([...interna.elementos.flatMap(x => [x.evidencia ?? "", ...(x.tiempo ?? [])]).filter(f=>f && contiene(T,f)), ...descartesValidos.map(d => d.evidencia)].join(" ")).split(" "));
  const RELLENO = /^(mmm+|eh+|ah+|chuta|ojo|porfa|pucha|oye|bueno|ya|igual|tambien|despues|luego|ademas|mejor|hacer|tengo|tienes|tiene|hay|para|pero|todo|todos|esto|eso|cosa|cosas|perdon|digo)$/;
  const faltan = norm(T).split(" ").filter(w => w.length >= 4 && !RELLENO.test(w) && !cubierto.has(w));
  if (faltan.length > 0) publicos.forEach((e, i) => { ajustes.push({ indice: i, campo: "cobertura", motivo: "posible_omision" }); e.confianza = "baja"; });
  return { publica: { elementos: publicos }, ajustes };
}
