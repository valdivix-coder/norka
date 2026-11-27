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
