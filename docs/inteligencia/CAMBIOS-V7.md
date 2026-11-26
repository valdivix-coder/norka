# Cambios V7 · informe de mejoras, diagnóstico y decisiones

Estado: **candidato propuesto, no integrado, no evaluado con Gemini.** No se modificó el repositorio, `main`, producción, casos oficiales, expectativas, secretos, datos, facturación, RLS ni políticas. Fase 2 no se declara cerrada.

## 0. Resumen ejecutivo

- **El problema de fondo no es de redacción.** V6 ya prohibía copiar plazos y tenía un ejemplo análogo, y aun así copió la fecha en el caso 8. V7 cambia la estructura de salida: por cada acción, el modelo copia primero la **evidencia literal** y sus **fragmentos temporales literales**; el código verifica esas citas, recalcula el calendario y se abstiene cuando el alcance es incierto. El contrato público §6.2 no cambia.
- **Compra para mascota (caso 24):** la contradicción estaba en el prompt operativo (la compra genérica de alimentos ganaba a Mascotas). V7 define la prioridad por finalidad, congruente en maestro y operativo, con un caso pago-del-veterinario que conserva Pagos.
- **El calendario lo resuelve el código** a partir de fragmentos literales, con abstención explícita en el mismo día de semana, expresiones vagas y fechas alternativas; el modelo recibe además un calendario derivado de los próximos seis días para no calcular días de semana.
- **Tamaño:** instrucción V7 de 9.225 caracteres frente a 9.368 de V6 (≈ 2.300–2.620 tokens estimados con la razón medida en V6; no es un conteo). La salida crece por la evidencia literal: medir.
- **Evidencia medida en esta entrega (solo local, sin proveedor):** 69/69 pruebas de calendario, recurrencia y montos; 50/50 ejemplos traducidos exactamente; 20/22 errores simulados neutralizados o marcados; el validador no cambia ningún campo de las 100 etiquetas existentes (oficial y desarrollo) cuando recibe evidencia correcta. **Nada de esto mide la precisión de Gemini**: el A/B de `PLAN-PRUEBAS-V7.md` está pendiente.
- **Lo que V7 no puede garantizar:** errores semánticos de ámbito (el código no los detecta), y que el modelo respete el orden de propiedades y copie evidencia literal (NO VERIFICADO hasta la primera corrida).

## 1. Diagnóstico de contradicciones y riesgos (con fuente)

| Id | Fuente | Hallazgo | Efecto | Resolución V7 |
|---|---|---|---|---|
| C-01 | `src/data/prompt-captura.ts` regla 3 vs `PROMPT-MAESTRO-IA.md` §Prioridad | El maestro pone «alimentación de animal» en Mascotas; el operativo solo dice «cuidados/veterinario» y manda «alimentos» a Compras | Error del caso 24 (Compras en vez de Mascotas) | Clase Mascotas incluye todo lo que se compra para el animal, antes de Compras; pago conserva Pagos (R-AMB-MASC, pares P09, P17) |
| C-02 | `prompt-captura.ts` regla 5 | La prohibición de copiar plazos es solo una orden, sin mecanismo verificable; el ejemplo análogo («El miércoles a las once … y comprar jabón») no bastó | Error del caso 8 | Campo `tiempo` literal por acción + validador que rechaza fragmentos fuera de la evidencia y anula plazos sin fragmento (R-TMP-1..4) |
| C-03 | `prompt-captura.ts` regla 5 | «Horas ambiguas … por revisar», pero no define la convención que el oráculo usa («a las cuatro» = 16:00, «a las nueve» = 09:00) | Inestabilidad entre corridas y versiones | Convención explícita D-06 (1–6 → tarde; 7 → null) |
| C-04 | `prompt-captura.ts` regla 2 | Herencia de beneficiario «por actividad escolar asociada a la única persona nombrada» convive con «no elijas por descarte» | Zona gris; el oráculo hereda en el caso 1 sin posesivo | Se mantiene la herencia en secuencia; el validador marca `beneficiario_sin_ancla_en_accion` (solo baja la confianza) |
| C-05 | `src/core/contracts/interpretacion.ts` | `cada_n` existe en el esquema sin semántica definida; V6 solo dice cuándo no usarlo | Opción muerta que invita al error (v5: cada_n incorrecto) | «Nunca cada_n»; el validador lo reemplaza o lo anula |
| C-06 | `src/core/usecases/revisar-interpretacion.ts` | La normalización de intervalo solo corre si hay **una** acción | Dos recurrencias en una captura quedan sin protección | `recurrenciaDesde` por evidencia de cada acción |
| C-07 | `revisar-interpretacion.ts` | El nombre se busca en el texto completo, no en la acción | Un beneficiario copiado a otra acción pasa | Ancla por acción (solo marca; no anula, por el posesivo legítimo) |
| C-08 | `src/core/usecases/calendario-captura.ts` | Agrupa «este», «próximo» y día sin prefijo; mismo día → siempre +7; no resuelve «antes del cinco», día sin mes, números en palabras ni horas | Convención no aprobada presentada como cálculo | Calculador con estados (inequívoca/heredada/convención/ambigua/desconocida) y abstención en mismo día (D-04) |
| C-09 | `evals/desarrollo-cl-v6.json` caso 46 | La etiqueta del jueves dicho un jueves (+7) incorpora la convención no aprobada | Las etiquetas de desarrollo no son neutrales | V7 lo resuelve por secuencia (la acción anterior ya avanzó al martes); sin acción anterior sería null. Reportar aparte |
| C-10 | `evals/gemini.eval.ts` | Aserciones `porAccionBruta = 0` y `camposBrutosDiscrepantes = 0` | El código determinista no puede ayudar a pasar la puerta; choca con el encargo de llevar determinismo al código | Se mantiene como medida del prompt; decisión de puerta del propietario (D-08) |
| C-11 | `prompt-captura.ts` contexto | Las personas a cargo llegan sin tipo; distinguir mascota de niña en «comida para X» obliga a inferir por el nombre, lo que el maestro V6 prohíbe | Error latente; la única salida sin tipo es dudar | `tipo` opcional en la entrada (D-03); sin tipo, Mascotas con confianza baja |
| C-12 | `prompt-captura.ts` regla 4 | Dos clases de nota (sin acción: todo null; destinatario desconocido: conserva persona y ámbito) indistinguibles para el código | El código no puede anular con seguridad | `motivo_nota` interno |
| C-13 | `PROMPT-MAESTRO-IA.md` §Contrato vs §Privacidad | La nota copia el texto original como título; «no repitas diagnósticos» | Un diagnóstico puede quedar en un título de nota | Tareas sin diagnóstico; notas: decisión D-10 |
| C-14 | `evals/captura-cl.json` casos 3 y 36 (etiquetas, no textos) | Caso 3: persona null con confianza alta (el desarrollo análogo usa baja). Caso 36: el título esperado omite el monto que la regla manda conservar | Etiquetas de confianza y título no siguen las reglas | No se cambian; confianza y título no entran en las métricas. La auditoría de títulos usa la regla |
| C-15 | `src/data/gemini-sintetico.ts` | Rotación Hydrogen → Flash → Lite → Gemma dentro de una corrida | Comparaciones entre versiones contaminadas por modelo | A/B con modelo fijo y sin respaldos |
| C-16 | `prompt-captura.ts` ejemplos | Reloj de ejemplos en lunes sin día de semana declarado; el modelo calcula días de semana | Fuente de error en fechas relativas | Calendario derivado en la entrada |
| C-17 | `prompt-captura.ts` | 15 ejemplos con los nueve campos completos (≈ 63 % de la instrucción) | Costo sin ganancia: el esquema ya garantiza los campos | Ejemplos abreviados (se omiten null) y 10 demostraciones |
| C-18 | `HANDOFF` vs encargo | «Objetivo ≤ 2.500 tokens» y «evidencia literal» compiten: la evidencia agranda la salida | Tensión costo/beneficio | Entrada se mantiene en el orden de V6; la salida crece; medir |

