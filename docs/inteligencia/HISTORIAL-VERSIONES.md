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
