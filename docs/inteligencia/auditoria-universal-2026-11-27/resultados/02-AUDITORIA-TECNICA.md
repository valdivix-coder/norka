# 02 · Auditoría técnica independiente

27-nov-2026. Rama `claude/beautiful-knuth-9zau24`, creada desde la revisión de entrega `1dda9d23`. Se audita el código de `bdccc7c`: entre ambas revisiones no cambió ningún archivo de `src/` ni de `evals/`, solo se agregó una prueba del catálogo. No se llamó a Gemini, no se tocaron candidatos ni corpus y no se leyeron datos reales.

Cada hallazgo marcado «reproducido» tiene una prueba ejecutable en `evals/auditoria-universal.eval.ts`. Se corre con `npx vitest run --config evals/vitest.auditoria-universal.mts`. Las pruebas `test.fails` describen el comportamiento correcto y hoy fallan por dentro, por eso el informe las muestra como «expected fail». Las cifras y los comandos están en `07-EVIDENCIA.md`.

Escala de severidad:

- **P0:** daño activo a la privacidad o efectos no autorizados.
- **P1:** compromete la aceptación, la fidelidad o la activación.
- **P2:** riesgo medio.
- **P3:** mejora.

## Resumen

- **P0 activos: 0.** La IA familiar está deshabilitada, `procesarCaptura` no se llama desde ninguna pantalla y el laboratorio usa solo datos sintéticos.
- **P1: 10.** Cuatro son correcciones deterministas que inventan o cambian fechas y horas. Dos son de medición. Dos bloquean la activación con datos reales. Dos afectan la integración con fase 3.
- **P2: 12. P3: 5.**
- **Lo más importante:** el validador 7.4/7.6, sobre el que se apoya V7.6, no solo deja pasar errores. En cuatro patrones comunes del habla chilena **reemplaza un valor correcto del modelo por uno incorrecto** y lo marca como «recalculada». El replay de 173 respuestas no lo detecta porque esos patrones no aparecen en los corpus: en las 61 salidas internas del repositorio, la regla financiera V7.6 se activa 0 veces y el recálculo temporal 1 vez.

## P1 · alto

**P1-01 · El validador elige una de dos fechas alternativas (reproducido, H-T1).**
- Dónde: `src/core/usecases/validar-interpretacion-v7.ts:104` (`ds` toma la primera coincidencia) y `:119` (`mdm`), invocados desde `validar-interpretacion-v7-4.ts:128`.
- Contraejemplo: «Llevar a Tomás al doctor el viernes o el sábado». El modelo deja la fecha en null (correcto según la regla 7 del prompt). El validador pone el viernes con el motivo «recalculada».
- Pasa lo mismo con «el 5 o el 6» y con «mañana o pasado».
- Efecto: inventa una elección de fecha. Viola §6.2 («la IA NUNCA inventa fechas») a través del código, no de la IA. En una puerta oficial sería un «empeoramiento del validador».

**P1-02 · Una autocorrección dentro del fragmento elige la opción descartada (reproducido, H-T2).**
- Contraejemplo: el modelo devuelve `tiempo: ["el jueves, no, mejor el sábado"]`, que es literal y por eso pasa el filtro. El validador lee primero «jueves» y lo impone.
- La demostración del prompt enseña a separar la corrección en `descartes`, pero el validador no protege el caso en que el modelo no lo hace.

**P1-03 · «El lunes 15» sobrescribe una fecha correcta con otro lunes (reproducido, H-T3).**
- Dónde: `validar-interpretacion-v7.ts:104-128`. Cuando hay día de la semana, el número sin prefijo «el N» se ignora.
- Contraejemplo: hoy miércoles 3 de marzo de 2027, el lunes 15 sí es lunes. El modelo devuelve 2027-03-15 y el validador lo cambia a 2027-03-08.
- Además, si el número contradice el día de la semana («el lunes 25» cuando el 25 es martes), no se marca la contradicción.

**P1-04 · «12 de la noche» se corrige a 12:00, es decir, mediodía (reproducido, H-T4).**
- Dónde: `validar-interpretacion-v7.ts:88`, `h===12?12:h+12` con período «pm».
- Contraejemplo: «Mañana a las 12 de la noche sacar la basura». El modelo da 00:00 y el validador lo cambia a 12:00.
- Error de 12 horas en un dato que la persona va a confirmar sin sospechar.

