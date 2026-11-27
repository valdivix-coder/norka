# Estado de la implementación

Se actualiza al cerrar cada tarea, con evidencia. Estados: pendiente · en curso · entregada (espera aprobación) · aprobada.

| Fase | Contenido | Estado | Evidencia | Documento |
| --- | --- | --- | --- | --- |
| 0 | Descubrimiento y diseño (sin código) | aprobada | Aprobación escrita de Simón el 20 de noviembre de 2026. Guía de 45 páginas, fuentes fechadas, siete respuestas de Simón en el apartado 2 y verificación documental en el apartado 9 | [FASE-0.md](fases/FASE-0.md) |
| 1 | Base | aprobada | PR #1 fusionado 75f8600, Vercel READY; 10/10 pruebas reales, vídeo revisado y arnés completo aprobado c2e33b6. | [FASE-1.md](fases/FASE-1.md) |
| 2 | Captura | en curso | V7.3 congelada (266549c): desarrollo 21/22 normalizada frente a 13/22 de V6; A/B oficial detenido en el caso 3 por una alerta del control (run 45995259777); arnés 260/260. v6 agrupada 48/50 (96%) principal y estricto; 2 discrepancias por acción; 175/175 arnés de la revisión evaluada; 180/180 arnés posterior y recorrido aprobado. Candidato 7.1 congelado (6deaaac): A/B individual detenido en caso 1 por regresión (run 45924281334); desarrollo 49 frases favorable; arnés 233/233. V6 predeterminada. Privacidad y multiresultado pendientes. | [FASE-2.md](fases/FASE-2.md) |
| 3 | Centro de control | pendiente | Preparación documental de 11 tareas; puerta fase 2 no cumplida. | [PREPARACION-FASE-3.md](fases/PREPARACION-FASE-3.md) |
| 4 | Reparto | pendiente | — | `docs/fases/FASE-4.md` |
| 5 | Anticipación | pendiente | — | `docs/fases/FASE-5.md` |
| 6 | Tratamientos | pendiente | — | `docs/fases/FASE-6.md` |
| 7 | Presupuesto conjunto | pendiente | — | `docs/fases/FASE-7.md` |
| 8 | Vida familiar | pendiente | — | `docs/fases/FASE-8.md` |
| 9 | Pulido | pendiente | — | `docs/fases/FASE-9.md` |
| 10 | Beta | pendiente | — | `docs/fases/FASE-10.md` |

El detalle y los criterios de «hecho cuando» de cada tarea están en la sección 13 de `docs/PROMPT-MAESTRO.md`. Si esta tabla y el prompt maestro difieren, manda el prompt maestro.

Tarea 1.6: entregada técnicamente; integración de acciones de creación/invitación en 1.7 y de pantallas con datos reales en 1.8. La prueba real de Google de 1.5 fue aprobada por el propietario. Evidencia: `docs/fases/evidencia-1-6/`.

[Informe global por fases y tareas](INFORME-IMPLEMENTACION.md).


## V7.0 · Auditoría independiente — punto de parada

Paquete de cinco documentos recibido en 78a37c6, V6 y corpus oficial intactos. Pruebas reproducidas en CI aislado: https://github.com/valdivix-coder/norka/actions/runs/45913820767 (69/69, 72/72, 20/22 mutaciones detectadas, oficial/desarrollo 50/50, contrato 50/50). Contraejemplo adicional confirmado en rojo: «mañana a las 09:30» produce 09:00, clase inequívoca. PUNTO DE PARADA: no integrar ni llamar a Gemini. Ver docs/inteligencia/AUDITORIA-RECEPCION-V7.md para hallazgos, decisiones y reversión. Esperar respuesta del propietario para corregir prototipo sin editar originales. V6 sigue operativa, fase 2 abierta.


## V7.0 corregida y V7.1 del encargo · integración experimental

