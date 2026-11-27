# Historial de versiones de interpretación

- Evaluaciones 1–2: sin salidas válidas; limitaciones 503/429, no permiten estimar precisión.
- Eval 3: 38 válidas de 50, 5/50 estructurales. Run 45849355850.
- Eval 4: 14 válidas, 6/50 principales y estructurales. Run 45884544064.
- v5.0: run 45891159871, diagnóstico agrupado 50/50, 41/50 principal (82%), 39/50 estricto (78%), 8 campos discrepantes. 50 salidas Lite. Arnés posterior 168/168.
- v6.0: prompt con 15 ejemplos, revisión determinista conservadora de entidades/intervalos, auditoría por acción, métricas raw/normalizada. Evaluación por confirmar en INFORME-EVALUACION-V6.md.
- v7–v10: candidatos futuros condicionados a evidencia, no versiones entregadas. v7 a cargo de propuesta externa; integrar solo después de revisar. Ninguna prueba autoriza fase 3 por sí sola.

- Resultado v6 medido: 48/50 (96%) en ambas métricas, 50/50 válidas, 2 discrepancias por acción, 1 por contador anterior, 13 solicitudes. Run 45903011378; no aprobada por discrepancias y falta de evaluación individual.


## V7.1 y V7.2 · candidato congelado y evaluación individual solicitada

Candidato 7.0 corregido, revisión c5c8378a: arnés mínimo https://github.com/valdivix-coder/norka/actions/runs/45916370142 y completo https://github.com/valdivix-coder/norka/actions/runs/45916370070 aprobados. Horarios HH:MM, meridiano, horas alternativas y JSON bruto preservado. V6 predeterminada y corpus oficial intactos. Congelación SHA-256 en docs/inteligencia/CONGELACION-V7.json; no cambiar candidato durante A/B. Arnés A/B f3061539: 195/195 (23 archivos), cinco pruebas simuladas aprobadas: alternancia, ritmo, 429, 503, regresión y fallo de esquema: https://github.com/valdivix-coder/norka/actions/runs/45916508438. Evaluación individual solicitada con modelo fijo Lite, semilla 20261126, separación mínima 4.5 s, sin respaldos. NO VERIFICADO: cuota vigente, exactitud V7, generalización, auditoría manual, costo real y cobertura. No declarar cero invenciones. Se conservan decisiones D-xx de manera versionada y pendientes de aprobación específica para uso real; no todas tienen controles de configuración independientes. D-03 sin tipo en examen; clasificación dudosa se abstiene, posible regresión que deberá probarse. Sin datos reales, facturación, migraciones ni fusión; reversión mediante selector 6.0. No iniciar lote si la evaluación individual se detiene.


A/B individual V7 detenido en caso 6 (run 45916614102): 6/50 válidas por brazo, 44 no ejecutadas por brazo; V6 4/6 bruta y 5/6 normalizada, V7 3/6 bruta y 5/6 normalizada. Regresión bruta de fecha corregida por validador; invención de beneficiario en caso 3 en ambas brutas, corregida en ambas normalizadas. Mantener V6 por defecto y esperar autorización para candidato V7.1. Evidencia y auditoría parcial en docs/inteligencia/INFORME-EVALUACION-V7.md. Sin nuevas llamadas ni modificaciones del candidato, sin cierre de fase 2.


## Traspaso autorizado · nueva iteración 7.1

El propietario aprueba optimizar el candidato a partir del A/B parcial y encarga la ejecución a un modelo de razonamiento avanzado. Fuente de verdad para la tarea siguiente: docs/inteligencia/ENCARGO-OPTIMIZACION-V7.1.md (A–F). Handoff actualizado; ZIP sintético 15162493127 verificado y resultados contrastados. V6 y V7.0 congeladas, V6 por defecto. No se ha escrito código nuevo de 7.1 ni realizado llamadas adicionales en este traspaso. Estado previo V7.0: 3 etapas completas, 6/50 pares de evaluación y auditoría parcial; no aprobado. El nuevo encargo A–F está definido, ejecución pendiente (0/6). El modelo receptor debe documentar resultado y próximo paso en TRASPASO-V7.1.md. Reversión del traspaso: revertir commit documental; no afecta producción, datos, contrato ni main.


## Candidato 7.1 (27-nov-2026)