**P1-05 · La métrica estricta no mira títulos y acepta acciones sustituidas (reproducido, H-M1 y H-M2).**
- Dónde: `evals/comparacion-v7-2.ts:42-43`. `firma` excluye el título e `igual` compara multiconjuntos ordenados.
- Contraejemplo 1: títulos intercambiados entre dos acciones, con estricta verdadera.
- Contraejemplo 2: una acción inventada («Comprar cerveza para el asado») reemplaza a una omitida con la misma firma de campos, y estricta sigue verdadera. La «cobertura por cantidad» tampoco lo ve, porque la cantidad coincide.
- Riesgo real: muchas acciones comparten la firma «todo null + Compras».
- La métrica es la definición vigente (§12, protocolo) y no se cambia. El protocolo exige revisar a mano todos los títulos, pero los informes V7.5/V7.6 citan «10/10» y «156/173» sin un contador automático que lo respalde. Se propone un contador adicional por acción con título y evidencia (05 y 04), que no reemplaza la puerta.

**P1-06 · El contexto de producción no tiene fecha ni zona horaria (reproducido, H-A6).**
- Dónde: `src/core/usecases/interpretacion.ts:2-7`. `ContextoInterpretacion` tiene texto, autor, personas, ámbitos e integrantes, pero no fecha ni zona. §6.2 exige «la fecha y hora actuales en America/Santiago».
- Además, `calendarioContextoV74` usa `fecha.slice(0,10)`. Con una marca de tiempo UTC, una captura de las 23:30 en Chile se calcularía con el día siguiente. Si la cola procesa más tarde, «mañana» se correría un día si se usa la hora de proceso en vez de la de captura.
- Bloquea integrar cualquier candidata con fechas. Hay que fijar la fecha civil y la zona **de la captura** al guardar el original.

**P1-07 · No existe un prefiltro de §11 antes de la IA (hallazgo de diseño; bloquea la activación).**
- §11: «Tratamientos… NUNCA se envían a la IA» y «Teléfonos… NUNCA van a la IA».
- Hoy el texto completo de la captura iría a Gemini, y el prompt incluso prevé dosis («Acción no representable (dosis cada N horas): nota no_representable», `prompt-captura-v7-5.ts:43`).
- Casos sin verificar con el proveedor: «Darle a Bruno 5 ml de jarabe cada 8 horas» y «Anotar el celular de la nueva nana: 9 8765 4321».
- Con la IA deshabilitada no es P0, pero se vuelve P0 el día en que se active con datos reales.
- Propuesta: un detector local y determinista (teléfono, RUT, correo, tarjeta o cuenta, patrones de dosis y frecuencia de remedio) que deja la captura «sin clasificar» sin enviarla. Requiere la decisión D-37.

**P1-08 · Una acción ya hecha se convierte en tarea pendiente (brecha de prompt y validador, reproducido en el validador, H-F2).**
- Ninguna regla del prompt V7.5 ni del validador distingue «ya pagué la luz» de «pagar la luz».
- La prueba confirma que el validador deja pasar «Pagar la luz» con confianza alta cuando el texto dice «Ya pagué la luz; falta pagar el agua».
- NO VERIFICADO: con qué frecuencia el modelo lo hace. Se mide con F04, F05 y S04 de `casos-desarrollo-nuevos.json`.
- En fase 3 importa más: «ya pagué» es un registro de pago (3.8), no una tarea nueva.

**P1-09 · Las recurrencias pierden la hora y la revisión obliga a inventar una fecha (reproducido, H-A1 y H-A2).**
- Dónde: `interpretacion.ts:39` (`plazo_hora: e.plazo_fecha ? e.plazo_hora : null`) y `src/laboratorio/revision-sintetica.ts:15` (pendiente `fecha_para_hora`).
- Contraejemplo: «Todos los lunes a las 8 sacar la basura». La propuesta aplicable pierde 08:00. En el motor de revisión la acción queda «por completar» hasta que la persona elige una fecha que no dijo.
- El contrato tampoco puede representar «el 5 de cada mes» (no hay día del mes en la recurrencia). Es una brecha directa para 3.2: recurrencia con fin de mes y bisiesto.

