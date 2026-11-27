# 04 · Plan de pruebas

Cuatro capas que no se mezclan:

- **A.** Pruebas deterministas sin proveedor.
- **B.** Desarrollo con proveedor (no ciego).
- **C.** Examen oficial.
- **D.** Evaluación ciega independiente.

Además, pruebas de revisión y de voz. Ninguna se ejecutó con Gemini en esta auditoría.

## A. Sin proveedor (las puede hacer el modelo desarrollador)

**A1. Hallazgos reproducidos.**
- Archivo: `evals/auditoria-universal.eval.ts`, con 17 `test.fails` y 5 pruebas normales.
- Comando: `npx vitest run --config evals/vitest.auditoria-universal.mts`.
- Al crear el validador 7.7, copiar cada `test.fails` como un `test` normal contra 7.7. El original queda como evidencia de 7.6, que está congelada.

**A2. Pruebas unitarias del validador 7.7**, con salidas internas escritas a mano (el contrato v7-1 con `tiempo` y `alcance`) para los casos de capa «validador» de `casos-desarrollo-nuevos.json`: F14, T01, T03, T04, T05, T06, T07 y T09. Propiedades que se exigen:
- Nunca se asigna una fecha si hay más de una lectura posible (alternativas, corrección o contradicción entre día y número).
- Una hora nunca pasa de un valor a otro distinto salvo con una lectura única. Una hora no reconocida se conserva marcada.
- La repetición nunca crea plazo.
- La salida nunca tiene una entidad, fecha, hora o monto que no estuviera en la salida bruta, salvo un recálculo único documentado.

**A3. Replay de no empeoramiento**, con el mismo protocolo que `replay-v7-6.eval.ts`:
- Las 173 respuestas, comparando 7.6 contra 7.7.
- Exigencia: cero empeorados en principal y estricta, y además en el nuevo contador por acción.
- Reportar cuántas veces se activa cada regla nueva. Si una regla se activa 0 veces, decirlo: no prueba nada.

**A4. Contador por acción en el evaluador.** Es adicional y no reemplaza principal ni estricta. Se basa en el emparejamiento de `auditar-acciones.ts`, más:
- Una coincidencia léxica mínima entre título y evidencia (por ejemplo, Jaccard ≥ 0,3 sobre palabras de 4 o más letras), o una marca del adjudicador.
- Por par: «correcta por campos» y «título compatible».
- Por captura: acciones sustituidas = pares con título incompatible.
- Debe poner en rojo los dos contraejemplos de H-M1 y H-M2.

**A5. Medición de «listas equivocadas»** (M-1 y M-2): agregar `evals/vitest.auditoria-universal.mts` al flujo `revision-universal.yml` para medir sobre las 254 respuestas del HTML. Es solo una métrica; no es una puerta mientras el propietario no lo decida.

**A6. Prefiltro de §11**, con pruebas puras:
- Teléfonos chilenos con y sin +56.
- RUT, correo, tarjeta o cuenta.
- Dosis y frecuencia de remedio («ml», «mg», «gotas», «cada N horas», «comprimido»).
- Controles negativos: «Pagar 15 lucas», «el 9 de junio» y «cada 15 días» no se bloquean.

**A7. Fecha y zona de la captura:** la fecha civil en America/Santiago se calcula desde la marca de tiempo de la captura, incluidos los cambios de horario de Chile. Casos: 23:30 local, 00:10 local y procesamiento al día siguiente.

## B. Desarrollo con proveedor (solo con autorización y cuota)

- **Conjunto:** `resultados/casos-desarrollo-nuevos.json`, 54 casos en 6 grupos:
  - 17 de finanzas,
  - 15 de tiempo,
  - 8 de segmentación,
  - 9 de intención y privacidad,
  - 5 de catálogo propio.
  - Hay 16 controles negativos y 11 casos que dependen de una decisión pendiente.
  - Son contrastivos y no ciegos. No comparten 5-gramas con el corpus oficial, los desarrollos previos ni las demostraciones del prompt (lo verifica la prueba D-1).
