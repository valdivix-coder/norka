# 08 · Decisiones que solo puede tomar el propietario

Solo se listan las decisiones realmente necesarias. Cada una trae una recomendación. Ninguna está tomada.

**D-32 · Autorizar V7.7 (solo validador y evaluador, el mismo prompt V7.5).**
- Qué significa: un archivo nuevo, sin llamadas a Gemini para construirlo. V7.6 y las versiones anteriores quedan intactas.
- Recomendación: autorizar.

**D-30 · Acciones o pagos ya hechos.** Por ejemplo, «ya pagué la luz» o «ayer llevé a la Pimienta».
- Opciones:
  - (a) No son tareas. Se conservan en el original y, si no queda nada, la captura es una nota.
  - (b) Son tareas por revisar.
- Recomendación: (a). En fase 3 serán un «registro de pago» que se prepara aparte y nunca se ejecuta solo.

**D-31 · Acciones condicionales.** Por ejemplo, «si sobra plata, comprar…».
- Opciones:
  - (a) Tarea con la condición en el título y por revisar.
  - (b) Nota.
- Recomendación: (a).

**D-33 · Expresiones de tiempo no cubiertas: «12 de la noche», «a eso de las 4» y «en una semana».**
- Recomendación:
  - medianoche: 00:00 y la fecha por revisar;
  - hora aproximada: se conserva y queda por revisar;
  - «en N semanas»: sin fecha hasta que lo apruebes; la alternativa es +7·N días, por revisar.

**D-34 · Recurrencias con hora o con día del mes.** Por ejemplo, «todos los lunes a las 8» o «el 5 de cada mes».
- Hoy la hora se pierde y el día 5 no tiene dónde guardarse.
- Recomendación: aprobar que la tarea 3.2 incluya la hora y el día del mes en la regla de recurrencia. Es un cambio de contrato y de esquema que corresponde a fase 3, con su migración y su vuelta atrás.
- Mientras tanto, la revisión no debe obligar a inventar una fecha.

**D-36 · Pedido a dos integrantes a la vez.** Por ejemplo, «que Nicolás y Tere ordenen la bodega».
- Recomendación: nota por revisar. Nunca elegir a uno.

**D-37 · Prefiltro de privacidad antes de la IA (§11).**
- Qué hace: si una captura parece contener un teléfono, un RUT, una tarjeta o cuenta, o una dosis o frecuencia de remedio, se guarda sin clasificar y **no se envía a Gemini**.
- Recomendación: aprobarlo como requisito para activar la IA con datos reales.

**D-38 · Si la cuota gratuita bloquea el examen oficial con un 429.**
- Opciones:
  - (a) Esperar a que la cuota se renueve y repetir el examen completo desde cero, con los mismos hashes congelados.
  - (b) Reanudar desde el caso donde se detuvo.
- Recomendación: (a). Cambia el calendario, no las reglas.
- Activar facturación requiere tu autorización especial, porque el presupuesto adicional es cero. No recomiendo pedirla todavía.

**D-39 · Preselección de acciones «listas».**
- Hoy, con datos de desarrollo de versiones antiguas, 1 de cada 6 acciones preseleccionadas está equivocada.
- Opciones:
  - (a) Preseleccionar todas las listas.
  - (b) Preseleccionar solo si el lote tiene una acción, o si ninguna toca dinero, salud o a otra persona.
- Recomendación: (b) hasta medir V7.7 con M-2.

**Guardar original → revisar → confirmar.**
- Ya aprobaste este flujo para el sandbox. Para producción cambia §6.2 («Resultado: aparece una tarjeta con lo que se creó»).
- Recomendación: decidirlo antes de la puerta de fase 2, no ahora.

## Lo que hacen tú y Belén (el modelo no puede)

- Decidir lo anterior.
- **Conjunto ciego:**
  - Escribir 25 frases ficticias cada uno, en privado, con sus etiquetas.
  - Revisar las del otro.
  - Resolver los desacuerdos.
  - Entregar al custodio el archivo sellado y su SHA-256. No compartirlo con ningún modelo.
- **Pilotaje** según 05-PILOTAJE: laboratorio en el teléfono y en el escritorio, modo claro y oscuro, texto al 200 %, lector de pantalla. Anotar con el formato de una línea por prueba.
- **Tiempos de §12** en tu teléfono: texto ≤ 5 s y voz ≤ 8 s. Medir por separado la preparación y la revisión.
- **Escribir** «apruebo la fase N» cuando corresponda. Nadie más puede.

## Lo que puede hacer el modelo desarrollador (ver 06)

- Validador 7.7, contador por acción, M-2 en CI, prefiltro y fecha de la captura, como pruebas puras.
- Replay y ablación.
- Preparar el flujo de aceptación y la congelación.
- **Solo con tu autorización:** la corrida B (52 solicitudes) y el examen oficial.