El propietario aprobó corregir la copia sin alterar cinco originales ni V6. Auditoría aislada https://github.com/valdivix-coder/norka/actions/runs/45916109626 aprobada: 69/69, 72/72, 20/22, 50/50 oficial y desarrollo, 50/50 contrato, 12 grupos independientes y horario 09:30 correcto. Se incorpora candidato exclusivamente sintético con selector V6 por defecto, contrato interno y tres capas; no se activa proveedor familiar ni se llama a Gemini en esta revisión. Arnés mínimo/completo pendientes de confirmar. No congelar candidato hasta ambos verdes. Los límites de inferencia semántica y privacidad real siguen pendientes. Reversión: revertir commit de integración, o usar selector 6.0; no hay migración.


## V7.1 y V7.2 · candidato congelado y evaluación individual solicitada

Candidato 7.0 corregido, revisión c5c8378a: arnés mínimo https://github.com/valdivix-coder/norka/actions/runs/45916370142 y completo https://github.com/valdivix-coder/norka/actions/runs/45916370070 aprobados. Horarios HH:MM, meridiano, horas alternativas y JSON bruto preservado. V6 predeterminada y corpus oficial intactos. Congelación SHA-256 en docs/inteligencia/CONGELACION-V7.json; no cambiar candidato durante A/B. Arnés A/B f3061539: 195/195 (23 archivos), cinco pruebas simuladas aprobadas: alternancia, ritmo, 429, 503, regresión y fallo de esquema: https://github.com/valdivix-coder/norka/actions/runs/45916508438. Evaluación individual solicitada con modelo fijo Lite, semilla 20261126, separación mínima 4.5 s, sin respaldos. NO VERIFICADO: cuota vigente, exactitud V7, generalización, auditoría manual, costo real y cobertura. No declarar cero invenciones. Se conservan decisiones D-xx de manera versionada y pendientes de aprobación específica para uso real; no todas tienen controles de configuración independientes. D-03 sin tipo en examen; clasificación dudosa se abstiene, posible regresión que deberá probarse. Sin datos reales, facturación, migraciones ni fusión; reversión mediante selector 6.0. No iniciar lote si la evaluación individual se detiene.


A/B individual V7 detenido en caso 6 (run 45916614102): 6/50 válidas por brazo, 44 no ejecutadas por brazo; V6 4/6 bruta y 5/6 normalizada, V7 3/6 bruta y 5/6 normalizada. Regresión bruta de fecha corregida por validador; invención de beneficiario en caso 3 en ambas brutas, corregida en ambas normalizadas. Mantener V6 por defecto y esperar autorización para candidato V7.1. Evidencia y auditoría parcial en docs/inteligencia/INFORME-EVALUACION-V7.md. Sin nuevas llamadas ni modificaciones del candidato, sin cierre de fase 2.


## Traspaso autorizado · nueva iteración 7.1

El propietario aprueba optimizar el candidato a partir del A/B parcial y encarga la ejecución a un modelo de razonamiento avanzado. Fuente de verdad para la tarea siguiente: docs/inteligencia/ENCARGO-OPTIMIZACION-V7.1.md (A–F). Handoff actualizado; ZIP sintético 15162493127 verificado y resultados contrastados. V6 y V7.0 congeladas, V6 por defecto. No se ha escrito código nuevo de 7.1 ni realizado llamadas adicionales en este traspaso. Estado previo V7.0: 3 etapas completas, 6/50 pares de evaluación y auditoría parcial; no aprobado. El nuevo encargo A–F está definido, ejecución pendiente (0/6). El modelo receptor debe documentar resultado y próximo paso en TRASPASO-V7.1.md. Reversión del traspaso: revertir commit documental; no afecta producción, datos, contrato ni main.


## V7.2 · ejecución autorizada