- **Diseño mínimo:**
  - Un solo brazo con la solicitud V7.5 (que también es la de V7.6 y la de 7.7, porque el prompt no cambia): 52 solicitudes. Los 2 de prefiltro no se envían y se cuentan como control local.
  - Las 5 de catálogo propio se envían con su contexto.
  - Agregar V6 como control solo si sobra cuota (otras 52).
- **Medidas:**
  - Por capa (bruta, 7.6, 7.7 y aplicación): principal, estricta, contador por acción, violaciones de `prohibido`, listas equivocadas, tokens, mediana y p95.
  - Los casos con `decision` se reportan aparte y no se cuentan hasta que el propietario decida.
- **Detención:** 429 detiene. Un reintento ante 503 o timeout. Ritmo de 4,5 s o más. Una violación de `prohibido` en bruto se registra (es desarrollo) y se revisa a mano.
- **Qué decide esta corrida:** si hace falta un prompt nuevo (V7.8) para pagos ya hechos, condiciones, consultas o modificaciones (ver 05 §3). Si la salida bruta los resuelve, no se toca el prompt.

## C. Examen oficial (sin cambios a las puertas)

Puertas, todas exigidas:

- 50 respuestas válidas por brazo.
- 45/50 o más en principal y en estricta, en bruto y normalizado.
- Cero invenciones después de la auditoría manual.
- Cero omitidas y cero extras.
- Cero regresiones individuales con D-19.
- Cero empeoramientos del validador.
- Entrada a lo más +10 % y mediana a lo más +30 % frente a V6.
- Mediciones completas.

Además:

- D-21: una alerta del control se registra; una alerta de la candidata detiene.
- Antes de correr, congelar los hashes del prompt, el esquema, el validador, el adaptador, el evaluador y el corpus.
- Nuevo y adicional: reportar el contador por acción y las listas equivocadas, sin que sean puerta.
- Requisito técnico previo: un evaluador y un flujo de trabajo de aceptación para la candidata elegida, porque hoy solo existe 6.0 contra 7.5 (P1-10).

## D. Evaluación ciega independiente (diseño; no se generan frases)

**Custodia:**
- Las 50 frases las escriben el propietario y Belén, por separado: 25 y 25.
- Nadie que optimice el prompt (ningún modelo) las ve.
- Cada persona etiqueta las suyas y después las de la otra, a ciegas. Los desacuerdos se resuelven conversando, citando la regla del prompt o la decisión vigente, y queda registro de cada desacuerdo.
- El custodio publica solo el SHA-256 del archivo sellado antes de la corrida.

**Cobertura mínima por intención y dominio** (una frase puede contar en varias categorías):

- 10 con dos o más acciones, al menos 3 con elipsis o anáfora.
- 12 con tiempo:
  - días relativos,
  - «el N» que cruza de mes,
  - una hora de cada clase (1–6, 7, 8–12 y con período),
  - una con alcance común,
  - una con autocorrección.
- 10 de finanzas:
  - pago con beneficiario contextual y su par sin vínculo,
  - pago del hogar,
  - un pago ya hecho,
  - dos pagos del mismo tipo,
  - un monto con formato chileno.
- 6 propuestas, al menos 1 con un integrante nombrado que no es destinatario.
- 5 negaciones, condiciones o correcciones.
- 5 con nombres fuera de la lista u homónimos.
- 4 fuera del contrato actual (consultar, navegar, modificar, completar) que deben terminar sin efecto.
- 3 ambiguas o vagas.
- Al menos 4 frases por cada uno de los 8 ámbitos.
- 10 de las 50 se repiten con un catálogo propio, para medir la sensibilidad al catálogo.
- Ninguna con tratamientos o teléfonos reales. Si se incluye un caso de prefiltro, que sea ficticio.