**P1-10 · V7.6 no tiene una vía de aceptación y su «mejora» es el caso para el que fue diseñada.**
- `evals/comparacion-v7-5.ts` solo admite 6.0 contra 7.5 en aceptación y usa `validarV74`. No hay evaluador, flujo de trabajo ni huellas de aceptación para 7.6.
- La única mejora del replay (resistencia 46039721333, caso 10) es la regresión que motivó V7.6: es un efecto de selección, no evidencia de generalización.
- La salida bruta sigue fallando ese caso. Las puertas brutas y la de regresión individual frente a V6 en capa bruta no cambian con un validador.
- Conclusión: V7.6 no puede «consolidarse» para el examen como está. Ver la decisión en 01 y 05.

## P2 · medio

**P2-01 · Se borran horas en formatos chilenos comunes (reproducido, H-T5).** «El viernes 17.30», «mañana 5 pm» y «mañana a eso de las 5»: el modelo da la hora y el validador la pone en null («recalculada»), porque el fragmento trae una fecha y el léxico no reconoce la hora. `validar-interpretacion-v7-4.ts:131`. Es una pérdida, no una invención.

**P2-02 · Una repetición crea plazo (reproducido, H-T6).** Con el fragmento «el 5 de cada mes», el validador fija la fecha en el próximo día 5. La regla 9 del prompt dice «La repetición no crea plazo». El prompt y el validador se contradicen. `esRecurrencia` (`validar-interpretacion-v7.ts:105`) solo cubre días de la semana.

**P2-03 · «Jardín» funciona como ancla de El hogar en pagos (reproducido, H-F1).**
- `HOGAR` incluye `jardin` (`validar-interpretacion-v7-4.ts:36`). «Transferir 20 lucas del jardín» conserva El hogar con confianza alta y sin ajuste.
- En Chile, «jardín» es casi siempre el jardín infantil.
- La demostración del prompt «Transferir 25 lucas del jardín → Renata (referida)» (`prompt-captura-v7-5.ts:24`) enseña una atribución discutible: Renata estaba nombrada en una acción del colegio, no del jardín.

**P2-04 · La alerta de fecha inventada se apaga con cualquier número (reproducido, H-M4).** `MARCA_TEMPORAL` (`comparacion-v7-2.ts:55`) incluye `\d{1,2}`. En «Comprar 2 kilos de pan», una fecha inventada no se alerta. «semana», «mes» y «antes» también la apagan. Es una alerta de detención: su sensibilidad importa para D-21.

**P2-05 · La revisión edita por nombre, no por identificador (reproducido, H-A3).** `editarRevision` valida un `ElementoInterpretado` con nombres e `idExacto` exige un nombre único. Con dos personas homónimas, la acción nunca se puede confirmar, ni siquiera eligiendo. El catálogo futuro necesita referencias opacas en la edición.

**P2-06 · La confianza se eleva con el contenido editado (reproducido, H-A4).** `editarRevision` acepta `confianza: "alta"` sin otro cambio y el estado pasa a «lista». La interfaz del laboratorio exige una casilla («He revisado…») y envía alta, pero el motor confía en el contenido. Falta la procedencia por campo (IA, regla o persona) y la marca de revisión humana en el recibo.

**P2-07 · No hay dependencias entre acciones (reproducido, H-A5).** Si la acción 1 cambia de fecha, la acción 2, que la heredaba («y a las 5…»), conserva la fecha vieja sin marca. Además, la selección parcial permite confirmar la dependiente sola. El plan del propietario (PLAN §2.E) pide «confirmar grupo consistente, no parcial silencioso».

**P2-08 · Una de cada seis acciones preseleccionadas como «listas» está equivocada (medición nueva, M-1).** Sobre las 122 respuestas versionadas en el repositorio (V6, 7.1 y 7.2; corpus de desarrollo):
- 117 llegan «listas». 19 de ellas no coinciden con la referencia: 16 por algún campo y 3 sin par.
- Por versión: V6 14/61, 7.1 4/44 y 7.2 1/12.
- 25 de las 36 «por completar» eran correctas, es decir, fricción innecesaria.
- Para V7.5/V7.6: NO VERIFICADO. Requiere el HTML del laboratorio; la prueba M-2 lo mide en CI.
- Importa porque el laboratorio preselecciona todas las listas (`laboratorio.js:35`) y la meta es confirmar con un toque.

**P2-09 · «367/367 preservadas, 0 pérdidas» es cierto por construcción.** `iniciarRevision` copia con `structuredClone` la misma entrada con la que se compara (`evals/revision-universal.eval.ts`). La prueba confirma que la copia no falla, no que no haya pérdida: no mide la pérdida hacia la propuesta aplicable (5 horas, 2 recurrencias, 3 beneficiarios y 2 ámbitos según PLAN §6). El titular del informe de revisión puede leerse como fidelidad.

