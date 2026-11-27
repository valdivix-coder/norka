# 06 · Prompt de implementación para el modelo desarrollador

Copiar completo. Este prompt no autoriza fusionar, cerrar fases, llamar a Gemini ni cambiar el contrato público. Cada etapa termina con evidencia y se detiene donde se indica.

---

Eres el desarrollador de norka (valdivix-coder/norka). Hablas con la propietaria en español, claro y paso a paso.

**Antes de escribir código, lee:**
- `AGENTS.md`, `docs/AHORA.md` y `docs/PROMPT-MAESTRO.md` (§6.2, §11, §12 y §13.2);
- la carpeta `docs/inteligencia/auditoria-universal-2026-11-27/` completa, incluida `resultados/`;
- la guía de Next.js instalada, si tocas Next.

**Base y rama:** parte de la rama de auditoría `claude/beautiful-knuth-9zau24` (o de la rama que la propietaria indique) y trabaja en una rama nueva. No cambies `fase-2` ni `main`.

**No cambies:**
- V6, V7.0–V7.6 (prompts, validadores, adaptadores, evaluadores, congelaciones);
- `evals/captura-cl.json` ni ninguna expectativa;
- las puertas y umbrales, D-19 y D-21;
- el contrato §6.2, la base de datos, las migraciones, RLS, los secretos, el proveedor ni el presupuesto.

**Reglas generales:**
- Sin datos reales.
- Sin llamadas a Gemini hasta que la propietaria escriba la autorización exacta de la etapa 5.
- Si una comprobación se pone en rojo, arregla el código, no la prueba.
- Lo que no puedas verificar va como «NO VERIFICADO: … cómo comprobarlo».

## Etapa 1 · Validador 7.7 (requiere D-32 aprobada)

1. Crea `src/core/usecases/validar-interpretacion-v7-7.ts`. Exporta `validarV77(interna, contexto)`, que llama a `validarV76` y luego aplica, en este orden, las funciones puras A1–A7 de `05-ESTRATEGIA-PROMPT-VALIDADOR.md` §2. Cada función:
   - recibe el fragmento literal, la salida bruta interna y la salida de 7.6;
   - solo puede anular un valor, marcarlo (confianza baja y un ajuste `{indice,campo,motivo}` con motivo nuevo), o **restaurar el valor bruto del modelo** cuando 7.6 lo cambió y el fragmento tiene más de una lectura o una hora no reconocida;
   - nunca agrega un dato que no esté en la salida bruta.
   - Sin `Date` (regla 14) y sin registrar texto.
2. Si A6 o A7 dependen de D-30 o D-33 y esas decisiones no están tomadas, impleméntalas solo como **marca** (nunca anulación) y déjalo anotado.
3. Crea `tests/arnes/interpretacion-v7-7.test.ts`:
   - Por cada `test.fails` de `evals/auditoria-universal.eval.ts` (H-T1 a H-T6 y H-F1), una prueba normal del comportamiento correcto contra `validarV77`.
   - Pruebas de propiedad: para 200 combinaciones generadas de fragmentos (día de la semana, número, «o», corrección, hora con «.», «pm», «de la noche» y «de cada mes»), la salida nunca contiene una fecha u hora que no esté en la salida bruta ni en una lectura única.
   - No modifiques `evals/auditoria-universal.eval.ts`: sus `test.fails` documentan 7.6.
4. Crea `src/data/gemini-sintetico-v7-7.ts`, que reutiliza `solicitudV75` byte a byte. Agrega la prueba de igualdad de la solicitud, como en `interpretacion-v7-6.test.ts`. `VERSION_PREDETERMINADA` sigue en `"6.0"`.
5. Corre `npm run arnes` y muestra el total, que debe ser 303 más las pruebas nuevas, todas verdes.

**Detente y muestra la evidencia.**

## Etapa 2 · Evaluador: conteo por acción y medición de listas equivocadas

1. Crea `evals/comparacion-v7-7.ts`, copiando `comparacion-v7-5.ts` sin modificarlo:
   - Aceptación: solo 6.0 contra 7.7. Desarrollo: 6.0, 7.5 y 7.7.
   - Mismas puertas y paradas.
   - Agrega a `resumenBrazo`, sin quitar nada:
     - `porAccion: {esperadas, entregadas, correctas, sustituidas, precision, recuperacion}`. Usa el emparejamiento de `auditar-acciones.ts` más la compatibilidad de título de `04-PLAN-PRUEBAS.md` A4.
     - `prohibidos` para los corpus que traen `prohibido`.
     - `listasEquivocadas`.
   - El contador nuevo **no** es puerta. Se reporta.
   - Pruebas: los contraejemplos H-M1 y H-M2 deben dar `sustituidas > 0`.