D-19: repetir una vez ambos brazos ante regresión ordinaria; detener y conservar primera muestra y diagnóstico, incluso si no se reproduce. No se repite ante alerta de invención o empeoramiento del validador. D-03: tipos explícitos opcionales únicamente en contexto de desarrollo sintético separado; examen oficial y payload V6 intactos. D-04: mismo día sin «próximo» o fecha explícita → fecha null y baja, conservar hora inequívoca. Próximo explícito +7. V7.2 en archivos nuevos, V6 predeterminada, V7.0 y V7.1 congeladas. Beneficiario contextual: recuperar vínculo escolar o financiero de persona nombrada sin inferir por catálogo. Ocho pruebas nuevas; primera revisión 6368e211 detectó fallo D04, corregido en 979e8ef3 sin modificar intención. Arnés 241/241, 26 archivos, run 45928130490 aprobado; arnés completo run 45928130458 pendiente al registrar. Se solicita diagnóstico dirigido de 12 casos (10 nuevos + 2 de resistencia previos), no aceptación. NO VERIFICADO: precisión real 7.2, cuota, generalización, tipos D03 con proveedor. No congelar ni solicitar examen oficial hasta comprobar desarrollo, ambos arneses y huellas; parar ante alerta o fallo según criterios. Reversión: seleccionar 6.0; no hay cambios de producción, migración, facturación, secretos ni main.


## V7.2 · Resultado de desarrollo y propuesta de laboratorio sintético

Run 45928250323 completó 12/12 pares: V6 8/12 bruta y normalizada; V7.2 9/12 bruta y 10/12 normalizada. Regresión El hogar sin ancla en compra genérica (38); error compartido en 29. D04 recupera fecha null/hora 09:30, pero planInterpretacion descarta la hora sin fecha. Entrada +10,11%, mediana +18,6%, salida +66,0%, Por revisar 33,3% vs 21,1%. No congelar para aceptación ni lanzar más solicitudes hasta resolver/autorizar siguiente paso. Arnés completo 45928130458 aprobado; ZIP original verificado. Ver docs/inteligencia/INFORME-EVALUACION-V7.2.md para detalle y propuesta de laboratorio. V6 referencia; IA de datos reales sigue deshabilitada. Sin main ni cambios técnicos.


## Traspaso V7.3 + laboratorio sintético

El propietario solicita que un modelo avanzado optimice la siguiente candidata primero y construya después el laboratorio. Encargo detallado: docs/inteligencia/ENCARGO-V7.3-LABORATORIO.md; handoff actualizado. Base 594c98a. Primera entrega A–E y segunda L1–L5, ejecución 0/5 cada una. Sin código nuevo ni llamadas a Gemini en este traspaso. V7.2 desarrollo 12/12 pares, 83,3% vs 66,7% V6 normalizada; no aceptación por regresión de atribución hogar. Laboratorio solo replay sintético, aislado, sin BD ni proveedor, privado o local, deshabilitado por defecto. No utilizar para eludir puntos de parada ni habilitar IA familiar. Reversión: revertir commit documental. Retomar desde A con evidencia y gates originales.


## Auditoría independiente V7.3

Contraste de artefactos originales y reejecución sin proveedor en 4d7efe9, run 45998802842: 260/260 arnés, 2/2 controles independientes, 61 salidas replay reproducen 55/61 aciertos estrictos con V7.3; 8/8 anclas diagnósticas coinciden. Desarrollo 21/22 vs 13/22 V6 y 14/22 V7.2. Aceptación detenida 3/50 por alerta control, además error candidato de hogar en pago no doméstico. Se recomienda V7.4 dirigido antes de repetir, decisión D21 y autorización laboratorio de replay separado; no reanudar Gemini ni construir interfaz hasta respuesta. Informe docs/inteligencia/AUDITORIA-INDEPENDIENTE-V7.3.md. 212 archivos técnicos anteriores intactos; sin cambios de candidata, producción, datos, main o umbrales.