**P2-10 · El replay de 173 respuestas tiene poca potencia y no son independientes.**
- Las 173 respuestas vienen de varias versiones (7.1 a 7.5) sobre las mismas capturas.
- Los conjuntos V7.5 son dirigidos. Los 10 casos de desarrollo V7.5 no tienen fechas, horas, propuestas ni recurrencias.
- En las 61 salidas internas locales, la regla V7.6 se activa 0 veces y el recálculo temporal 1 vez (una «a las diez»).
- «0 empeorados» significa sobre todo «no se activó». Los defectos P1-01 a P1-04 viven en entradas que no hay en los corpus.

**P2-11 · El catálogo 03 no está tipado para la ejecución.**
- Falta la intención (consultar, navegar, crear, modificar, preparar envío).
- Las entradas usan nombres («beneficiario»), no referencias.
- Falta: clave de idempotencia, evidencia, dependencia, riesgo, reversibilidad, versión de esquema y destino de navegación.
- `ejecucionIA:false` mezcla dos cosas: «la IA ejecuta» (nunca) y «la IA puede proponer».
- Faltan operaciones: `navegar.abrir`, `consultar.*`, `intencion.no_soportada`, `recordatorio.crear` y `tarea.editar`.
- `pago.registrar_manual` (3.8) y `presupuesto.registrar_gasto` (7) se solapan ante «ya pagué».
- `captura.guardar_original` exige «contexto_autorizado», pero el original debe guardarse siempre (§6.2). Ver 03.

**P2-12 · Regla V7.6 de poca cobertura.**
- `incierto` (`validar-interpretacion-v7-6.ts:11`) contiene «si» (también «sí» después de normalizar), «sin» y «cancelar» (que en Chile también significa pagar), y se aplica a todo el texto.
- El corte por «.» rompe «$15.000», así que «Pagar $15.000 del furgón» no se corrige.
- Una propuesta en subjuntivo («que pague…») tampoco se corrige.
- Es conservadora, lo que está bien, pero confirma que no es una solución general de la clasificación financiera.

## P3 · mejora

- **P3-01:** `HOGAR` incluye «agua», «luz» y «gas»: «Comprar agua mineral» queda anclada a El hogar.
- **P3-02:** La regla 8 del prompt no dice qué pasa con «de la mañana» (1–6 → N+12). El validador lo corrige solo si el fragmento es literal.
- **P3-03:** Toda corrección baja la confianza, lo que aumenta las acciones «por completar» (ver P2-08).
- **P3-04:** El artefacto del laboratorio vence a los 14 días (`retention-days: 14`, aprox. 11-dic-2026). Hay que volver a exportarlo para reproducir.
- **P3-05:** Los corpus de desarrollo se concentran en persona y ámbito. Las clases temporales de V7.5 nunca se volvieron a medir tras cambiar una demostración temporal (lo reconoce INFORME-EVALUACION-V7.5).

## Lo que está bien hecho (verificado)

- Corpus oficial intacto (blob `8a1add2d…` en `bdccc7c` y en la rama) y prompt V6 intacto (`865b9191…`).
- Gates, D-19 y D-21 implementados como se describen en `comparacion-v7-5.ts`: 429 detiene, un reintento ante 503 o timeout, ritmo de 4,5 s.
- Laboratorio: CSP `connect-src 'none'`, solo `textContent` (sin inyección de HTML), `noindex`, sin red y sin persistencia.
- Motor de revisión: revisión optimista, bloqueo de doble toque, deshacer acotado, `ejecutor_id` siempre null.
- `interpretarConReintento` y `procesarCaptura` no registran texto.
- Las cifras citadas en el paquete coinciden con los registros de CI (`07-EVIDENCIA.md`).

## Qué decide la IA y qué decide el código

- **IA:** segmentar acciones, el tipo de intención, el beneficiario cuando hay vínculo lingüístico, el ámbito por finalidad, y los fragmentos literales de tiempo y monto con su alcance.
- **Código:** calendario, horas, montos, nombres, permisos e identificadores.
- **Principio para 7.7:** en el tiempo, el código solo puede anular y marcar, o recalcular cuando hay **una sola** lectura posible. Nunca elige entre alternativas ni prioriza un léxico incompleto por sobre el modelo.
