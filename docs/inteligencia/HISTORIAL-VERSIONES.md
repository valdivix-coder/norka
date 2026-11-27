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