**Anotación:**
- Una etiqueta por acción con:
  - tipo,
  - título de referencia,
  - **evidencia literal** (el fragmento que la justifica),
  - persona, ámbito, fecha, hora, recurrencia y destinatario,
  - la lista de lo que está prohibido.
- Cada caso trae la fecha de referencia fija.

**Medidas y denominadores:**
- **Por acción:**
  - Precisión: acciones correctas sobre acciones entregadas.
  - Recuperación: acciones correctas sobre acciones esperadas.
  - Acciones sustituidas.
- **Por campo:** exactitud sobre los pares emparejados (con denominador por campo).
- **Por captura:** principal y estricta oficiales, para conservar el estándar original.
- **Errores graves, con tolerancia cero y su denominador:**
  - persona, fecha, monto o destinatario inventados,
  - una propuesta convertida en asignación,
  - una acción negada, ya hecha o condicionada presentada como pendiente sin la condición,
  - un pago atribuido a otro hijo,
  - una consulta que crea una tarea.
- **Sensibilidad al catálogo:** diferencia en ámbito correcto entre el catálogo estándar y el propio, sobre las 10 frases repetidas.
- **Metas:** 95 % o más ciego es aspiracional y no es condición nueva (04-PUERTAS). Reportar con intervalo de Wilson al 95 % y no extrapolar: con n = 50, un 47/50 tiene un intervalo aproximado de 84–98 %.

**Ejecución:**
- El archivo sellado se entrega a CI como un secreto o un artefacto cifrado, nunca dentro del repositorio.
- El flujo publica solo agregados e identificadores, y las salidas en un artefacto privado que se revisa después de decidir.

## E. Revisión, móvil, voz y privacidad

**E1. Revisión** (laboratorio, Chromium ya probado; Safari no verificado):
- Selección parcial con una dependencia (H-A5).
- Homónimos (H-A3).
- Cancelar la edición sin perder nada.
- Doble toque al confirmar.
- Deshacer después de editar (debe estar bloqueado).
- Lector de pantalla: el anuncio de «N listas · M por completar» y de los cambios.
- Texto al 200 %, anchos de 360 y 390 px, claro y oscuro.
- Teclado sin trampas de foco.

**E2. Voz: transcripción separada de comprensión.**
- 30 guiones ficticios con su transcripción de referencia fijada antes.
- Medir la tasa de error por palabra del dictado del navegador frente a la referencia.
- Después, interpretar por separado la referencia y la transcripción. Así se sabe si el error vino del dictado o de la comprensión.
- Medir por separado cinco tiempos:
  - presionar → primer texto,
  - soltar → texto final,
  - texto final → original guardado (meta ≤ 8 s en total para una frase de 5 s, §12),
  - guardado → borrador listo,
  - revisión → recibo.
- No sumar la revisión humana a la meta de 8 s sin una decisión del propietario.
- Privacidad: Web Speech puede procesar el audio fuera del dispositivo (05-PILOTAJE). Solo frases inventadas.

**E3. Respaldos:**
- Sin red: el original se guarda sin clasificar y se interpreta al volver, sin duplicar.
- Sin IA, sin consentimiento o con prefiltro activado: sin clasificar con `por_revisar`.
- Con un JSON inválido dos veces: sin clasificar.
- Recarga en plena revisión: el borrador se recupera o se conserva el original.

**E4. No declarar aprobados sin evidencia:** Safari iOS, 4G, lector de pantalla real y pilotaje humano siguen NO VERIFICADOS hasta que haya registros con el formato de 05-PILOTAJE.

## Costo de solicitudes (estimación, no medida)

| Corrida | Solicitudes |
| --- | --- |
| B, mínima | 52 |
| B, con control | 104 |
| C, oficial | 100 + repeticiones de D-19 (hasta 2 por regresión) |
| D, ciego | 50–60 por brazo |

La cuota gratuita disponible está NO VERIFICADA. Si un 429 bloquea, ver D-38 en 08.