2. Agrega al flujo `.github/workflows/revision-universal.yml` el paso `npx vitest run --config evals/vitest.auditoria-universal.mts`, para que M-2 mida las 254 respuestas.
3. Corre el replay de 173 respuestas con la ablación A0 a A7 (05 §2), en un flujo nuevo copiado de `replay-v7-6.yml`. Exige cero empeorados por paso y reporta cuántas veces se activa cada regla. Si un paso empeora, retíralo del validador, documéntalo y vuelve a correr.

**Detente y muestra:** los ID de los runs, los números por paso y M-2 por versión.

## Etapa 3 · Fecha de la captura y prefiltro de §11 (núcleo puro, sin activar nada)

1. Crea `src/core/usecases/fecha-captura.ts`. Convierte una marca de tiempo ISO con desplazamiento a la fecha civil y la hora en America/Santiago con una tabla de reglas explícita (sin `Date` en el núcleo; si hace falta la zona, que venga de un puerto). Pruebas A7.
   - No cambies `ContextoInterpretacion` todavía. Deja escrita la propuesta del campo para la propietaria.
2. Crea `src/core/usecases/prefiltro-ia.ts`, con la función `debeOmitirIA(texto): {omitir: boolean; motivo: "telefono"|"rut"|"correo"|"tarjeta_cuenta"|"tratamiento"|null}` y las pruebas A6 con sus controles negativos.
   - No lo conectes a `procesarCaptura` sin D-37 aprobada.
   - Nunca registres el texto.

**Detente.**

## Etapa 4 · Congelación de 7.7 (sin proveedor)

1. Crea `evals/congelacion-v7-7.eval.ts` y `docs/inteligencia/CONGELACION-V7.7.json`, con los hashes de:
   - la instrucción y los sufijos,
   - el esquema y el esquema por lotes,
   - los validadores 7.7, 7.6, 7.4 y 7.0,
   - el adaptador,
   - el evaluador y la cobertura,
   - el corpus oficial.
2. Crea un flujo de trabajo de aceptación copiado de `evaluacion-v7-5.yml` que **verifique los hashes antes de cualquier solicitud** y que solo se dispare con un archivo de solicitud.

**Detente y pide a la propietaria la autorización de la etapa 5.**

## Etapa 5 · Solicitudes al proveedor (solo con autorización escrita)

**Desarrollo B.** Requiere el texto exacto «autorizo corrida B de 7.7».
- Carga `resultados/casos-desarrollo-nuevos.json`: sus 52 casos enviables, sin N06 ni N07, que son de prefiltro y se evalúan solo en local.
- Un brazo con la solicitud V7.5/7.7. Los casos C01–C05 van con el contexto de catálogo propio.
- 429 detiene. Un reintento ante 503 o timeout. Ritmo de 4,5 s o más.
- Reporta por capa (bruta, 7.6, 7.7 y aplicación): principal, estricta, por acción, prohibidos, listas equivocadas, tokens, mediana y p95. Los casos con `decision` van aparte.
- Decide con 05 §3 si se propone V7.8 y **propónla, no la implementes** sin aprobación.

**Examen oficial.** Requiere «autorizo examen oficial 6.0 contra 7.7».
- Primero, la verificación de hashes.
- Puertas de 04-PUERTAS sin cambios, D-19 y D-21.
- Revisión manual de todos los títulos, montos y omisiones antes de declarar cero invenciones.
- Si hay un 429, aplica D-38 tal como lo haya decidido la propietaria.

## Al terminar cada etapa

- Actualiza `docs/IMPLEMENTATION_STATUS.md`, `docs/AHORA.md` y el documento de la fase, con:
  - evidencia (commits, runs, artefactos, hashes),
  - límites,
  - NO VERIFICADO,
  - vuelta atrás.
- No declares «listo» sin evidencia.
- No fusiones.
- No escribas «fase aprobada»: eso solo lo escribe la propietaria.

## Condiciones de parada inmediata

- Cualquier cambio necesario en un archivo congelado, en el corpus o en el contrato §6.2.
- Una corrección del validador que agregue un dato.
- Una regresión individual en un examen, que se maneja según D-19.
- Una alerta de la candidata.
- Un 429.
- Una medición incompleta.
- Un costo mayor que cero.
- Una solicitud que requiera datos reales.
