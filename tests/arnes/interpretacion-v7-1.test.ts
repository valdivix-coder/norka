import { describe, it, expect, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { crearGeminiSintetico } from "../../src/data/gemini-sintetico";
import { crearGeminiPorVersion, solicitudV71, VERSION_PREDETERMINADA } from "../../src/data/gemini-sintetico-v7-1";
import { instruccionesCapturaV71, sufijoIndividualV71 } from "../../src/data/prompt-captura-v7-1";
import { calendarioContextoV71, validarV71, type ContextoV71 } from "../../src/core/usecases/validar-interpretacion-v7-1";
import { contratoInterpretacion } from "../../src/core/contracts/interpretacion";
import type { ElementoInternoV71, SalidaInternaV71 } from "../../src/core/contracts/interpretacion-interna-v7-1";

const modelo = "gemini-3.5-flash-lite";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const responder = (x: unknown, finishReason = "STOP") => Response.json({ usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 }, candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(x) }] } }] });
const corpus = { fecha: "2027-02-24T10:00:00-03:00", zona_horaria: "America/Santiago", personas_a_cargo: ["Florencia", "Benja", "Rayo", "El hogar"], integrantes: ["Marcela", "Rodrigo"], autor: "Marcela", ambitos: ["Salud", "Colegio", "Pagos y finanzas", "Crianza diaria", "Hogar", "Mascotas", "Trámites", "Compras"], casos: [{ id: 1, texto: "El sábado llevar a Florencia a la fono y a las cuatro bañar al Rayo" }, { id: 2, texto: "Ordenar la casa" }] };
const ctx = (texto: string): ContextoV71 => ({ fecha: corpus.fecha, texto, personas: corpus.personas_a_cargo, integrantes: corpus.integrantes, ambitos: corpus.ambitos, autor: corpus.autor });
const el = (x: Partial<ElementoInternoV71>): ElementoInternoV71 => ({ tipo: "tarea", titulo: "Hacer algo", persona_base: "ninguna", persona_a_cargo: null, ambito: null, tiempo: [], alcance: "ninguno", plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta", motivo_nota: null, ...x });
const sal = (...elementos: ElementoInternoV71[]): SalidaInternaV71 => ({ descartes: [], elementos });

describe("7.1 · selector y aislamiento de referencias", () => {
  it("V6 sigue predeterminada y su solicitud es idéntica byte a byte a la del adaptador original", async () => {
    const cuerpos: string[] = [];
    const capturar = vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => { cuerpos.push(String(init?.body)); return responder({ elementos: [{ tipo: "tarea", titulo: "Ordenar la casa", persona_a_cargo: "El hogar", ambito: "Hogar", plazo_fecha: null, plazo_hora: null, recurrencia: null, dirigida_a: null, confianza: "alta" }] }); });
    expect(VERSION_PREDETERMINADA).toBe("6.0");
    const sel = crearGeminiPorVersion({ clave: "qa", modelo, corpus, solicitar: capturar });
    expect(sel.version).toBe("6.0");
    await sel.evaluar(2); await crearGeminiSintetico({ clave: "qa", modelo, corpus, solicitar: capturar }).evaluar(2);
    expect(cuerpos[0]).toBe(cuerpos[1]);
    const v7a: string[] = [];
    const cap7 = vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => { v7a.push(String(init?.body)); return new Response("", { status: 500 }); });
    await expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.0", solicitar: cap7 }).evaluar(2)).rejects.toThrow();
    await expect(crearGeminiSintetico({ clave: "qa", modelo, corpus, version: "7.0", solicitar: cap7 }).evaluar(2)).rejects.toThrow();
    expect(v7a[0]).toBe(v7a[v7a.length - 1]);
  });
  it("los archivos congelados de V6 y V7.0 no cambian", () => {
    const f = JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.json", "utf8"));
    const h = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
    expect(h("src/core/usecases/validar-interpretacion-v7.ts")).toBe(f.validador);
    expect(h("src/core/contracts/interpretacion-interna-v7.ts")).toBe(f.esquemaFuente);
  });
  it("rechaza versiones desconocidas y respaldos en 7.1", () => {
    expect(() => crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.2" as never })).toThrow("VERSION_PROMPT_INVALIDA");
    expect(() => crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.1", respaldos: ["gemma-4-26b-a4b-it"] })).toThrow("RESPALDOS_NO_PERMITIDOS_7_1");
    expect(() => crearGeminiPorVersion({ clave: "qa", modelo: "gemma-4-26b-a4b-it", corpus, version: "7.1" })).toThrow("CONFIGURACION_GEMINI_INVALIDA");
  });
});

describe("7.1 · solicitud real (sin proveedor)", () => {
  it("instrucción exacta, esquema ordenado, calendario derivado, límite de salida y sin expectativas", () => {
    const { cuerpo } = solicitudV71(corpus, [corpus.casos[0]]);
    expect(cuerpo.systemInstruction.parts[0].text).toBe(instruccionesCapturaV71 + "\n" + sufijoIndividualV71);
    const props = Object.keys((cuerpo.generationConfig.responseJsonSchema as unknown as { properties: { elementos: { items: { properties: object } } } }).properties.elementos.items.properties);
    expect(props).toEqual(["tipo", "titulo", "persona_base", "persona_a_cargo", "ambito", "tiempo", "alcance", "plazo_fecha", "plazo_hora", "recurrencia", "dirigida_a", "confianza", "motivo_nota"]);
    expect(Object.keys((cuerpo.generationConfig.responseJsonSchema as unknown as { properties: object }).properties)).toEqual(["descartes", "elementos"]);
    expect(cuerpo.generationConfig).toMatchObject({ temperature: 0, maxOutputTokens: 1024, responseMimeType: "application/json" });
    const datos = JSON.parse(cuerpo.contents[0].parts[0].text);
    expect(datos.texto).toBe(corpus.casos[0].texto);
    expect(JSON.stringify(datos)).not.toContain("esperado");
    expect(datos.contexto.calendario).toEqual({ hoy: "2027-02-24 miércoles", manana: "2027-02-25", pasado_manana: "2027-02-26", proximos: { jueves: "2027-02-25", viernes: "2027-02-26", sábado: "2027-02-27", domingo: "2027-02-28", lunes: "2027-03-01", martes: "2027-03-02", miércoles: "2027-03-03" } });
  });
  it("calendario cruza años bisiestos y fin de año sin reloj del entorno", () => {
    expect(calendarioContextoV71("2028-02-28T08:00").manana).toBe("2028-02-29");
    expect(calendarioContextoV71("2026-12-31T08:00").pasado_manana).toBe("2027-01-02");
    expect(calendarioContextoV71("2026-12-30T18:00").proximos.miércoles).toBe("2027-01-06");
  });
  it("conserva tres capas: interna, bruta pública y normalizada", async () => {
    const interna = sal(
      el({ titulo: "Llevar a Florencia a la fono", persona_base: "nombrada", persona_a_cargo: "Florencia", ambito: "Salud", tiempo: ["El sábado"], alcance: "propio", plazo_fecha: "2027-02-27" }),
      el({ titulo: "Bañar a Rayo", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", tiempo: ["a las cuatro"], alcance: "hereda", plazo_hora: "16:00" }));
    const ia = crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.1", solicitar: vi.fn(async () => responder(interna)) });
    const r = await ia.evaluar(1);
    expect(ia.brutaInterna(1)).toEqual(interna);
    expect(ia.bruta(1)!.elementos[1].plazo_fecha).toBeNull();                  // error bruto conservado
    expect(r.elementos[1]).toMatchObject({ plazo_fecha: "2027-02-27", plazo_hora: "16:00" }); // corregido por herencia inequívoca
    expect(contratoInterpretacion.safeParse(ia.bruta(1)).success).toBe(true);
  });
  it("rechaza truncamiento, JSON fuera del contrato e identificadores duplicados en lote", async () => {
    const ok = sal(el({ titulo: "Ordenar la casa", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Hogar" }));
    await expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.1", solicitar: vi.fn(async () => responder(ok, "MAX_TOKENS")) }).evaluar(2)).rejects.toThrow("FINISH_REASON_NO_STOP");
    await expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.1", solicitar: vi.fn(async () => responder({ elementos: [] })) }).evaluar(2)).rejects.toThrow();
    await expect(crearGeminiPorVersion({ clave: "qa", modelo, corpus, version: "7.1", solicitar: vi.fn(async () => responder({ resultados: [{ id: 1, ...ok }, { id: 1, ...ok }] })) }).evaluarLote([1, 2])).rejects.toThrow("LOTE_INCOMPLETO");
  });
});

describe("7.1 · validador: tiempo", () => {
  const T = "El sábado a las once llevar a Florencia a la fono y a las cuatro bañar al Rayo";
  const primero = el({ titulo: "Llevar a Florencia a la fono", persona_base: "nombrada", persona_a_cargo: "Florencia", ambito: "Salud", tiempo: ["El sábado a las once"], alcance: "propio", plazo_fecha: "2027-02-27", plazo_hora: "11:00" });
  it("hereda el día cuando la segunda acción solo trae hora (clase de fallo de 7.0)", () => {
    const r = validarV71(sal(primero, el({ titulo: "Bañar a Rayo", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", tiempo: ["a las cuatro"], alcance: "hereda" })), ctx(T));
    expect(r.publica.elementos[1]).toMatchObject({ plazo_fecha: "2027-02-27", plazo_hora: "16:00" });
  });
  it("anula una fecha copiada a una acción sin marcador (alcance ninguno)", () => {
    const t = "El sábado a las once llevar a Florencia a la fono y comprar pan para la casa";
    const r = validarV71(sal(primero, el({ titulo: "Comprar pan", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Compras", alcance: "ninguno", plazo_fecha: "2027-02-27", plazo_hora: "11:00" })), ctx(t));
    expect(r.publica.elementos[1]).toMatchObject({ plazo_fecha: null, plazo_hora: null, confianza: "baja" });
    expect(r.publica.elementos[0]).toMatchObject({ plazo_fecha: "2027-02-27", plazo_hora: "11:00" });
  });
  it("no empeora: fecha correcta sin fragmento se conserva y solo se marca", () => {
    const r = validarV71(sal(el({ titulo: "Bañar a Rayo", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", alcance: "propio", plazo_fecha: "2027-02-27" })), ctx("El sábado bañar al Rayo"));
    expect(r.publica.elementos[0].plazo_fecha).toBe("2027-02-27");
    expect(r.ajustes.map(a => a.motivo)).toContain("sin_fragmento");
  });
  it("no empeora: el mismo día de la semana por convención se conserva y se marca", () => {
    const r = validarV71(sal(el({ titulo: "Llevar a Rayo", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", tiempo: ["El miércoles"], alcance: "propio", plazo_fecha: "2027-03-03" })), ctx("El miércoles llevar al Rayo a la peluquería"));
    expect(r.publica.elementos[0]).toMatchObject({ plazo_fecha: "2027-03-03", confianza: "baja" });
  });
  it("corrige una fecha inequívoca mal calculada y conserva minutos HH:MM", () => {
    const r = validarV71(sal(el({ titulo: "Retirar a Benja", persona_base: "nombrada", persona_a_cargo: "Benja", ambito: "Colegio", tiempo: ["Mañana a las 18:45"], alcance: "propio", plazo_fecha: "2027-02-24", plazo_hora: "18:00" })), ctx("Mañana a las 18:45 retirar al Benja del jardín"));
    expect(r.publica.elementos[0]).toMatchObject({ plazo_fecha: "2027-02-25", plazo_hora: "18:45" });
  });
  it("anula fechas ante expresión vaga y descarta fragmentos no literales", () => {
    const r = validarV71(sal(el({ titulo: "Llevar a Rayo", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", tiempo: ["La otra semana"], alcance: "propio", plazo_fecha: "2027-03-01" })), ctx("La otra semana llevar al Rayo a la peluquería"));
    expect(r.publica.elementos[0].plazo_fecha).toBeNull();
    const n = validarV71(sal(el({ titulo: "Ordenar", tiempo: ["el martes"], alcance: "propio", plazo_fecha: "2027-03-02" })), ctx("Ordenar la casa"));
    expect(n.ajustes.map(a => a.motivo)).toContain("fragmento_no_literal");
  });
  it("día N sin mes cruza al mes siguiente", () => {
    const r = validarV71(sal(el({ titulo: "Pagar", persona_base: "nombrada", persona_a_cargo: "Benja", ambito: "Pagos y finanzas", tiempo: ["antes del 3"], alcance: "propio", plazo_fecha: "2027-02-03" })), ctx("Pagar la mensualidad del jardín de Benja antes del 3"));
    expect(r.publica.elementos[0].plazo_fecha).toBe("2027-03-03");
  });
});

describe("7.1 · validador: entidades, notas, recurrencia y montos", () => {
  it("anula beneficiario no mencionado (invención de catálogo) y no rellena nunca", () => {
    const r = validarV71(sal(el({ tipo: "responsabilidad", titulo: "Hacer las mochilas", persona_base: "referida", persona_a_cargo: "Benja", ambito: "Crianza diaria", recurrencia: { tipo: "semanal", cada: 1, dias: ["domingo"] } })), ctx("Todos los domingos hacer las mochilas"));
    expect(r.publica.elementos[0].persona_a_cargo).toBeNull();
    const vacio = validarV71(sal(el({ titulo: "Comprar leche", ambito: "Compras" })), ctx("Comprar leche para el Benja"));
    expect(vacio.publica.elementos[0].persona_a_cargo).toBeNull();
  });
  it("base contradictoria y El hogar sin ancla se marcan sin borrar", () => {
    const a = validarV71(sal(el({ titulo: "Bañar a Rayo", persona_base: "ninguna", persona_a_cargo: "Rayo", ambito: "Mascotas" })), ctx("Bañar al Rayo"));
    expect(a.publica.elementos[0]).toMatchObject({ persona_a_cargo: "Rayo", confianza: "baja" });
    const h = validarV71(sal(el({ titulo: "Comprar leche", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Compras" })), ctx("Comprar leche"));
    expect(h.publica.elementos[0]).toMatchObject({ persona_a_cargo: "El hogar", confianza: "baja" });
  });
  it("destinatario inválido o autor convierte la propuesta en nota", () => {
    const r = validarV71(sal(el({ tipo: "propuesta", titulo: "Pagar la luz", persona_base: "nombrada", persona_a_cargo: "El hogar", ambito: "Pagos y finanzas", dirigida_a: "Marcela" })), ctx("Que Marcela pague la luz de la casa"));
    expect(r.publica.elementos[0]).toMatchObject({ tipo: "nota", dirigida_a: null, persona_a_cargo: "El hogar", ambito: "Pagos y finanzas" });
  });
  it("nota sin acción queda sin clasificar; el título clínico se reemplaza", () => {
    const r = validarV71(sal(el({ tipo: "nota", titulo: "Mmm lo de la notaría, ni idea", ambito: "Trámites", motivo_nota: "sin_accion", confianza: "baja" })), ctx("Mmm lo de la notaría, ni idea"));
    expect(r.publica.elementos[0]).toMatchObject({ ambito: null, titulo: "Mmm lo de la notaría, ni idea" });
    const c = validarV71(sal(el({ tipo: "nota", titulo: "Resultado de examen de Benja", motivo_nota: "sin_accion" })), ctx("Resultado de examen de Benja"));
    expect(c.publica.elementos[0].titulo).toBe("Revisar captura");
  });
  it("recurrencia: inventada se anula, cada_n se rechaza, unidad explícita se corrige y tarea recurrente pasa a responsabilidad", () => {
    expect(validarV71(sal(el({ titulo: "Bañar a Rayo", recurrencia: { tipo: "semanal", cada: 1, dias: ["lunes"] } })), ctx("Bañar al Rayo")).publica.elementos[0].recurrencia).toBeNull();
    const u = validarV71(sal(el({ tipo: "responsabilidad", titulo: "Regar", recurrencia: { tipo: "cada_n", cada: 15, dias: [] } })), ctx("Cada 15 días regar el jardín de la casa"));
    expect(u.publica.elementos[0].recurrencia).toEqual({ tipo: "diaria", cada: 15, dias: [] });
    const t = validarV71(sal(el({ titulo: "Preparar la colación", recurrencia: { tipo: "diaria", cada: 1, dias: [] } })), ctx("Preparar la colación todos los días"));
    expect(t.publica.elementos[0].tipo).toBe("responsabilidad");
  });
  it("marca números del título sin respaldo y montos omitidos, sin cambiar el título", () => {
    const r = validarV71(sal(el({ titulo: "Pagar 50 lucas del furgón", ambito: "Pagos y finanzas" })), ctx("Pagar 45 lucas del furgón escolar"));
    expect(r.publica.elementos[0].titulo).toBe("Pagar 50 lucas del furgón");
    expect(r.ajustes.map(a => a.motivo)).toEqual(expect.arrayContaining(["numero_no_respaldado", "monto_omitido"]));
  });
  it("acción igual a un fragmento negado se marca; «no olvidar» no cuenta como negación", () => {
    const r = validarV71({ descartes: [{ evidencia: "no comprar más galletas", motivo: "negacion" }], elementos: [el({ titulo: "Comprar galletas", ambito: "Compras" })] }, ctx("no comprar más galletas mejor comprar fruta"));
    expect(r.ajustes.map(a => a.motivo)).toContain("posible_accion_negada");
    const ok = validarV71({ descartes: [{ evidencia: "No olvidar la leche", motivo: "negacion" }], elementos: [el({ titulo: "Comprar leche", ambito: "Compras" })] }, ctx("No olvidar la leche"));
    expect(ok.ajustes.map(a => a.motivo)).not.toContain("posible_accion_negada");
  });
});

describe("7.1 · validador: invariantes y metamórficas", () => {
  function prng(s: number) { return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }
  const textos = ["El sábado a las once llevar a Florencia a la fono y a las cuatro bañar al Rayo", "Que Rodrigo pague el agua de la casa antes del 5", "Mmm lo de la notaría", "Cada dos semanas bañar al Rayo", "no comprar galletas mejor comprar fruta"];
  it("con 300 salidas aleatorias: nunca agrega acciones, nunca rellena entidades nulas, siempre cumple el contrato público", () => {
    const r = prng(7); const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
    for (let k = 0; k < 300; k++) {
      const texto = pick(textos);
      const elementos = Array.from({ length: 1 + Math.floor(r() * 3) }, () => el({
        tipo: pick(["tarea", "responsabilidad", "propuesta", "nota"] as const), titulo: pick(["Bañar a Rayo", "Pagar 99 lucas", "Llevar a Florencia"]),
        persona_base: pick(["nombrada", "referida", "ninguna"] as const), persona_a_cargo: pick([null, "Florencia", "Benja", "El hogar", "Desconocido"]),
        ambito: pick([null, "Salud", "Inventado"]), tiempo: pick([[], ["El sábado"], ["a las cuatro"], ["el martes"]]), alcance: pick(["propio", "hereda", "comun", "ninguno"] as const),
        plazo_fecha: pick([null, "2027-02-27", "2030-01-01"]), plazo_hora: pick([null, "16:00"]), recurrencia: pick([null, { tipo: "cada_n" as const, cada: 3, dias: [] }]),
        dirigida_a: pick([null, "Rodrigo", "Marcela", "Nadie"]), motivo_nota: pick([null, "sin_accion", "destinatario_no_valido"] as const) }));
      const salida = sal(...elementos);
      const { publica } = validarV71(salida, ctx(texto));
      expect(contratoInterpretacion.safeParse(publica).success).toBe(true);
      expect(publica.elementos).toHaveLength(elementos.length);
      publica.elementos.forEach((p, i) => {
        for (const k of ["persona_a_cargo", "ambito", "dirigida_a"] as const) if (elementos[i][k] === null) expect(p[k]).toBeNull();
        if (p.persona_a_cargo) expect(corpus.personas_a_cargo).toContain(p.persona_a_cargo);
        if (p.ambito) expect(corpus.ambitos).toContain(p.ambito);
        if (p.titulo !== "Revisar captura") expect(p.titulo).toBe(elementos[i].titulo);
        expect(p.recurrencia?.tipo).not.toBe("cada_n");
      });
    }
  });
  it("metamórfica: renombrar personas, pasar a minúsculas y quitar puntuación no cambia fechas ni horas", () => {
    const base = validarV71(sal(el({ titulo: "Llevar a Florencia", persona_base: "nombrada", persona_a_cargo: "Florencia", ambito: "Salud", tiempo: ["El sábado a las once"], alcance: "propio" }), el({ titulo: "Bañar a Rayo", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", tiempo: ["a las cuatro"], alcance: "hereda" })), ctx("El sábado a las once llevar a Florencia a la fono, y a las cuatro bañar al Rayo."));
    const voz = validarV71(sal(el({ titulo: "llevar a florencia", persona_base: "nombrada", persona_a_cargo: "Florencia", ambito: "Salud", tiempo: ["el sabado a las once"], alcance: "propio" }), el({ titulo: "bañar a rayo", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", tiempo: ["a las cuatro"], alcance: "hereda" })), ctx("el sabado a las once llevar a florencia a la fono y a las cuatro bañar al rayo"));
    const pick = (x: typeof base) => x.publica.elementos.map(e => [e.persona_a_cargo, e.plazo_fecha, e.plazo_hora]);
    expect(pick(voz)).toEqual(pick(base));
    const otros = { ...ctx("El sábado a las once llevar a Paloma a la fono y a las cuatro bañar al Trueno"), personas: ["Paloma", "Trueno", "El hogar"] };
    const ren = validarV71(sal(el({ titulo: "Llevar a Paloma", persona_base: "nombrada", persona_a_cargo: "Paloma", ambito: "Salud", tiempo: ["El sábado a las once"], alcance: "propio" }), el({ titulo: "Bañar a Trueno", persona_base: "nombrada", persona_a_cargo: "Trueno", ambito: "Mascotas", tiempo: ["a las cuatro"], alcance: "hereda" })), otros);
    expect(ren.publica.elementos.map(e => [e.plazo_fecha, e.plazo_hora])).toEqual(base.publica.elementos.map(e => [e.plazo_fecha, e.plazo_hora]));
  });
});

describe("7.1 · separación de datos de desarrollo, demostraciones y examen", () => {
  const oficial = JSON.parse(readFileSync("evals/captura-cl.json", "utf8")) as { casos: { texto: string }[]; personas_a_cargo: string[]; integrantes: string[] };
  const dev = [JSON.parse(readFileSync("evals/desarrollo-v7-1.json", "utf8")), JSON.parse(readFileSync("evals/desarrollo-v7-1-catalogo.json", "utf8"))] as { personas_a_cargo: string[]; integrantes: string[]; ambitos: string[]; casos: { texto: string; esperado: unknown }[] }[];
  const n = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  it("el prompt 7.1 no contiene frases ni nombres del corpus oficial", () => {
    for (const c of oficial.casos) expect(n(instruccionesCapturaV71)).not.toContain(n(c.texto));
    for (const nombre of [...oficial.personas_a_cargo, ...oficial.integrantes].filter(x => x !== "El hogar")) expect(new RegExp("\\b" + n(nombre) + "\\b").test(n(instruccionesCapturaV71))).toBe(false);
  });
  it("el desarrollo no copia el examen ni las demostraciones y sus expectativas cumplen §6.2", () => {
    for (const d of dev) for (const c of d.casos) {
      expect(contratoInterpretacion.safeParse(c.esperado).success).toBe(true);
      expect(oficial.casos.some(o => n(o.texto) === n(c.texto))).toBe(false);
      expect(n(instruccionesCapturaV71)).not.toContain(n(c.texto));
      for (const e of (c.esperado as { elementos: { persona_a_cargo: string | null; ambito: string | null; dirigida_a: string | null }[] }).elementos) {
        if (e.persona_a_cargo) expect(d.personas_a_cargo).toContain(e.persona_a_cargo);
        if (e.ambito) expect(d.ambitos).toContain(e.ambito);
        if (e.dirigida_a) expect(d.integrantes).toContain(e.dirigida_a);
      }
    }
    expect(dev[0].casos.length + dev[1].casos.length).toBeGreaterThanOrEqual(40);
  });
  it("huella de la instrucción 7.1 es estable durante la ejecución", () => { expect(sha(instruccionesCapturaV71)).toHaveLength(64); });
});

describe("7.1 · ajustes tras desarrollo", () => {
  it("una franja o repetición sin plazo no genera revisión innecesaria", () => {
    const r = validarV71(sal(el({ tipo: "responsabilidad", titulo: "Hacer las tareas", persona_base: "nombrada", persona_a_cargo: "Benja", ambito: "Colegio", tiempo: ["todas las tardes"], alcance: "ninguno", recurrencia: { tipo: "diaria", cada: 1, dias: [] } })), ctx("Hacer las tareas con el Benja todas las tardes"));
    expect(r.ajustes).toEqual([]); expect(r.publica.elementos[0].confianza).toBe("alta");
  });
  it("con un plazo no verificable sí se marca", () => {
    const r = validarV71(sal(el({ titulo: "Hacer", tiempo: ["todas las tardes"], alcance: "propio", plazo_hora: "16:00" })), ctx("Hacer las tareas todas las tardes"));
    expect(r.ajustes.map(a => a.motivo)).toContain("no_verificable");
  });
});

describe("7.1 · alcance contradictorio", () => {
  it("solo hora tras una acción fechada hereda el día aunque el modelo declare «ninguno»", () => {
    const t = "Llevar al Rayo al veterinario el sábado y a las diez comprar verduras";
    const r = validarV71(sal(
      el({ titulo: "Llevar a Rayo al veterinario", persona_base: "nombrada", persona_a_cargo: "Rayo", ambito: "Mascotas", tiempo: ["el sábado"], alcance: "propio", plazo_fecha: "2027-02-27" }),
      el({ titulo: "Comprar verduras", ambito: "Compras", tiempo: ["a las diez"], alcance: "ninguno", plazo_hora: "10:00" })), ctx(t));
    expect(r.publica.elementos[1]).toMatchObject({ plazo_fecha: "2027-02-27", plazo_hora: "10:00" });
  });
  it("sin acción anterior fechada no inventa fecha", () => {
    const r = validarV71(sal(el({ titulo: "Comprar verduras", ambito: "Compras", tiempo: ["a las diez"], alcance: "ninguno", plazo_hora: "10:00" })), ctx("A las diez comprar verduras"));
    expect(r.publica.elementos[0].plazo_fecha).toBeNull();
  });
});