**Riesgos que V7 introduce:** (R1) esquema más largo → más fallos de Zod o truncamiento; (R2) el modelo podría parafrasear la evidencia → el validador baja la confianza (más Por revisar) pero no corrige; (R3) el validador podría bajar confianzas de más → tasa Por revisar mayor; (R4) Gemma sin esquema estructurado tolera peor el contrato interno; (R5) heurísticas léxicas (nombres con mayúscula, ancla de El hogar) dependen de la transcripción de voz, que puede no poner mayúsculas.

## 2. Cambios V6 → V7

| Área | V6 | V7 |
|---|---|---|
| Salida del modelo | §6.2 directo | Contrato interno: `descartes`, `evidencia`, `tiempo`, `motivo_nota` + §6.2; traducción determinista |
| Alcance temporal | Orden en prosa | Fragmentos literales por acción; herencia solo de hora o día del mes; referencia común explícita; abstención |
| Calendario | Lo calcula el modelo | Lo propone el modelo, lo recalcula el código; calendario derivado en la entrada |
| Mismo día de semana | Sin regla | null y baja salvo «próximo» o secuencia (D-04) |
| Horas | Implícito | Convención explícita (D-06), «la once» no es hora |
| Ámbitos | Lista con contradicción C-01 | Clases con prioridad por finalidad; catálogo personalizado sin caer de clase |
| Recurrencia | Normalización con una sola acción | Por acción; «día/semana por medio»; nunca `cada_n` |
| Negación / corrección / inyección | Regla en prosa | Campo `descartes` verificable |
| Notas | Dos clases indistinguibles | `motivo_nota` |
| Montos | Sin verificación | Monto de la evidencia presente en el título; ningún número ajeno |
| Entidades | Catálogo + mención en el texto | + ancla por acción, homónimos, nombres fuera de lista |
| Cobertura | Sin verificación | Palabras de contenido no cubiertas → posible omisión, baja |
| Ejemplos | 15 completos, familia ficticia | 10 abreviados, otra familia ficticia, centrados en los errores medidos; 30 casos de prueba aparte |
| Tamaño | 9.368 caracteres | 9.225 caracteres |

Se preserva de V6: separación systemInstruction/datos, temperatura 0, texto como dato, nombres exactos, nada por descarte, El hogar no como relleno, propuesta solo a integrantes, nota por destinatario desconocido con persona y ámbito, recurrencia sin plazo, títulos breves, respaldo de modelos, revisión conservadora de entidades, copia bruta en evaluación.

## 3. Evidencia local medida en esta entrega

Entorno: directorio aislado fuera del repositorio, Node 22.23.5, `tsx`, zod de la versión declarada en `package.json`; sin red ni proveedor. Resultados exactos de la última ejecución:

```
calendario/recurrencia/montos: 69 ok, 0 fallos
traducción+mutaciones: 72 ok, 0 fallos; mutaciones detectadas 20/22
OFICIAL: 50/50 sin cambio de campos; 0 con cambios; 4 elementos con confianza distinta a la etiqueta
DESARROLLO: 50/50 sin cambio de campos; 0 con cambios; 1 elementos con confianza distinta a la etiqueta
referencias internas válidas: 50 / 50 · orden de propiedades: evidencia,tiempo,tipo,titulo,…,motivo_nota
```

Las cinco confianzas que bajan son intencionales: dos acciones sin plazo propio junto a otra fechada (casos oficiales 7 y 8), un beneficiario heredado sin posesivo (oficial 1), el título esperado sin monto (oficial 36) y una acción sin plazo junto a otra fechada (desarrollo 41). La «regresión» con etiquetas usa evidencia escrita a mano por el ingeniero: prueba que el código no rompe respuestas correctas, **no** que el modelo las produzca. Las dos mutaciones no detectadas (ámbito Compras en vez de Mascotas o Colegio) confirman que el ámbito sigue siendo responsabilidad del modelo.

## 4. Decisiones pendientes del propietario