Congelado en `6deaaac` (`CONGELACION-V7.1.json`). Desarrollo real: 39 frases (V6 32/30 bruta, 7.1 35/33) y 10 de catálogo propio (V6 3/3, 7.1 8/8); no son aceptación. A/B individual oficial (run 45924281334): parada en el caso 1 por regresión frente a V6 (beneficiario contextual omitido por `persona_base: ninguna`), en las capas bruta y normalizada; 1/50 pares, 49 no ejecutados por brazo. No aprobado. V6 sigue predeterminada. Próximo: 7.2 con un único cambio dirigido, solo con autorización (ver TRASPASO-V7.1.md).


## V7.2 · ejecución autorizada

D-19: repetir una vez ambos brazos ante regresión ordinaria; detener y conservar primera muestra y diagnóstico, incluso si no se reproduce. No se repite ante alerta de invención o empeoramiento del validador. D-03: tipos explícitos opcionales únicamente en contexto de desarrollo sintético separado; examen oficial y payload V6 intactos. D-04: mismo día sin «próximo» o fecha explícita → fecha null y baja, conservar hora inequívoca. Próximo explícito +7. V7.2 en archivos nuevos, V6 predeterminada, V7.0 y V7.1 congeladas. Beneficiario contextual: recuperar vínculo escolar o financiero de persona nombrada sin inferir por catálogo. Ocho pruebas nuevas; primera revisión 6368e211 detectó fallo D04, corregido en 979e8ef3 sin modificar intención. Arnés 241/241, 26 archivos, run 45928130490 aprobado; arnés completo run 45928130458 pendiente al registrar. Se solicita diagnóstico dirigido de 12 casos (10 nuevos + 2 de resistencia previos), no aceptación. NO VERIFICADO: precisión real 7.2, cuota, generalización, tipos D03 con proveedor. No congelar ni solicitar examen oficial hasta comprobar desarrollo, ambos arneses y huellas; parar ante alerta o fallo según criterios. Reversión: seleccionar 6.0; no hay cambios de producción, migración, facturación, secretos ni main.


## V7.2 · Resultado de desarrollo y propuesta de laboratorio sintético

Run 45928250323 completó 12/12 pares: V6 8/12 bruta y normalizada; V7.2 9/12 bruta y 10/12 normalizada. Regresión El hogar sin ancla en compra genérica (38); error compartido en 29. D04 recupera fecha null/hora 09:30, pero planInterpretacion descarta la hora sin fecha. Entrada +10,11%, mediana +18,6%, salida +66,0%, Por revisar 33,3% vs 21,1%. No congelar para aceptación ni lanzar más solicitudes hasta resolver/autorizar siguiente paso. Arnés completo 45928130458 aprobado; ZIP original verificado. Ver docs/inteligencia/INFORME-EVALUACION-V7.2.md para detalle y propuesta de laboratorio. V6 referencia; IA de datos reales sigue deshabilitada. Sin main ni cambios técnicos.


## Traspaso V7.3 + laboratorio sintético

El propietario solicita que un modelo avanzado optimice la siguiente candidata primero y construya después el laboratorio. Encargo detallado: docs/inteligencia/ENCARGO-V7.3-LABORATORIO.md; handoff actualizado. Base 594c98a. Primera entrega A–E y segunda L1–L5, ejecución 0/5 cada una. Sin código nuevo ni llamadas a Gemini en este traspaso. V7.2 desarrollo 12/12 pares, 83,3% vs 66,7% V6 normalizada; no aceptación por regresión de atribución hogar. Laboratorio solo replay sintético, aislado, sin BD ni proveedor, privado o local, deshabilitado por defecto. No utilizar para eludir puntos de parada ni habilitar IA familiar. Reversión: revertir commit documental. Retomar desde A con evidencia y gates originales.


## Candidato 7.3 (27-nov-2026)

Congelada en `266549c`. M1 hogar por acción (regla y validador por cláusula, D-20), M2 calendario D-04 en la representación y compactación (instrucción −4,6 %). Desarrollo de tres brazos (run 45994191002): normalizada V6 13/22, 7.2 14/22, 7.3 21/22. Replay de validadores sobre 61 salidas reales: 50 → 55 estricta. Aceptación (run 45995259777): parada en el caso 3 por una alerta del control V6; 3/50 pares. No aprobada ni rechazada. Ver INFORME-EVALUACION-V7.3.md.


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
