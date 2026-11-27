# Estado de la implementación

Se actualiza al cerrar cada tarea, con evidencia. Estados: pendiente · en curso · entregada (espera aprobación) · aprobada.

| Fase | Contenido | Estado | Evidencia | Documento |
| --- | --- | --- | --- | --- |
| 0 | Descubrimiento y diseño (sin código) | aprobada | Aprobación escrita de Simón el 20 de noviembre de 2026. Guía de 45 páginas, fuentes fechadas, siete respuestas de Simón en el apartado 2 y verificación documental en el apartado 9 | [FASE-0.md](fases/FASE-0.md) |
| 1 | Base | aprobada | PR #1 fusionado 75f8600, Vercel READY; 10/10 pruebas reales, vídeo revisado y arnés completo aprobado c2e33b6. | [FASE-1.md](fases/FASE-1.md) |
| 2 | Captura | en curso | v6 agrupada 48/50 (96%) principal y estricto; 2 discrepancias por acción; 175/175 arnés de la revisión evaluada; 180/180 arnés posterior y recorrido aprobado. Candidato 7.1 congelado (6deaaac): A/B individual detenido en caso 1 por regresión (run 45924281334); desarrollo 49 frases favorable; arnés 233/233. V6 predeterminada. Privacidad y multiresultado pendientes. | [FASE-2.md](fases/FASE-2.md) |
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