| Id | Decisión | Propuesta | Alternativas |
|---|---|---|---|
| D-01 | Usar el contrato interno con evidencia en `responseJsonSchema` | Sí, solo en memoria, sin persistir | Mantener §6.2 directo (V6) |
| D-02 | Calendario derivado en la entrada | Sí | Sin calendario (medir en ablación) |
| D-03 | Enviar `tipo` de persona a cargo (hija_hijo, mascota, adulto_dependiente, hogar) | Sí: evita inferir por el nombre; dato mínimo, no edad ni género | No enviarlo; aceptar la duda |
| D-04 | Día de semana igual a hoy («el jueves» dicho un jueves) | null + Por revisar (salvo «próximo» o secuencia) | Siempre +7 (como `calendario-captura.ts`) · siempre hoy |
| D-05 | «El próximo <día>» distinto de hoy | Próxima ocurrencia con confianza baja | Semana siguiente · sin baja |
| D-06 | Horas sin período | 8–12 tal cual; 1–6 tarde; 7 null | Todo null salvo 13–23 |
| D-07 | «Al tiro» / «ayer» | Hoy / fecha pasada, ambas con baja | null |
| D-08 | Puerta de aceptación | Mantener la bruta como medida del prompt y decidir si la puerta del producto es la normalizada | Exigir ambas (actual) |
| D-09 | ¿El validador corrige o solo marca? | Corrige fechas, horas y recurrencias desde fragmentos inequívocos; solo marca títulos y ámbitos | Solo marcar todo |
| D-10 | Títulos de notas con datos de salud | Mantener texto original (ya está en la captura) | Título genérico «Revisar captura» |
| D-11 | Apodos por persona a cargo | Lista opcional de apodos en la ficha | Nunca mapear apodos |
| D-12 | Varios beneficiarios o destinatarios en una acción | Una acción, persona null, Por revisar | Dividir en acciones (contradice «no dividir objetos») |
| D-13 | «X va a…» / «X tiene que…» sin petición | Tarea, sin destinatario, baja | Propuesta |
| D-14 | Comprar uniforme, cotona o buzo escolar | Colegio | Compras |
| D-15 | Comprar remedios o insumos de salud | Salud con baja (sin indicaciones) | Compras |
| D-16 | «Cada quince días» | Diaria cada 15 (unidad literal) | Semanal cada 2 |
| D-17 | Límite de salida y razonamiento | `maxOutputTokens` 1024/4096, sin razonamiento | Sin límite |
| D-18 | Datos reales | Nada de V7 cambia que el plan gratuito sea solo para datos sintéticos; evaluar modalidad pagada, términos y menores antes de cualquier uso real | — |

## 5. Restricciones incompatibles (dichas explícitamente)

1. **Puerta bruta = 0 vs determinismo en código:** mientras la puerta exija discrepancias brutas cero, el validador no puede contribuir a aprobar; solo protege al producto (C-10, D-08).
2. **«No inferir por el nombre» vs clasificar «comida para <nombre>» sin tipo:** sin D-03 no existe una respuesta que sea a la vez segura y de confianza alta (C-11).
3. **≤ 2.500 tokens vs evidencia literal:** la entrada cabe en el rango estimado; la salida crece necesariamente.
4. **«No dividir objetos» vs un solo beneficiario por acción:** dos beneficiarios no son representables sin cambiar el esquema (D-12).
5. **Cobertura individual 50/50 vs cuota gratuita:** si la cuota no alcanza para 100 solicitudes individuales más reintentos, el A/B queda incompleto y debe registrarse así.

## 6. Migraciones

Ninguna. Nada interno se persiste. Cambios de esquema público, multiresultado, persistencia de hora sin fecha y responsabilidades sin beneficiario siguen pendientes de decisión, como en V6.

## 7. Vuelta atrás

V6 no se toca. La integración V7 entra detrás de un selector de versión con V6 por defecto; volver atrás = seleccionar `6.0`. Criterios en `PLAN-PRUEBAS-V7.md` §5.

## 8. Mejoras futuras (según evidencia, no por número de versión)

- Si el ámbito sigue fallando en el A/B: **juez barato solo para casos marcados** (segunda llamada mínima únicamente cuando el validador marca alcance o ámbito dudoso) — medir costo y cuota antes.
- Si la evidencia literal se parafrasea: alinear por subsecuencia en el código en vez de rechazar.
- Si el calendario derivado ayuda: extenderlo a «el N» de los dos meses siguientes.
- Conjunto de resistencia ampliado y ciego, rotado en cada versión.
- Meta 98–100 % aspiracional, no promesa.

---

## Anexo A · Prototipo de referencia (no integrado)

Código puro, probado localmente. Al integrarlo: ubicar en `src/core/usecases/validar-interpretacion-v7.ts` y `src/core/contracts/interpretacion-interna-v7.ts`, respetar el estilo del repositorio y la regla de fronteras del arnés. `calendarioContexto` alimenta `contexto.calendario`.

### Validador, calendario, recurrencia y montos · `postproceso-v7.ts`