## V7.4 y laboratorio independiente autorizados
D21 implementada y probada; V7.4 desarrollo run 46034647175: 11/12 (91,7%), frente a V6 10/12 y 7.3 9/12. 36 STOP; caso 6 omite pago, clase de resistencia pendiente y no iniciar examen oficial. Replay independiente 46035205237: 95/105 ambos validadores, cero empeorados. Arnés 266/266, completo aprobado. Informe docs/inteligencia/INFORME-EVALUACION-V7.4.md. Laboratorio local HTML, 83 capturas y 188 respuestas verificadas en 46034931052; actualización 7.4 a 95/224 en verificación. Guía LABORATORIO-IA.md y validación LABORATORIO-IA-VALIDACION.md. No main, datos reales, proveedor nuevo, BD ni facturación. V6 referencia sintética; IA familiar deshabilitada. No certificar 7.4; siguiente corrección de segmentación y criterios de omisión. Reversión archivos nuevos y selector 6.0.


## Laboratorio ampliado V7.4 · verificación final
Run 46035429311 aprobado en a153566: 95 capturas, 224 respuestas reales, cinco fuentes de desarrollo, exportación 1/1 y navegador aprobado (capas, selección V7.4, revisión local, 360/390/1280, claro/oscuro, 0 solicitudes externas). Artefacto 15216317095, SHA-256 HTML ec1eef23c8c5c48188402e6d54f99e84975526d4eb02546f2ffee6562f73cfef, descargado y verificado. No se publica ruta ni se habilita IA real. L1–L3 100%, L4/L5 75% estimados: 90% de entrega local; iPhone Safari, lector de pantalla, texto 200%, preview privada y fidelidad visual completa NO VERIFICADO. V7.4 4/5 etapas ejecutadas (80%), aceptación no iniciada por omisión de una acción de pago. Total orientativo 85% de ambas entregas con igual peso. Repositorio preservado, 234 archivos técnicos anteriores intactos, main sin cambio.


## V7.5 · cobertura de acciones y recuperación manual
Candidata 0724bfe, ajuste de lista de corpus ca1f72b, solicitud 2a630c6. Arnés 273/273 en 29 archivos, 7 nuevas pruebas, run 46037121770 aprobado; 46037388824 aprobado posterior a laboratorio. Evaluación real de desarrollo run 46037265864 iniciada, NO VERIFICADO: resultado, cobertura, cuota restante. No aceptación ni nuevas llamadas hasta evidencia y puertas de resistencia. V7.5 cambia prompt, reutiliza exactamente validador 7.4, añade métricas por cantidad de acciones y gate explícito de omisión/exceso; no modifica versiones previas. Laboratorio run 46037389083 aprobado: 95 capturas, 224 respuestas, cinco fuentes, cobertura por capa, referencia sintética, recuperación manual reversible sin cambiar respuesta ni puntuación, sin red. Artefacto 15219660612, ZIP SHA256 2f1506961c442b61523f17ceb2b1b1121793309c5c62f0a6c0c602cfe6e6ba5c, HTML 57b7d62f6533c3651548f225fab79445d60cb02bce696888c09694cb575f35ae. Sin datos reales, ruta pública, cambio de contrato o main. Se compararon 257 archivos técnicos previos: solo cinco archivos del laboratorio autorizados cambiaron; candidatos anteriores y corpus intactos. Reversión de laboratorio a 51169d6, selección de IA 6.0 por defecto. Pendiente prueba iPhone Safari, lector de pantalla, preview privada y futura integración segura real.


## Resultado V7.5
Run 46037265864 completo: V6 6/10, V7.4 7/10, V7.5 10/10 en desarrollo; 20/20 acciones V7.5, sin déficit/exceso; V6 24 y V7.4 21. 31 solicitudes, 30 válidas STOP y un 503 recuperado, una medición faltante; no certificar aceptación ni consumo total. Arnés 273/273, completo aprobado. Informe docs/inteligencia/INFORME-EVALUACION-V7.5.md. Próximo: resistencia dirigida y examen individual solo con criterios y cuota; no se inicia aquí. Laboratorio 95/224 con recuperación local aprobada, actualización 105/254 en prueba. V6 predeterminada, producción/main/corpus intactos.


