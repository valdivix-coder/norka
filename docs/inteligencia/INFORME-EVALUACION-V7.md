# Informe de evaluación V7 · estado de ejecución

Estado al registrar: in_progress, conclusión pendiente. NO VERIFICADO: métricas reales de Gemini V7; no se dispone aún del resultado de la ejecución. Este registro no certifica aceptación ni reemplaza el informe final V7.4.

## Evidencia técnica previa al A/B

- Prototipo corregido: 76e83638, run 45916109626. 69/69 calendario, 72/72 traducción y mutaciones, 20/22 mutaciones detectadas, 50/50 campos oficiales y 50/50 desarrollo con evidencia suministrada, 50/50 contrato, 12 grupos de resistencia. La pérdida de minutos reproducida en V7.0 se corrige.
- Candidato integrado y congelado: c5c8378ae4ebecc2f5eb1eb8cf11a5fa7c12368f. Arnés mínimo 45916370142 y completo 45916370070 aprobados. Pruebas adicionales de horas explícitas, medianoche, meridiano, alternativas y conservación de JSON bruto. V6 por defecto.
- Evaluador A/B: f3061539, arnés 195/195 (23 archivos; 10 pruebas de integración V7 y 5 de A/B), run 45916508438; recorrido completo 45916508461 aprobado.
- Prompt, validador, contrato público V6 y corpus oficial coinciden por blob con 3030411. Cinco originales del ingeniero intactos. Huellas de V7 en CONGELACION-V7.json. Instrucción corregida 9792 caracteres; NO VERIFICADO consumo de tokens hasta ejecución.
- Ejecución real individual solicitada en f8a09cad: https://github.com/valdivix-coder/norka/actions/runs/45916614102. Preverificación de hashes, corpus y arnés aprobada. Modelo fijo Lite, sin respaldos, semilla 20261126, 4500 ms mínimo entre solicitudes, un reintento ante HTTP 503/timeout; detención por 429, cobertura incompleta, regresión individual o validador que empeora. No se activa facturación ni se accede a datos reales.

## Resultados y próximos pasos

V6 agrupada histórica: 48/50 (96%), no equivalente a comparación individual. V7 proveedor: NO VERIFICADO. No comparar coberturas parciales. La auditoría manual de títulos, montos e invenciones queda pendiente de las salidas; no afirmar cero invenciones. No ejecutar lotes ni desarrollo hasta revisar la salida individual y puntos de parada. D-03 tipo no enviado; la abstención ante clasificación dudosa puede producir regresiones. D-xx son decisiones versionadas, no todas controles configurables independientes; privacidad real y título de notas requieren revisión antes de activar. Sin migraciones, RLS, pagos, secretos, cambios a main ni cierre de fase 2. Reversión: selector 6.0; conservar evidencia de V7 y no modificar el candidato durante la evaluación.


## 26-nov-2026 · A/B individual real: punto de parada

Run [45916614102](https://github.com/valdivix-coder/norka/actions/runs/45916614102), revisión f8a09cad, candidato c5c8378a. Artefacto [15162493127](https://github.com/valdivix-coder/norka/actions/runs/45916614102/artifacts/15162493127), SHA-256 del ZIP declarado por GitHub b9adf0e9f8f5d23c022a7fa45c97f0d6f370ec9dfa506b5110f873ea312ba45b. Logs y JSON original descargado e inspeccionado. Preverificación 195/195 aprobada; prueba real en rojo por detención prevista, no por fallo de proveedor. Modelo fijo gemini-3.5-flash-lite, sin respaldos, semilla 20261126. 6 pares válidos (12 solicitudes), 44 casos no ejecutados por brazo, 0 fallos HTTP/esquema, 0 reintentos. No extrapolar a los 50 ni equiparar con el 96% agrupado histórico.

| Métrica parcial (6 casos por brazo) | V6 | V7 |
|---|---:|---:|
| Principal/estricta bruta | 4/6 | 3/6 |
| Principal/estricta normalizada | 5/6 | 5/6 |
| Correcciones del validador | 1 | 2 |
| Empeoramientos del validador | 0 | 0 |
| Discrepancias por acción bruta / normalizada | 1 / 0 | 2 / 1 |
| Elementos Por revisar | 3/8 | 5/8 |
| Tokens entrada / salida | 16732 / 577 | 17896 / 934 |
| Mediana ms / p95 ms | 708.5 / 860 | 948.5 / 980 |

Revisión manual parcial de 12 respuestas brutas y 12 normalizadas (6 casos x 2 brazos; 8 elementos por brazo y capa). Emparejamiento principal y estricto: casos 2,4,5 ambos aciertan brutos y normalizados; caso 1 ambos fallan; caso 3 ambos fallan brutos y aciertan normalizados; caso 6 V6 acierta ambas capas, V7 falla bruta y acierta normalizada. Ninguna acción omitida/agregada. Caso 1: ambos omiten beneficiario Emilia en la segunda acción respecto del oráculo; V7 además clasifica cuota como Colegio en vez de Pagos y finanzas (clasificación). Caso 3: ambas brutas atribuyen Emilia sin mención en la frase; invención de beneficiario confirmada en ambas brutas, eliminada por sus validadores. Caso 6: V7 bruta omite fecha de la segunda acción pese a regla de herencia de hora; su evidencia temporal es «a las cuatro», y el validador restituye 2026-11-27, 16:00 correcto. Regresión bruta confirmada; no regresión normalizada en ese caso. Caso 5: V7 titula «Revisar captura», V6 «Lo del colegio», ninguna reproduce texto completo como solicita regla de nota no clínica; fuera de métrica principal/estricta, revisar. No hay montos explícitos en los seis casos, por lo que no permiten validar preservación de montos. NO VERIFICADO: 44 casos restantes, auditoría completa independiente, generalización, resultados agrupados. No certificar cero invenciones.

V7.0 no pasa. Mantener V6 predeterminada. No cambiar candidato congelado, no reanudar llamadas ni ejecutar lotes/desarrollo hasta autorización del propietario. Recomendar opción (b): nueva versión V7.1 del candidato, no confundir con tarea V7.1 de integración, con contraejemplos nuevos y sin copiar examen: beneficiario sin evidencia, herencia temporal explícita y prioridad financiera frente al destino del pago, y formato de nota no clínica. Confirmar D-08 (mantener ambas puertas) y D-09 (corrección inequívoca) sin modificar umbrales; D-10 para títulos de notas y D-03 si se autoriza ablación sintética separada. No alterar proveedor, privacidad, base de datos ni facturación. Reversión: seleccionar 6.0; se conserva evidencia. Fase 2 abierta.