```ts
// PROTOTIPO DE REFERENCIA V7 (no integrado en norka). Puro: sin reloj del entorno, sin red, sin registros de texto.
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
    let s = " " + norm(bruto) + " ";
    if (VAGAS.test(s)) { peor("ambigua"); reconocido++; continue; }
    // Hora primero (para no confundir "en la mañana" con el día siguiente).
    let periodo: "am" | "pm" | null = null;
    if (/\b(de|en|por) la manana\b/.test(s)) { periodo = "am"; s = s.replace(/\b(de|en|por) la manana\b/, " "); }
    if (/\b(de|en|por) la (tarde|noche)\b/.test(s)) { periodo = "pm"; s = s.replace(/\b(de|en|por) la (tarde|noche)\b/, " "); }
    const mh = new RegExp("\\ba (?:las|la) " + NUMRE + "(?::(\\d{2})| y (media|cuarto))?(?: (?:hrs|horas|am|pm))?\\b").exec(s);
    if (/\b(al|a) mediodia\b/.test(s)) { hora = "12:00"; reconocido++; s = s.replace(/\b(al|a) mediodia\b/, " "); }
    else if (mh) {
      reconocido++; s = s.replace(mh[0], " ");
      let h = num(mh[1]); const min = mh[2] ? Number(mh[2]) : mh[3] === "media" ? 30 : mh[3] === "cuarto" ? 15 : 0;
      if (/ pm\b/.test(mh[0])) periodo = "pm"; if (/ am\b/.test(mh[0])) periodo = "am";
      if (h === undefined || h > 23 || min > 59) { horaAmbigua = true; h = -1; }
      else if (h >= 13) { /* literal 24 h */ }
      else if (periodo === "pm") { if (h === 12) { horaAmbigua = true; h = -1; } else h += 12; }
      else if (periodo === "am") { if (h === 12) { horaAmbigua = true; h = -1; } }
      else if (h >= 8 && h <= 12) { /* convención: mañana o mediodía */ }
      else if (h >= 1 && h <= 6) { h += 12; } // convención propuesta (D-06): 1–6 sin período = tarde; no baja la confianza
      else { horaAmbigua = true; h = -1; } // 7 y 0 sin período: no se adivina
      if (h >= 0 && h <= 23) hora = `${pad(h)}:${pad(min)}`;
    } else if (periodo) { reconocido++; /* franja sin número: no hay hora */ }
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
      let delta = (objetivo - hoyD + 7) % 7;
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
  if (clase === "ambigua") return { fecha: null, hora: null, clase };
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
  const ajustes: Ajuste[] = []; const T = c.texto; const compartido = COMPARTIDO.test(norm(T)) || /^[^:]{1,40}:/.test(T.trim());
  const spans: [number, number][] = [];
  let anterior: string | null = null; const sinTiempo: number[] = [];
  const publicos = interna.elementos.map((o, i) => {
    const e: ElementoPublico = { tipo: o.tipo, titulo: o.titulo, persona_a_cargo: o.persona_a_cargo, ambito: o.ambito, plazo_fecha: o.plazo_fecha, plazo_hora: o.plazo_hora, recurrencia: o.recurrencia ? { ...o.recurrencia, dias: [...o.recurrencia.dias] } : null, dirigida_a: o.dirigida_a, confianza: o.confianza };
    const marcar = (campo: string, motivo: string) => { ajustes.push({ indice: i, campo, motivo }); e.confianza = "baja"; };
    // 1. Evidencia literal y segmentos sin superposición
    const ev = o.evidencia ?? ""; const literal = ev.trim().length > 0 && contiene(T, ev);
    if (!literal) marcar("evidencia", "no_literal");
    else { const p = posicion(T, ev), q = p + norm(ev).length; if (spans.some(([a, b]) => p < b && a < q)) marcar("evidencia", "superpuesta"); spans.push([p, q]); }
    const base = literal ? ev : T;
    // 2. Negación
    const n0 = norm(ev);
    if (literal && e.tipo !== "nota" && NEGADA.test(n0) && !NO_AFIRMATIVA.test(n0)) marcar("tipo", "accion_negada");
    if (literal && (interna.descartes ?? []).some(d => contiene(ev, d.evidencia) && norm(d.evidencia).length >= 4 && d.motivo !== "correccion")) marcar("evidencia", "incluye_descarte");
    // 3. Nota sin solicitud: sin clasificación
    if (e.tipo === "nota" && (o.motivo_nota ?? "sin_accion") === "sin_accion") for (const k of ["persona_a_cargo", "ambito", "plazo_fecha", "plazo_hora", "recurrencia", "dirigida_a"] as const) if (e[k] !== null) { (e as any)[k] = null; marcar(k, "nota_sin_clasificacion"); }
    // 4. Entidades (reglas v6 + ancla por acción)
    if (e.persona_a_cargo !== null) {
      if (!c.personas.includes(e.persona_a_cargo) || (e.persona_a_cargo !== "El hogar" && !menciona(T, e.persona_a_cargo))) { e.persona_a_cargo = null; marcar("persona_a_cargo", "sin_evidencia_nombre"); }
      else if (e.persona_a_cargo === "El hogar" && !HOGAR.test(norm(base))) marcar("persona_a_cargo", "hogar_sin_ancla");
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
      if (literal && !contiene(ev, f) && !compartido) { marcar("tiempo", "fuera_de_alcance"); return false; }
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
      if (!e.recurrencia && e.tipo === "responsabilidad") { e.tipo = "tarea"; marcar("tipo", "sin_recurrencia"); }
    }
    if (e.recurrencia?.tipo === "cada_n") { e.recurrencia = null; marcar("recurrencia", "cada_n_no_permitido"); }
    // 7. Montos y números del título
    if (literal) {
      const mt = montos(ev), mtit = montos(e.titulo);
      if (mt.some(x => !mtit.includes(x))) marcar("titulo", "monto_omitido");
      const enTexto = new Set([...norm(T).matchAll(/\d+/g)].map(m => Number(m[0].replace(/\D/g, ""))).concat(montos(T)));
      if ([...norm(e.titulo).replace(/(\d)[.\s](?=\d{3}\b)/g, "$1").matchAll(/\d+/g)].some(m => !enTexto.has(Number(m[0])))) marcar("titulo", "numero_no_respaldado");
    }
    return e;
  });
  if (publicos.some(e => e.plazo_fecha !== null)) for (const i of sinTiempo) { ajustes.push({ indice: i, campo: "plazo_fecha", motivo: "alcance_incierto" }); publicos[i].confianza = "baja"; }
  // 8. Duplicados y omisiones posibles
  const vistos = new Set<string>(); publicos.forEach((e, i) => { const k = norm(interna.elementos[i].evidencia ?? ""); if (k && vistos.has(k)) { ajustes.push({ indice: i, campo: "evidencia", motivo: "duplicada" }); e.confianza = "baja"; } vistos.add(k); });
  const cubierto = norm([...interna.elementos.flatMap(x => [x.evidencia ?? "", ...(x.tiempo ?? [])]), ...(interna.descartes ?? []).map(d => d.evidencia)].join(" "));
  const RELLENO = /^(mmm+|eh+|ah+|chuta|ojo|porfa|pucha|oye|bueno|ya|igual|tambien|despues|luego|ademas|mejor|hacer|tengo|tienes|tiene|hay|para|pero|todo|todos|esto|eso|cosa|cosas|perdon|digo)$/;
  const faltan = norm(T).split(" ").filter(w => w.length >= 4 && !RELLENO.test(w) && !cubierto.includes(w));
  if (faltan.length > 0) publicos.forEach((e, i) => { ajustes.push({ indice: i, campo: "cobertura", motivo: "posible_omision" }); e.confianza = "baja"; });
  return { publica: { elementos: publicos }, ajustes };
}
```

### Contrato interno · `contrato-interno-v7.ts`