## Plan transversal de inteligencia familiar por voz
Nuevo plan docs/inteligencia/PLAN-INTELIGENCIA-FAMILIAR-POR-VOZ.md: 6 niveles, 30 hitos verificables, pesos 15/20/20/20/15/10. Base 1/30 hitos, 3% ponderado del nuevo objetivo (no avance total app); V7.5 80% y laboratorio previo 90% estimado. Primera parte: resistencia iniciada 20de483, run 46039721333, pendiente de resultado. Laboratorio ampliado 105/254 validado en 46037861623; artefacto 15217737998. Auditoría sobre 367 acciones: 13 con cambios de campos/tipo/título al aplicar, 5 horas y 2 recurrencias no preservadas; 93 por revisar. Propuesta de arquitectura tipada, revisión antes de ejecución y expansión por fase funcional. §6.2 hoy guarda y crea antes de editar; requiere decisión explícita para cambiar a guardar original/revisar/confirmar acciones. Fase 3 0/11, preparación permitida, ejecución solo con puerta y aprobación escrita. Sin cambios a contrato, BD, proveedor, presupuesto ni main. No se inicia aceptación oficial en esta etapa.


Auditoría reproducible sin proveedor: `node --test scripts/auditar-aplicabilidad.test.mjs` (5/5 controles locales) y `node scripts/auditar-aplicabilidad.mjs /ruta/laboratorio-norka.html` sobre artefacto 15217737998. Resultado: 105 capturas, 254 respuestas, 367/367 acciones pareadas, 13 cambios, 93 por revisar. Script solo reporta cantidades, campos e identificadores de casos sintéticos; no imprime títulos/texto ni usa red. No se suma a los 273 tests del arnés, son 5 controles adicionales. No certifica equivalencia semántica o ejecución real.


## Resistencia V7.5 y preparación revisión
Run 46039721333 completo: V6 10/12, V7.4 12/12, V7.5 11/12; 20/20 acciones candidata, cero déficit/exceso, 36 STOP. Caso 10 regresión de ámbito (pago veterinario Mascotas vs Pagos y finanzas). Punto de parada: no oficial ni nuevas llamadas. Informe docs/inteligencia/INFORME-CONSOLIDACION-V7.5.md. Reparación runner del auditor (vitest, mismas pruebas) y prototipo puro de revisión en laboratorio, conserva reconocido y propuesta sin escrituras; pruebas CI pendientes. Avance formal L1 1/5, 3% ponderado; L2 trabajo parcial. V6 predeterminada, fase 3 0/11. No datos reales ni cambios contrato, main o BD.


## Autorización de clasificación financiera y revisión universal
Propietario aprueba ambas líneas. V7.6 experimental: solicitud V7.5 idéntica, validador adicional de pago literal con catálogo estándar y abstención conservadora. Motor de revisión local puro, edición y confirmación por lote sin escrituras. L2 hito 1 completado por aprobación del flujo de diseño; L2 restantes pendientes de prueba. Arnés anterior 285/285 confirmado. Replay V7.6 sobre 173 internas y arnés nuevo en verificación. No aceptación, no IA real, no fase 3. Ver docs/inteligencia/PLAN-V7.6-REVISION-UNIVERSAL.md.


## Cierre parcial V7.6 y revisión universal
Replay financiero 46042512690 aprobado: 156/173 vs 155/173, corrige caso 10 de resistencia, cero empeorados, misma solicitud V7.5 (no mejora bruta demostrada). Arnés 301/301 run 46042511640. Replay revisión 46042608442 aprobado: 367/367 reconocidas preservadas, 274 listas/93 pendientes, 202 lotes locales, 274 confirmadas y deshechas, sin efectos. Arnés 46042608295 falló por any en test nuevo, corregido tipo explícito; reejecución pendiente. L1 1/5 L2 2/5: 3/30 hitos, 11% ponderado (+8 pp); motor sin interfaz todavía. Informe docs/inteligencia/INFORME-V7.6-REVISION-UNIVERSAL.md. No aceptación ni fase 3, no llamadas nuevas ni cambios de versiones previas, BD, main o contrato. Próximo: editor del laboratorio y contraste financiero bruto/temporal antes de oficial.


