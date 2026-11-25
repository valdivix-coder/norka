# Informe global de implementación — 25 de noviembre de 2026

Fuente: sección 13 del prompt maestro, evidencia de Fase 1, GitHub Actions, Vercel y Supabase. Este reporte no cambia el plan ni sus puertas. El avance porcentual por tarea es una estimación explícita de cierre (100 = criterio técnico comprobado; 90–95 = código entregado y aceptación o auditoría residual pendiente; 0 = fase futura no iniciada como tarea). No representa horas ni esfuerzo. Fase 0 es un hito independiente aprobado; el plan tiene 83 tareas numeradas de fase 1 a 10. Nueve tienen código (10,8 %); cuatro tienen criterio técnico comprobado sin reserva principal (4,8 % del total); fase 1 estimada 95,6 % (860/900 puntos); 10,4 % del plan numerado por promedio de porcentajes (860/8300). Solo 1 de 11 fases aprobada formalmente. No confundir con el porcentaje por fases de reportes anteriores.

## Resultados

- Commit de código `1b29b00`: [arnés mínimo](https://github.com/valdivix-coder/norka/actions/runs/45680886800), [arnés completo](https://github.com/valdivix-coder/norka/actions/runs/45680886725), 118/118 pruebas, compilación aprobada, 10 vistas a 360 px, 7 controles funcionales, 10 auditorías de vistas y 2 de catálogo (12 en total) sin infracciones, 0 errores JS. Equilibrio a 200 %. Catálogo con 28 componentes y 16 combinaciones de marca por tema, oscuro y claro. [Capturas, JSON y video emulado](https://github.com/valdivix-coder/norka/actions/runs/45680886725/artifacts/15054821112).
- [Vista previa READY](https://norka-3wkufoea9-neuralia1.vercel.app/); [enlace de rama](https://norka-git-fase-1-neuralia1.vercel.app/). Protección de Vercel intacta.
- Supabase: cuatro migraciones numeradas aplicadas y una paralela histórica de familias; nueve tablas con RLS activo y lectura directa denegada a anon y authenticated, permitida al servidor. Vercel: nombres y destinos de ENTRADA_GOOGLE, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y SUPABASE_SECRET_KEY verificados sin descifrar valores. No se cambian datos, permisos, migraciones ni secretos. La fase 2 debe resolver numeración 0003 del plan frente a migración 0003 de sesiones ya aplicada, usando siguiente identificador libre con trazabilidad, no repetir migraciones existentes.
- Pendiente: comprobar OAuth y redirección de vista previa, dos cuentas, CRUD persistente, recorrido físico, gesto, texto ampliado y lector de pantalla en teléfono real, 60 fps y revisión exacta de valores de catálogo. Antes de ingresar datos familiares reales, atender la rotación de credenciales privadas compartidas según el registro anterior. No se fusiona main ni se inicia fase 2 hasta aprobación de fase 1 según la puerta.

## Fase 0 — Descubrimiento y diseño

100 % — aprobada por escrito el 20 de noviembre de 2026. Nueve apartados del entregable de 13.0; no se cuentan como tareas 0.x. Ver [FASE-0](fases/FASE-0.md).

## Fase 1 — Base

9/9 con código; 4/9 con criterio técnico comprobado sin reserva principal; 95,6 % estimado, aceptación pendiente.

- **1.1 — 100 %**. Crear el repositorio con la estructura de la sección 9.1. Guardar este documento completo en `docs/PROMPT-MAESTRO.md`. Crear `docs/AHORA.md` y `docs/GLOSARIO.md` (con la tabla 5.1). Guardar la guía gráfica que entrega el propietario en `docs/marca/GUIA-GRAFICA.pdf`. *Hecho cuando:* el proyecto arranca en local y los tres documentos existen. — Estado: Estructura, arranque, documentos y compilación verificados.
- **1.2 — 100 %**. Arnés mínimo: tipos, linter, prueba de fronteras de capas, e integración continua que corre `npm run arnes`. *Hecho cuando:* el arnés pasa y falla a propósito si `src/core` importa React (muestra las dos salidas). — Estado: Arnés mínimo y completo aprobados; evidencia histórica de fallo deliberado de fronteras.
- **1.3 — 95 %**. Archivo de tokens copiado de la sección 13 de la guía gráfica; archivo de mensajes `src/mensajes/es-CL.ts`; componente `Marca` con sus 4 piezas y el comando `npm run iconos` (sección 10.1); y los 28 componentes de la sección 7 de la guía, en modo oscuro (principal) y claro. *Hecho cuando:* una página de muestra enseña los 28 componentes y la marca en sus 4 piezas y 4 fondos, en oscuro y en claro, a 360 px, y cada componente indica la sección de la guía que aplica. — Estado: 28 componentes y 16 combinaciones por tema, 360 px y axe aprobados; fidelidad de cada valor visual no exhaustivamente auditada.
- **1.4 — 100 %**. Migración 0001: `cuentas`, `identidades`, `familias`, `integrantes`, `invitaciones`, `preferencias`, con RLS sin políticas. *Hecho cuando:* entregas la migración, sus consultas antes/después y la vuelta atrás, y el propietario confirma que la aplicó. — Estado: Migración 0001 aplicada y permisos revisados directamente.
- **1.5 — 90 %**. Entrada con Google, Apple y Facebook (cada uno tras su variable de entorno; el botón solo aparece si está configurado), regla «una persona, una cuenta» y sesión propia en cookie httpOnly. *Hecho cuando:* se puede entrar y salir en el teléfono con Google; hay pruebas del núcleo para: correo que ya existe con otro proveedor, correo distinto, y unir dos formas de entrar desde Perfil. — Estado: Google y sesión propia implementados; falta entrar/salir en teléfono real y validar redirección.
- **1.6 — 100 %**. Puerto de almacén, adaptador Supabase, adaptador en memoria, cerrojo de ámbito y pruebas de aislamiento. *Hecho cuando:* las pruebas de aislamiento pasan. — Estado: Almacén, aislamiento, pertenencia, revocación y pruebas aprobados.
- **1.7 — 90 %**. Crear familia, generar invitación, aceptar invitación con rol familiar y participación. Perfil de integrante con el campo de teléfono (prefijo «+56 9» fijo, 8 dígitos, «Otro país»). *Hecho cuando:* dos cuentas distintas quedan en la misma familia y cada una ve el teléfono de la otra. — Estado: Familias/invitaciones/perfil, migración 0004; falta prueba con dos cuentas reales.
- **1.8 — 90 %**. Migración 0002 y pantallas: `personas_a_cargo` (con «El hogar» automático) y `ambitos` (los 8 iniciales). *Hecho cuando:* se puede agregar, editar y archivar una persona a cargo. — Estado: CRUD y ámbitos conectados; falta probar persistencia real y deshacer.
- **1.9 — 95 %**. Las 5 pantallas de la barra inferior (Hoy, Familia, Capturar, Equilibrio, Actividad) con sus estados vacíos; la cabecera completa (sección 8.2) con Buscar, Avisos y Perfil abriendo sus pantallas vacías; y las transiciones de cambio de pestaña y de subpantalla (sección 10.3). *Hecho cuando:* se recorre toda la app en el teléfono sin pantallas rotas y la cabecera se recoge siguiendo al dedo (grabación de pantalla como evidencia). — Estado: Navegación, cabecera, gestos implementados; arnés y navegador emulado aprobados. Falta gesto, fluidez y grabación en teléfono físico.

## Fase 2 — Captura

0/9 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **2.1 — 0 %**. Migración 0003: `responsabilidades`, `tareas`, `capturas`, `trabajos_ia`. — Estado: Pendiente de la puerta de la fase anterior.
- **2.2 — 0 %**. Botón Capturar global y captura por texto: guarda la captura y crea una tarea sin clasificar. *Hecho cuando:* se captura desde las 5 pantallas. — Estado: Pendiente de la puerta de la fase anterior.
- **2.3 — 0 %**. Captura sin conexión con cola de envío. *Hecho cuando:* con la red cortada se captura y, al volver la red, aparece. — Estado: Pendiente de la puerta de la fase anterior.
- **2.4 — 0 %**. Contrato Zod de la sección 6.2 y caso de uso «aplicar interpretación», con todas sus reglas, probado en el núcleo SIN llamar a ninguna IA. *Hecho cuando:* hay una prueba por cada regla de aplicación. — Estado: Pendiente de la puerta de la fase anterior.
- **2.5 — 0 %**. Escribir las 50 frases de evaluación en `evals/`, en español de Chile, con su resultado esperado: 10 con dos o más tareas, 10 con recurrencia, 10 propuestas a otro integrante, 10 de pagos con día de vencimiento, 5 ambiguas, 5 con nombres que no existen en la familia. — Estado: Pendiente de la puerta de la fase anterior.
- **2.6 — 0 %**. Adaptador Gemini, cola de trabajos, pantalla de consentimiento y comando `npm run eval`. *Hecho cuando:* `npm run eval` muestra el porcentaje de aciertos y la cantidad de datos inventados. — Estado: Pendiente de la puerta de la fase anterior.
- **2.7 — 0 %**. Tarjeta de resultado con «Deshacer» y «Editar», y marca «Por revisar». — Estado: Pendiente de la puerta de la fase anterior.
- **2.8 — 0 %**. Captura por voz manteniendo presionado, con cancelar deslizando y vibración. — Estado: Pendiente de la puerta de la fase anterior.
- **2.9 — 0 %**. Medición: resultado de `npm run eval` y guion para que el propietario cronometre las dos capturas. — Estado: Pendiente de la puerta de la fase anterior.

## Fase 3 — Centro de control

0/11 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **3.1 — 0 %**. Catálogo de 60 plantillas y su activación con elección de titular (pasos 5 y 6 de 6.1). — Estado: Pendiente de la puerta de la fase anterior.
- **3.2 — 0 %**. Recurrencia: generación de tareas a 14 días y proceso diario. *Hecho cuando:* hay pruebas del núcleo para cada tipo de recurrencia, incluido fin de mes y año bisiesto. — Estado: Pendiente de la puerta de la fase anterior.
- **3.3 — 0 %**. Plazos obligatorios por ámbito y recordatorios por defecto (se guardan y se listan en la app; el envío al teléfono es la tarea 4.3). — Estado: Pendiente de la puerta de la fase anterior.
- **3.4 — 0 %**. Cálculo de avance en el núcleo (sección 6.8) con la prueba de cuadratura y el ejemplo de Emilia. — Estado: Pendiente de la puerta de la fase anterior.
- **3.5 — 0 %**. Pantalla Hoy, con los gestos, la respuesta inmediata y «Deshacer» de la sección 8.1. (Los bloques «Se viene» y «Tomas de hoy» se agregan en las fases 5 y 6.) — Estado: Pendiente de la puerta de la fase anterior.
- **3.6 — 0 %**. Modo Resolver. — Estado: Pendiente de la puerta de la fase anterior.
- **3.7 — 0 %**. Pantalla Familia y ficha de persona a cargo, con los anillos por ámbito y toda la edición de la sección 6.11 (tareas, responsabilidades, ámbitos, personas a cargo, plantillas propias). — Estado: Pendiente de la puerta de la fase anterior.
- **3.8 — 0 %**. Migración y pantallas de fichas de pago; puerto de pagos con adaptador manual; registro en `pagos`. — Estado: Pendiente de la puerta de la fase anterior.
- **3.9 — 0 %**. Buscar (sección 6.17). — Estado: Pendiente de la puerta de la fase anterior.
- **3.10 — 0 %**. Contacto en un toque (sección 6.16): hoja de persona al tocar un avatar, «Llamar», «WhatsApp» con mensaje según el contexto, y «Pedir su número». *Hecho cuando:* hay una prueba que comprueba los enlaces `tel:` y `wa.me` generados para cada contexto. — Estado: Pendiente de la puerta de la fase anterior.
- **3.11 — 0 %**. Recorrido automático de «una semana simulada»: una familia de 3 integrantes y 2 personas a cargo crea, completa, pospone y paga tareas durante 7 días. — Estado: Pendiente de la puerta de la fase anterior.

## Fase 4 — Reparto

0/7 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **4.1 — 0 %**. Migración y núcleo de propuestas (todos los estados y la regla «solo el destinatario responde») y de la tabla `avisos`. — Estado: Pendiente de la puerta de la fase anterior.
- **4.2 — 0 %**. Pantalla Avisos (se abre desde la campana de la cabecera) con las tarjetas de la sección 6.6 disponibles hasta ahora, el contador de no leídos, archivar y «Marcar todo como leído». — Estado: Pendiente de la puerta de la fase anterior.
- **4.3 — 0 %**. Avisos al teléfono según la sección 6.15: permiso con pantalla previa, categorías y canales en Perfil, silencio, máximo diario, agrupación, apertura del objeto exacto, y los programados «Tu día» y «Tu semana». («Resumen de la familia», reacciones, comentarios y «Para celebrar» se agregan en la Fase 8.) *Hecho cuando:* hay pruebas del núcleo para silencio, máximo, agrupación y horas programadas con el reloj de prueba. — Estado: Pendiente de la puerta de la fase anterior.
- **4.4 — 0 %**. Fórmula de carga en el núcleo, con el ejemplo de Ana y Pablo como prueba, y casos con 1, 3 y 6 integrantes y con apoyos. — Estado: Pendiente de la puerta de la fase anterior.
- **4.5 — 0 %**. Pantalla Equilibrio y «Cambiar lo acordado». — Estado: Pendiente de la puerta de la fase anterior.
- **4.6 — 0 %**. Sugerencia única de traspaso. — Estado: Pendiente de la puerta de la fase anterior.
- **4.7 — 0 %**. Guion y planilla para la prueba de comprensión con 5 personas. — Estado: Pendiente de la puerta de la fase anterior.

## Fase 5 — Anticipación

0/10 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **5.1 — 0 %**. Migración: cumpleaños en `integrantes` y `personas_a_cargo`, `va_al_colegio`, `seguimiento_meses`, y las tablas `fechas_clave`, `guiones`, `guion_pasos`, `sugerencias`, `plantillas_familia`. Datos iniciales: las 8 celebraciones y los 13 guiones de la sección 6.9. — Estado: Pendiente de la puerta de la fase anterior.
- **5.2 — 0 %**. Cálculo de fechas en el núcleo: cumpleaños (incluido 29 de febrero), domingo N de un mes, Pascua. *Hecho cuando:* pasan las pruebas con las fechas exactas de la sección 6.9. — Estado: Pendiente de la puerta de la fase anterior.
- **5.3 — 0 %**. Motor de anticipación en el núcleo, reglas R1, R2 y R3, con el puerto `reloj`. *Hecho cuando:* una prueba simula 365 días para una familia de ejemplo (2 corresponsables, 1 apoyo, 2 hijas, 1 mascota) y la lista de sugerencias coincide, día por día, con una lista esperada escrita a mano en la prueba. — Estado: Pendiente de la puerta de la fase anterior.
- **5.4 — 0 %**. Bloque «Se viene» en Hoy, tarjeta de sugerencia en Avisos, y «Armar el plan» con el titular sugerido. Incluye «Ahora no» y «No sugerir esto». — Estado: Pendiente de la puerta de la fase anterior.
- **5.5 — 0 %**. Pantalla «Fechas clave» dentro de Familia: activar y desactivar celebraciones, agregar fechas propias, ingresar períodos escolares, editar guiones. Y los pasos de cumpleaños y fechas clave en la creación de la familia (sección 6.1). — Estado: Pendiente de la puerta de la fase anterior.
- **5.6 — 0 %**. Regla R4 (seguimiento al cerrar) con su hoja de opciones y su texto fijo. — Estado: Pendiente de la puerta de la fase anterior.
- **5.7 — 0 %**. Reglas R5, R6, R7, R8, R9, R12 y R13, una prueba del núcleo por cada una. — Estado: Pendiente de la puerta de la fase anterior.
- **5.9 — 0 %**. Más de una casa (sección 6.18), parte 1: migración (`casas`, `estadias`, `estadia_excepciones`, `casa_id` en `integrantes`), función `casaDe` con sus 5 pruebas, hoja «Vivimos en más de una casa», pastilla «En [casa]», tira de 14 días y excepciones. *Hecho cuando:* además, una prueba confirma que con una sola casa ninguna pantalla muestra la palabra «casa» ni elementos de esta sección. — Estado: Pendiente de la puerta de la fase anterior.
- **5.10 — 0 %**. Más de una casa, parte 2: migración (`cosas_que_viajan`, `cambios_de_casa`), regla R14 con su prueba, hoja «Cambio de casa», tarjeta «[Nombre] llega hoy», etiqueta «En casa ese día», filtro «Mi casa» y la categoría de aviso «Cambio de casa». *Hecho cuando:* además, una prueba confirma que ninguna respuesta del servidor trae totales de noches por casa o por persona. — Estado: Pendiente de la puerta de la fase anterior.
- **5.8 — 0 %**. Regla R11 (resumen semanal) y «¿Lo armo igual que el año pasado?». — Estado: Pendiente de la puerta de la fase anterior.

## Fase 6 — Tratamientos

0/6 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **6.1 — 0 %**. Migración: `tratamientos` y `tomas`. Pantalla de consentimiento. — Estado: Pendiente de la puerta de la fase anterior.
- **6.2 — 0 %**. Núcleo: generar tomas (horas fijas y cada N horas), marcar dada y omitida, impedir la doble marca, avance del tratamiento, fin del tratamiento. *Hecho cuando:* hay pruebas para: cada 8 horas cruzando la medianoche, tratamiento de 7 días, sin fecha de término, dos marcas simultáneas, y ejecutar dos veces el proceso diario sin duplicar tomas. — Estado: Pendiente de la puerta de la fase anterior.
- **6.3 — 0 %**. Hoja «Agregar tratamiento» (los 6 campos de la sección 6.10 y ninguno más), pantalla del tratamiento con la línea de tiempo, y bloque «Tomas de hoy» en Hoy. — Estado: Pendiente de la puerta de la fase anterior.
- **6.4 — 0 %**. «Yo estoy a cargo» y los avisos de tomas: a la hora, a los 30 y a los 60 minutos, sin silencio ni máximo diario. Regla R10. — Estado: Pendiente de la puerta de la fase anterior.
- **6.5 — 0 %**. Editar, pausar, terminar y borrar un tratamiento. Suma de las tomas a la carga (sección 7.1). — Estado: Pendiente de la puerta de la fase anterior.
- **6.6 — 0 %**. Recorrido automático «relevo»: una integrante crea un tratamiento y marca la toma de la tarde; otro integrante toca «Yo estoy a cargo», ve la toma anterior con nombre y hora, y marca la de la noche; un tercero intenta marcarla de nuevo y ve el mensaje «Ya la marcó…». — Estado: Pendiente de la puerta de la fase anterior.

## Fase 7 — Presupuesto conjunto

0/5 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **7.1 — 0 %**. Migración: `presupuestos`, `presupuesto_lineas`, `aportes`, y los campos `pagado_por` y `ambito_id` en `pagos`. — Estado: Pendiente de la puerta de la fase anterior.
- **7.2 — 0 %**. Núcleo: crear y proponer un presupuesto, aceptarlo, copiar el del mes anterior, y los cálculos de pagado, por pagar, por ámbito y por integrante. *Hecho cuando:* pasa la prueba de cuadratura y hay pruebas para: aportes que no suman el total, un pago sin ámbito, un ámbito pasado de lo asignado y un mes sin presupuesto. — Estado: Pendiente de la puerta de la fase anterior.
- **7.3 — 0 %**. Las dos pestañas de Equilibrio («Carga» y «Presupuesto») y la hoja de 3 pasos para activarlo. — Estado: Pendiente de la puerta de la fase anterior.
- **7.4 — 0 %**. La pestaña Presupuesto completa (sección 6.12) y la pregunta «¿Quién lo pagó?» al confirmar un pago. — Estado: Pendiente de la puerta de la fase anterior.
- **7.5 — 0 %**. Privacidad: los integrantes «apoyo» no ven la pestaña; prueba de aislamiento para las tablas nuevas. — Estado: Pendiente de la puerta de la fase anterior.

## Fase 8 — Vida familiar

0/12 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **8.1 — 0 %**. Migración: `reacciones`, `comentarios`, `logros_obtenidos`, `silencios`, y los campos nuevos de `actividad` e `integrantes` (pausa). — Estado: Pendiente de la puerta de la fase anterior.
- **8.2 — 0 %**. Núcleo de Actividad: qué entra y qué no (sección 6.13), frases fijas, agrupación de 30 minutos, respeto de «Mostrar lo que hago». *Hecho cuando:* hay una prueba por cada fila de «qué aparece» y por cada elemento de «qué NUNCA aparece». — Estado: Pendiente de la puerta de la fase anterior.
- **8.3 — 0 %**. Pantalla Actividad con la tarjeta de actividad, separadores por día, carga por tramos y actualización suave (regla 19 de 9.2). — Estado: Pendiente de la puerta de la fase anterior.
- **8.4 — 0 %**. Reacciones: selector, doble toque, una por persona, no a lo propio, las 5 reacciones (4 donde no se ofrece «Me hizo reír»), y el botón «Comentar» al lado. Sonido «reacción». *Hecho cuando:* además, una prueba confirma que el servidor rechaza cualquier tipo de reacción fuera de los 5. — Estado: Pendiente de la puerta de la fase anterior.
- **8.5 — 0 %**. Comentarios en actividades y en tareas: hoja, editar, eliminar, silenciar. — Estado: Pendiente de la puerta de la fase anterior.
- **8.6 — 0 %**. Avisos de reacciones y comentarios (en la app y al teléfono, agrupados) y el programado «Resumen de la familia». — Estado: Pendiente de la puerta de la fase anterior.
- **8.7 — 0 %**. Logros: los 16 en el núcleo con su prueba, hoja de logro obtenido, pregunta de compartir, medallas en Perfil y «Ver todos». — Estado: Pendiente de la puerta de la fase anterior.
- **8.8 — 0 %**. Constancia de la familia y personal, «Estoy en pausa» y «Semana libre». *Hecho cuando:* hay pruebas para: semana con menos de 5 tareas, corte sin aviso, pausa que no corta, y que la constancia personal no sale en ninguna respuesta pedida por otro integrante. — Estado: Pendiente de la puerta de la fase anterior.
- **8.9 — 0 %**. «Para celebrar»: los 4 disparadores, máximo 1 al día, caducidad a las 48 horas. — Estado: Pendiente de la puerta de la fase anterior.
- **8.10 — 0 %**. Interruptores en Perfil: «Logros y constancia», «Mostrar lo que hago en Actividad», compartir logros. — Estado: Pendiente de la puerta de la fase anterior.
- **8.11 — 0 %**. Pruebas automáticas de los 8 resguardos (sección 12) y guion para la prueba de «sensación de vigilancia» con 5 personas. — Estado: Pendiente de la puerta de la fase anterior.
- **8.12 — 0 %**. Buen trato (sección 6.19): lista de palabras prohibidas con su prueba automática sobre el archivo de mensajes y las plantillas; texto de bienvenida de comentarios; pausa antes de enviar (con la lista de 6.19); «Ocultar para mí»; «Silenciar a…»; texto único al declinar; rol con etiqueta propia. Y el guion para la prueba de buen trato con 5 personas, de las cuales al menos 2 crían en dos casas. — Estado: Pendiente de la puerta de la fase anterior.

## Fase 9 — Pulido

0/9 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **9.1 — 0 %**. Movimiento (sección 10.3) y los 7 elementos de firma (sección 10.1) terminados en: Hoy, marcar «Hecho», modo Resolver, captura por voz, hojas inferiores. — Estado: Pendiente de la puerta de la fase anterior.
- **9.2 — 0 %**. Todas las transiciones entre pantallas de la sección 10.3, con grabaciones de pantalla como evidencia, y la cabecera a 60 cuadros por segundo. — Estado: Pendiente de la puerta de la fase anterior.
- **9.3 — 0 %**. Los 8 sonidos (sección 10.4) con su puerto, su interruptor y la regla de no superponerse; resultado de la prueba con el teléfono en silencio. — Estado: Pendiente de la puerta de la fase anterior.
- **9.4 — 0 %**. Todos los gestos de la sección 8.1, cada uno con su botón visible equivalente y con el color y la palabra de la acción al deslizar. — Estado: Pendiente de la puerta de la fase anterior.
- **9.5 — 0 %**. Ilustraciones y los 5 estados de cada pantalla. — Estado: Pendiente de la puerta de la fase anterior.
- **9.6 — 0 %**. Accesibilidad: lector de pantalla (incluidas las reacciones con su nombre), foco, texto al 200 %. — Estado: Pendiente de la puerta de la fase anterior.
- **9.7 — 0 %**. Rendimiento hasta cumplir la meta. — Estado: Pendiente de la puerta de la fase anterior.
- **9.8 — 0 %**. Revisión visual pantalla por pantalla contra `docs/marca/GUIA-GRAFICA.pdf`, respondiendo la lista de verificación de su sección 14, con capturas en oscuro y en claro a 360 px. Lista de diferencias encontradas y corregidas. — Estado: Pendiente de la puerta de la fase anterior.
- **9.9 — 0 %**. Informe con la medición de todos los indicadores de la sección 12 que te tocan a ti, y guiones para los del propietario. — Estado: Pendiente de la puerta de la fase anterior.

## Fase 10 — Beta

0/5 tareas iniciadas formalmente; 0 %. El código base de muestra o de fase 1 no se cuenta como implementación funcional de esta fase.

- **10.1 — 0 %**. Términos, política de privacidad y documento de cumplimiento normativo (incluye el tratamiento de datos de salud de la sección 6.10, los datos de presupuesto de la sección 6.12, y los teléfonos, comentarios y reacciones, y las estadías y notas de cambio de casa de menores). — Estado: Pendiente de la puerta de la fase anterior.
- **10.2 — 0 %**. Exportar datos, eliminar cuenta y salida de un integrante (sus comentarios quedan como «Integrante que salió»; sus reacciones se borran). — Estado: Pendiente de la puerta de la fase anterior.
- **10.3 — 0 %**. Página de presentación pública. — Estado: Pendiente de la puerta de la fase anterior.
- **10.4 — 0 %**. Empaquetado de prueba para Google Play y App Store según la ruta aprobada en la Fase 0, e íconos y capturas en los formatos de ambas tiendas. Sin publicar. — Estado: Pendiente de la puerta de la fase anterior.
- **10.5 — 0 %**. Plan de lanzamiento y piezas para redes sociales. — Estado: Pendiente de la puerta de la fase anterior.

## Qué probar antes de la fusión

1. Abrir el enlace estable; entrar con Google y salir; volver a entrar. Si aparece protección Vercel, acceder con la cuenta autorizada. Si Google devuelve un error de redirección, registrar el mensaje sin compartir tokens.
2. Crear familia de prueba, verificar hogar y ocho ámbitos; invitar otra cuenta y verificar ambos teléfonos de prueba; no usar datos personales de menores.
3. Crear, editar, archivar y deshacer persona de prueba; recargar y comprobar persistencia, buscarla desde la cabecera.
4. Recorrer Hoy, Familia, Capturar, Equilibrio, Actividad, Buscar, Avisos, Perfil, ficha; probar cambio de tema, gesto de regreso, cabecera al desplazar y texto ampliado. Capturar aún no guarda.
5. Grabar pantalla sin datos identificables y comunicar problemas. Confirmar solo si todo funciona y escribir «apruebo la fase 1».

La fase 2 comienza con la migración de responsabilidades, tareas, capturas y trabajos IA (2.1), luego captura manual, cola offline, contrato de interpretación, evaluaciones, Gemini, resultado editable, voz y mediciones. No se implementa aún.

## Incidencia de entrada reportada tras la revisión

Pantalla blanca después de Google: alias de producción antiguo retorna null. Corrección de origen estable desplegada en preview `b1b8b1d`. Pendiente comprobar/agregar callback exacto en Supabase y repetir Google real; 1.5 no aceptada. Véase [documento de fase](fases/FASE-1.md). Las cifras globales anteriores son estimaciones, no aprobación formal.