```ts
import { z } from "zod";
// Contrato INTERNO V7 (solo entre el adaptador y el validador). El contrato público §6.2 no cambia.
const recurrencia = z.strictObject({ tipo: z.enum(["diaria", "semanal", "mensual", "anual", "cada_n"]), cada: z.number().int().positive(), dias: z.array(z.enum(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"])) });
export const descarteV7 = z.strictObject({ evidencia: z.string().trim().min(1), motivo: z.enum(["negacion", "correccion", "instruccion"]) });
export const elementoInternoV7 = z.strictObject({
  evidencia: z.string().trim().min(1),            // primero: ancla literal de la acción
  tiempo: z.array(z.string().trim().min(1)),      // segundo: fragmentos temporales literales de ESA acción
  tipo: z.enum(["tarea", "responsabilidad", "propuesta", "nota"]),
  titulo: z.string().trim().min(1),
  persona_a_cargo: z.string().nullable(), ambito: z.string().nullable(),
  plazo_fecha: z.iso.date().nullable(), plazo_hora: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
  recurrencia: recurrencia.nullable(), dirigida_a: z.string().nullable(), confianza: z.enum(["alta", "baja"]),
  motivo_nota: z.enum(["sin_accion", "destinatario_no_valido", "no_representable"]).nullable(),
});
export const contratoInternoV7 = z.strictObject({ descartes: z.array(descarteV7), elementos: z.array(elementoInternoV7).min(1) });
export const contratoLoteInternoV7 = z.strictObject({ resultados: z.array(z.strictObject({ id: z.number().int(), descartes: z.array(descarteV7), elementos: z.array(elementoInternoV7).min(1) })).min(1).max(5) });
```

## Anexo B · Pruebas locales

Ejecutar con `npx tsx <archivo>` en el mismo directorio que el prototipo y `EJEMPLOS-DESARROLLO-V7.json`. `regresion.test.ts` lee los dos corpus del repositorio solo para comprobar que el código no altera etiquetas existentes; no se usan como ejemplos ni para ajustar el prompt.

### Calendario, hora, recurrencia y montos · `calendario.test.ts`

```ts
import assert from "node:assert/strict";
import { resolverTiempo, calendarioContexto, recurrenciaDesde, montos } from "./postproceso-v7.ts";
let ok = 0, fallos = 0;
function caso(ref: string, frag: string[], ant: string | null, fecha: string | null, hora: string | null, clase?: string) {
  const r = resolverTiempo(ref, frag, ant);
  try { assert.equal(r.fecha, fecha); assert.equal(r.hora, hora); if (clase) assert.equal(r.clase, clase); ok++; }
  catch { fallos++; console.log("FALLA", ref, frag, ant, "→", r, "esperado", { fecha, hora, clase }); }
}
const J = "2026-11-26"; // jueves
caso(J, ["hoy"], null, "2026-11-26", null, "inequivoca");
caso(J, ["Mañana"], null, "2026-11-27", null, "inequivoca");
caso(J, ["pasado mañana"], null, "2026-11-28", null);
caso(J, ["El martes"], null, "2026-12-01", null, "inequivoca");
caso(J, ["el viernes"], null, "2026-11-27", null, "inequivoca");
caso(J, ["el jueves"], null, null, null, "ambigua");          // mismo día: abstención
caso(J, ["este jueves"], null, null, null, "ambigua");
caso(J, ["el jueves"], "2026-12-01", "2026-12-03", null, "heredada"); // «el martes … y el jueves»
caso(J, ["el próximo jueves"], null, "2026-12-03", null, "inequivoca");
caso(J, ["el próximo lunes"], null, "2026-11-30", null, "convencion");
caso(J, ["este sábado"], null, "2026-11-28", null, "inequivoca");
caso(J, ["antes del cinco"], null, "2026-12-05", null, "inequivoca");
caso(J, ["el 26"], null, "2026-11-26", null);
caso(J, ["el 25"], null, "2026-12-25", null);
caso(J, ["el 31"], null, "2026-12-31", null);
caso(J, ["el 2 de enero"], null, "2027-01-02", null, "inequivoca");
caso(J, ["el 30 de febrero"], null, null, null, "ambigua");
caso(J, ["antes del 10 de diciembre"], null, "2026-12-10", null);
caso(J, ["vence el 28 de noviembre"], null, "2026-11-28", null);
caso(J, ["la otra semana"], null, null, null, "ambigua");
caso(J, ["a fin de mes"], null, null, null, "ambigua");
caso(J, ["a las cuatro"], null, null, "16:00", "ambigua");     // hora sin día: hora se conserva, fecha a revisión
caso(J, ["a las cuatro"], "2026-11-27", "2026-11-27", "16:00", "heredada");
caso(J, ["a las 18"], "2026-11-27", "2026-11-27", "18:00", "heredada");
caso(J, ["a las siete"], "2026-11-27", null, null, "ambigua");
caso(J, ["Mañana a las siete"], null, "2026-11-27", null, "convencion"); // hora dudosa no borra la fecha
caso(J, ["Mañana", "a las siete de la tarde"], null, "2026-11-27", "19:00", "inequivoca");
caso(J, ["mañana en la mañana"], null, "2026-11-27", null, "inequivoca");
caso(J, ["A las 14 mañana"], null, "2026-11-27", "14:00", "inequivoca");
caso(J, ["en 10 días"], null, "2026-12-06", null);
caso(J, ["a mediodía"], "2026-11-27", "2026-11-27", "12:00");
caso(J, ["a las ocho y media"], "2026-11-27", "2026-11-27", "08:30");
caso(J, ["El sábado a las nueve"], null, "2026-11-28", "09:00", "inequivoca");
caso(J, ["el 3"], "2026-12-02", "2026-12-03", null, "heredada");
caso(J, ["el 3"], "2026-12-28", "2027-01-03", null, "heredada");
caso(J, ["al tiro"], null, "2026-11-26", null, "convencion");
caso(J, [], null, null, null, "sin_tiempo");
caso(J, ["algo raro"], null, null, null, "desconocida");
caso(J, ["mañana", "el sábado"], null, null, null, "ambigua"); // dos fechas en una acción
const F = "2026-12-30"; // miércoles, fin de año
caso(F, ["mañana"], null, "2026-12-31", null);
caso(F, ["pasado mañana"], null, "2027-01-01", null);
caso(F, ["el lunes"], null, "2027-01-04", null);
caso(F, ["el 2"], null, "2027-01-02", null);
caso(F, ["el 15 de diciembre"], null, "2027-12-15", null);
const B = "2028-02-28"; // lunes, año bisiesto
caso(B, ["mañana"], null, "2028-02-29", null);
caso(B, ["pasado mañana"], null, "2028-03-01", null);
caso(B, ["el 29 de febrero"], null, "2028-02-29", null);
caso("2027-02-28", ["mañana"], null, "2027-03-01", null);
caso("2027-02-28", ["el 29 de febrero"], null, null, null, "ambigua");
caso("2100-02-28", ["mañana"], null, "2100-03-01", null);   // 2100 no es bisiesto
caso("2000-02-28", ["mañana"], null, "2000-02-29", null);   // 2000 sí
// Calendario derivado para la entrada
const cal = calendarioContexto("2026-11-26T12:00:00-03:00");
try { assert.equal(cal.hoy, "2026-11-26 jueves"); assert.equal(cal.proximos["martes"], "2026-12-01"); assert.equal(cal.proximos["jueves"], undefined); ok++; } catch { fallos++; console.log("FALLA calendario", cal); }
// Recurrencia
const rec = (t: string, esp: unknown) => { const r = recurrenciaDesde(t); try { assert.deepEqual(r, esp); ok++; } catch { fallos++; console.log("FALLA rec", t, r); } };
rec("Día por medio regar las plantas", { tipo: "diaria", cada: 2, dias: [] });
rec("semana por medio el sábado lavar el auto", { tipo: "semanal", cada: 2, dias: ["sábado"] });
rec("todos los martes y viernes preparar la colación", { tipo: "semanal", cada: 1, dias: ["martes", "viernes"] });
rec("Cada tres semanas el jueves ordenar", { tipo: "semanal", cada: 3, dias: ["jueves"] });
rec("cada 4 días cambiar el agua", { tipo: "diaria", cada: 4, dias: [] });
rec("Una vez al mes revisar", { tipo: "mensual", cada: 1, dias: [] });
rec("cada dos años renovar", { tipo: "anual", cada: 2, dias: [] });
rec("Todos los domingos en la noche hacer las mochilas", { tipo: "semanal", cada: 1, dias: ["domingo"] });
rec("cada quince días cortar el pasto", { tipo: "diaria", cada: 15, dias: [] });
rec("quincenal pagar el jardinero", "ambigua");
rec("el lunes llevar a Antonia", null);
// Montos
const mon = (t: string, esp: number[]) => { try { assert.deepEqual(montos(t), esp); ok++; } catch { fallos++; console.log("FALLA monto", t, montos(t)); } };
mon("pagar 18 lucas de la matrícula", [18000]); mon("pagar $12.500 del furgón", [12500]); mon("pagar 15000 pesos", [15000]);
mon("pagar quince mil pesos", [15000]); mon("dos palos del auto", [2000000]); mon("comprar 3 cuadernos", []);
console.log(`calendario/recurrencia/montos: ${ok} ok, ${fallos} fallos`); if (fallos) process.exit(1);
```