## Revisión universal navegable y piloto de dos usuarios · 27-nov-2026
Cierre: c3657dc integra motor TypeScript real en HTML autónomo; d317e54 bloquea confirmación y cambio de captura durante edición y comprueba selección parcial de dos de tres acciones, deshacer y datos pendientes. Arnés 301/301 run 46070603308 aprobado; exportación y navegador 46070603304 aprobados (6 fuentes de desarrollo, 105 capturas, 254 respuestas, 360/390/1280 claro/oscuro, sin solicitudes HTTP/HTTPS ni errores JS). Artefacto 15232343591 ZIP SHA256 9b5e93ea24e190074bee3428555af895aebdeaf2d853659ee98faaea305d3050; HTML SHA256 36e32e907138a09cfd8a92fd473810a56d12845e57e2093761a41dcaaf509a36. Descarga y huellas comprobadas. Navegador completo anterior 46070468217 aprobado; posterior 46070603317 pendiente. Conserva todas las versiones y corpus; 286 archivos técnicos de referencia comparados, modificados exclusivamente .github/workflows/laboratorio-sintetico.yml, evals/laboratorio.eval.ts, src/laboratorio/laboratorio.css, src/laboratorio/laboratorio.js, src/laboratorio/plantilla.html, tests/navegador/laboratorio.py. Main 75f8600545dc6a7bc5a920a840146f33b880b21c intacta. Sin Gemini adicional, rutas públicas, datos reales, cambios BD ni contrato. Nivel 2 hito 3 aprobado (editor de todos campos, selección, confirmación local, undo, recorrido Chromium; recuperación manual permanece en panel comparativo separado): L1 1/5, L2 3/5, L3-L6 0/5, 4/30 hitos y 15% ponderado (+4 pp respecto de 11%). Hito L2.4 pendiente de voz, teléfono y accesibilidad completa; piloto privado por verificar. Guía docs/inteligencia/PILOTO-SINTETICO-DOS-USUARIOS.md; próximo contraste independiente de finanzas/tiempo y diseño de comandos de fase 3 (no implementación). Modelo avanzado aconsejado para auditoría previa a congelación, no para cambiar corpus ni reglas. NO VERIFICADO: Safari iOS, zoom 200%, lector de pantalla, uso humano, voz integrada, privacidad/ejecución real, examen oficial, cuota. Detalle en docs/inteligencia/INFORME-REVISION-UNIVERSAL-PILOTO.md. Reversión: revertir los seis archivos del laboratorio a be093a6; no alterar datos ni fase.


## Preparación de auditoría avanzada y catálogo de operaciones
Paquete docs/inteligencia/auditoria-universal-2026-11-27/ con encargo, manifiesto, catálogo de diseño 26 operaciones (ninguna habilitada para IA), puertas/entregables y pilotaje separado. Modelo avanzado trabaja rama independiente desde bdccc7c, no cambia corpus ni ejecuta Gemini. Auditoría pendiente. App familiar sin ruta Laboratorio; usar HTML autónomo verificado y entorno familiar ficticio solo si acceso comprobado. No fase 3, no cambio de contrato, BD, main, versión o presupuesto. L1 1/5, L2 3/5, 4/30 hitos, 15% ponderado; preparación no cuenta como nuevo hito. Navegador 46070603317 y arnés 46070783265 aprobados. Dos pruebas de integridad de catálogo añadidas; resultado pendiente. Próximo: piloto humano, auditoría y puerta de fase 2.