### Traducción y mutaciones · `validador.test.ts`

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validarV7, type SalidaInterna } from "./postproceso-v7.ts";
const doc = JSON.parse(readFileSync("EJEMPLOS-DESARROLLO-V7.json", "utf8"));
const ctx = (k: string, texto: string) => { const c = doc.contextos[k]; return { fecha: c.fecha, texto, personas: c.personas_a_cargo, integrantes: c.integrantes, autor: c.autor, ambitos: c.ambitos }; };
let ok = 0, fallos = 0;
const caso = (id: string) => doc.casos.find((c: any) => c.id === id);
// 1. La referencia interna correcta se traduce exactamente al esperado público (incluida la confianza).
for (const c of doc.casos) {
  const r = validarV7(structuredClone(c.interna_referencia), ctx(c.contexto, c.texto));
  try { assert.deepEqual(r.publica, c.esperado); ok++; } catch { fallos++; console.log("FALLA traducción", c.id, JSON.stringify(r.ajustes), JSON.stringify(r.publica.elementos.map(e => [e.persona_a_cargo, e.ambito, e.plazo_fecha, e.plazo_hora, e.confianza]))); }
}
// 2. Mutaciones que simulan errores del modelo: ¿el código las neutraliza o al menos las marca?
type M = { id: string; nombre: string; mutar: (x: SalidaInterna) => void; verificar: (r: ReturnType<typeof validarV7>) => boolean; esperado: "detecta" | "no_detecta" };
const muts: M[] = [
  { id: "P01b", nombre: "fecha copiada a acción sin marcador", mutar: x => { x.elementos[1].plazo_fecha = "2027-03-04"; x.elementos[1].confianza = "alta"; }, verificar: r => r.publica.elementos[1].plazo_fecha === null && r.publica.elementos[1].confianza === "baja", esperado: "detecta" },
  { id: "P01b", nombre: "fragmento temporal ajeno usado como propio", mutar: x => { x.elementos[1].tiempo = ["Mañana"]; x.elementos[1].plazo_fecha = "2027-03-04"; }, verificar: r => r.publica.elementos[1].plazo_fecha === null, esperado: "detecta" },
  { id: "P02b", nombre: "plazo compartido sin referencia común", mutar: x => { x.elementos[1].tiempo = ["El sábado"]; x.elementos[1].plazo_fecha = "2027-03-06"; }, verificar: r => r.publica.elementos[1].plazo_fecha === null, esperado: "detecta" },
  { id: "P04a", nombre: "mismo día resuelto como hoy", mutar: x => { x.elementos[0].plazo_fecha = "2027-03-03"; x.elementos[0].confianza = "alta"; }, verificar: r => r.publica.elementos[0].plazo_fecha === null && r.publica.elementos[0].confianza === "baja", esperado: "detecta" },
  { id: "P19b", nombre: "día de semana mal calculado", mutar: x => { x.elementos[0].plazo_fecha = "2027-03-10"; }, verificar: r => r.publica.elementos[0].plazo_fecha === "2027-03-09", esperado: "detecta" },
  { id: "P06a", nombre: "bisiesto mal calculado", mutar: x => { x.elementos[0].plazo_fecha = "2028-03-01"; }, verificar: r => r.publica.elementos[0].plazo_fecha === "2028-02-29", esperado: "detecta" },
  { id: "P07b", nombre: "hora inventada para «a las siete»", mutar: x => { x.elementos[0].plazo_hora = "07:00"; x.elementos[0].confianza = "alta"; }, verificar: r => r.publica.elementos[0].plazo_hora === null, esperado: "detecta" },
  { id: "P08a", nombre: "«la once» leída como 11:00", mutar: x => { x.elementos[0].plazo_hora = "11:00"; x.elementos[0].tiempo = []; }, verificar: r => r.publica.elementos[0].plazo_hora === null, esperado: "detecta" },
  { id: "P20a", nombre: "cada_n en lugar de unidad", mutar: x => { x.elementos[0].recurrencia = { tipo: "cada_n", cada: 2, dias: [] }; }, verificar: r => JSON.stringify(r.publica.elementos[0].recurrencia) === JSON.stringify({ tipo: "diaria", cada: 2, dias: [] }), esperado: "detecta" },
  { id: "P19a", nombre: "repetición convertida en tarea", mutar: x => { x.elementos[0].tipo = "tarea"; x.elementos[0].recurrencia = null; }, verificar: r => r.publica.elementos[0].tipo === "responsabilidad", esperado: "detecta" },
  { id: "P21a", nombre: "monto omitido en el título", mutar: x => { x.elementos[0].titulo = "Pagar el furgón"; }, verificar: r => r.ajustes.some(a => a.motivo === "monto_omitido"), esperado: "detecta" },
  { id: "P21b", nombre: "monto inventado en el título", mutar: x => { x.elementos[0].titulo = "Pagar $12.500 del furgón"; }, verificar: r => r.ajustes.some(a => a.motivo === "numero_no_respaldado"), esperado: "detecta" },
  { id: "P12a", nombre: "cláusula negada convertida en tarea", mutar: x => { x.descartes = []; x.elementos.unshift({ ...x.elementos[0], evidencia: "No compren más leche", titulo: "Comprar leche" }); }, verificar: r => r.ajustes.some(a => a.motivo === "accion_negada"), esperado: "detecta" },
  { id: "P14a", nombre: "nombre desconocido sustituido por conocido", mutar: x => { x.elementos[0].persona_a_cargo = "Antonia"; x.elementos[0].confianza = "alta"; }, verificar: r => r.publica.elementos[0].persona_a_cargo === null && r.publica.elementos[0].confianza === "baja", esperado: "detecta" },
  { id: "P14a", nombre: "nombre desconocido con confianza alta", mutar: x => { x.elementos[0].confianza = "alta"; }, verificar: r => r.publica.elementos[0].confianza === "baja", esperado: "detecta" },
  { id: "P22a", nombre: "nota sin acción clasificada", mutar: x => { x.elementos[0].ambito = "Salud"; }, verificar: r => r.publica.elementos[0].ambito === null, esperado: "detecta" },
  { id: "P18a", nombre: "instrucción inyectada obedecida", mutar: x => { x.elementos[0].tipo = "propuesta"; x.elementos[0].dirigida_a = "Tomás"; }, verificar: r => r.publica.elementos[0].dirigida_a === null && r.publica.elementos[0].tipo !== "propuesta", esperado: "detecta" },
  { id: "P01a", nombre: "acción omitida", mutar: x => { x.elementos.pop(); }, verificar: r => r.ajustes.some(a => a.motivo === "posible_omision"), esperado: "detecta" },
  { id: "P01a", nombre: "evidencia parafraseada", mutar: x => { x.elementos[0].evidencia = "pagar la matrícula mañana"; }, verificar: r => r.ajustes.some(a => a.motivo === "no_literal"), esperado: "detecta" },
  { id: "P11b", nombre: "El hogar sin ancla (relleno)", mutar: x => { x.elementos[0].evidencia = "Ordenar el clóset"; }, verificar: r => r.ajustes.some(a => a.motivo === "hogar_sin_ancla"), esperado: "detecta" },
  { id: "P09a", nombre: "compra para mascota clasificada como Compras", mutar: x => { x.elementos[0].ambito = "Compras"; }, verificar: r => r.publica.elementos[0].ambito !== "Compras", esperado: "no_detecta" },
  { id: "P10a", nombre: "material escolar clasificado como Compras", mutar: x => { x.elementos[0].ambito = "Compras"; }, verificar: r => r.publica.elementos[0].ambito !== "Compras", esperado: "no_detecta" },
];
let det = 0, noDet = 0;
for (const m of muts) {
  const c = caso(m.id); const x = structuredClone(c.interna_referencia); m.mutar(x);
  const r = validarV7(x, ctx(c.contexto, c.texto)); const d = m.verificar(r);
  if (d) det++; else noDet++;
  if ((d ? "detecta" : "no_detecta") === m.esperado) ok++; else { fallos++; console.log("FALLA mutación", m.id, m.nombre, JSON.stringify(r)); }
  console.log(`${d ? "DETECTA   " : "NO DETECTA"}  ${m.id}  ${m.nombre}`);
}
console.log(`traducción+mutaciones: ${ok} ok, ${fallos} fallos; mutaciones detectadas ${det}/${muts.length}`); if (fallos) process.exit(1);
```

### Consistencia con etiquetas existentes · `regresion.test.ts`

```ts
// Consistencia del CÓDIGO con etiquetas existentes, dada una evidencia correcta escrita a mano.
// NO mide al modelo. Sirve para comprobar que la capa determinista no rompe respuestas correctas.
import { readFileSync } from "node:fs";
import { validarV7 } from "./postproceso-v7.ts";
type Seg = [string, string[]];
const OFICIAL: Record<number, Seg[]> = {
 1: [["El martes a las diez control de la Emilia con la pediatra", ["El martes a las diez"]], ["hay que pagar la cuota del curso antes del cinco", ["antes del cinco"]]],
 6: [["Mañana comprarle comida al Toby", ["Mañana"]], ["llevar a Emilia al dentista a las cuatro", ["a las cuatro"]]],
 7: [["El lunes retirar el certificado de Emilia", ["El lunes"]], ["comprar detergente para la casa", []]],
 8: [["El sábado a las nueve llevar al Toby al veterinario", ["El sábado a las nueve"]], ["limpiar el patio de la casa", []]],
 9: [["Hoy comprar un cuaderno para Emilia", ["Hoy"]], ["mañana comprar pan para la casa", ["mañana"]]],
 10: [["El 2 de diciembre sacar hora al dentista de Emilia", ["El 2 de diciembre"]], ["el 3 bañar al Toby", ["el 3"]]],
 11: [["Mañana a las 8 reunión del colegio de Emilia", ["Mañana a las 8"]], ["a las 18 comprar comida del Toby", ["a las 18"]]],
 12: [["Revisar el calefón de la casa", []], ["comprar zapatos para Emilia", []]],
 13: [["El viernes a las 17 llevar a Emilia al kine", ["El viernes a las 17"]], ["el domingo desparasitar al Toby", ["el domingo"]]],
 14: [["Hoy ordenar el clóset de Emilia", ["Hoy"]], ["mañana lavar la ropa de la casa", ["mañana"]]],
 24: [["*", ["mañana"]]], 25: [["*", ["el martes a las diez"]]], 26: [["*", ["el lunes"]]], 30: [["*", ["hoy"]]], 31: [["*", ["el domingo"]]], 32: [["*", ["el sábado"]]],
 33: [["*", ["antes del 10 de diciembre"]]], 34: [["*", ["vence el 5 de diciembre"]]], 35: [["*", ["el 30 de noviembre"]]], 36: [["*", ["el 3 de diciembre"]]], 37: [["*", ["antes del 15 de diciembre"]]],
 38: [["*", ["el 1 de diciembre"]]], 39: [["*", ["El 28 de noviembre"]]], 40: [["*", ["el 20 de diciembre"]]], 41: [["*", ["el 7 de diciembre"]]], 47: [["*", ["el lunes"]]], 49: [["*", ["el 5 de diciembre"]]],
};
const DESARROLLO: Record<number, Seg[]> = {
 1: [["*", ["Pasado mañana"]]], 2: [["*", ["El martes"]]], 7: [["*", ["el 15 de diciembre"]]], 8: [["*", ["El lunes"]]], 10: [["*", ["mañana"]]], 27: [["*", ["El 31 de diciembre"]]], 28: [["*", ["El 2 de enero"]]],
 29: [["*", ["A las 14 mañana"]]], 30: [["*", ["Mañana a las siete de la tarde"]]], 34: [["*", ["el 8 de diciembre"]]], 39: [["*", ["el domingo"]]], 40: [["*", ["el lunes"]]],
 41: [["El viernes llevar a Inés al colegio", ["El viernes"]], ["limpiar el refrigerador de la casa", []]],
 42: [["Mañana a las 8 llevar a Pipa al veterinario", ["Mañana a las 8"]], ["a las 17 comprar lápices para Inés", ["a las 17"]]],
 43: [["Hoy comprar té para la casa", ["Hoy"]], ["el domingo sacar el carnet de Inés", ["el domingo"]]],
 44: [["Comprar comida para Pipa", []], ["pagar 9000 pesos del curso de Inés", []]],
 45: [["Ordenar el estuche de Inés", []], ["comprar harina para la casa", []]],
 46: [["El martes buscar a Inés en el colegio", ["El martes"]], ["el jueves pagar su matrícula", ["el jueves"]]],
 47: [["Cada dos días cepillar a Pipa", []], ["cada mes limpiar las ventanas de la casa", []]],
 48: [["*", ["el sábado"]]],
};
const DESC: Record<string, { evidencia: string; motivo: string }[]> = { "D48": [{ evidencia: "mañana", motivo: "correccion" }], "D49": [{ evidencia: "No comprar cuadernos", motivo: "negacion" }] };
function correr(nombre: string, archivo: string, mapa: Record<number, Seg[]>, pref: string) {
  const c = JSON.parse(readFileSync(archivo, "utf8")); let iguales = 0, campos = 0, confianza = 0; const motivos: Record<string, number> = {};
  for (const caso of c.casos) {
    const segs = mapa[caso.id] ?? [["*", []]];
    const texto = caso.texto;
    let evid = segs.map(s => s[0] === "*" ? texto : s[0]);
    if (caso.id === 49 && pref === "D") evid = ["comprar lápices para Inés"];
    const elementos = caso.esperado.elementos.map((e: any, i: number) => ({ ...e, evidencia: evid[i] ?? texto, tiempo: segs[i]?.[1] ?? [],
      motivo_nota: e.tipo === "nota" ? (e.persona_a_cargo || e.ambito ? "destinatario_no_valido" : "sin_accion") : null }));
    const r = validarV7({ descartes: DESC[pref + caso.id] ?? [], elementos }, { fecha: c.fecha, texto, personas: c.personas_a_cargo, integrantes: c.integrantes, autor: c.autor, ambitos: c.ambitos });
    const sinConf = (x: any) => JSON.stringify(x.elementos.map(({ confianza, titulo, ...k }: any) => k));
    if (sinConf(r.publica) === sinConf(caso.esperado)) iguales++; else { campos++; console.log(nombre, caso.id, "CAMBIA CAMPOS", JSON.stringify(r.ajustes)); }
    r.publica.elementos.forEach((e: any, i: number) => { if (e.confianza !== caso.esperado.elementos[i].confianza) confianza++; });
    for (const a of r.ajustes) motivos[a.motivo] = (motivos[a.motivo] ?? 0) + 1;
  }
  console.log(`${nombre}: ${iguales}/${c.casos.length} sin cambio de campos; ${campos} con cambios; ${confianza} elementos con confianza distinta a la etiqueta; motivos ${JSON.stringify(motivos)}`);
}
correr("OFICIAL", "/home/claude/valdivix-coder/norka/evals/captura-cl.json", OFICIAL, "O");
correr("DESARROLLO", "/home/claude/valdivix-coder/norka/evals/desarrollo-cl-v6.json", DESARROLLO, "D");
```

### Esquema interno · `contrato.test.ts`

```ts
import { readFileSync } from "node:fs";
import { z } from "zod";
import { contratoInternoV7 } from "./contrato-interno-v7.ts";
const doc = JSON.parse(readFileSync("EJEMPLOS-DESARROLLO-V7.json", "utf8"));
let ok = 0; for (const c of doc.casos) { contratoInternoV7.parse(c.interna_referencia); ok++; }
const js = z.toJSONSchema(contratoInternoV7) as any;
console.log("referencias internas válidas:", ok, "/", doc.casos.length, "· orden de propiedades:", Object.keys(js.properties.elementos.items.properties).join(","));
console.log("tamaño esquema JSON (caracteres):", JSON.stringify(js).length);
```

