# Plan de pruebas · candidato 7.1

## 1. Sin proveedor (arnés, cada commit)

| Archivo | Qué prueba | Tipo |
|---|---|---|
| `tests/arnes/interpretacion-v7-1.test.ts` | Selector (6.0 por defecto; solicitud V6 idéntica byte a byte a la del adaptador original; V7.0 sin cambios); huellas congeladas 7.0; solicitud 7.1 exacta (instrucción, orden de propiedades del esquema, calendario derivado, límite de salida, sin expectativas); calendario en bisiesto y cruce de año; tres capas (interna, bruta, normalizada); rechazo de truncamiento, contrato y lote duplicado | Integración |
| ídem | Validador: herencia de día con solo hora (clase D1), anulación de fecha copiada sin marcador, no empeorar fecha correcta sin fragmento, convención de mismo día conservada, corrección inequívoca con minutos HH:MM, expresión vaga, fragmento no literal, día N con cruce de mes | Positivas y negativas |
| ídem | Entidades: beneficiario no mencionado anulado (clase D3), nunca rellenar, base contradictoria y El hogar sin ancla solo marcados, destinatario inválido o autor → nota; notas sin clasificar y título clínico; recurrencia inventada, `cada_n`, unidad explícita, tarea recurrente; números de título y montos omitidos; negación frente a «no olvidar» | Positivas y negativas |
| ídem | 300 salidas aleatorias con semilla: nunca agrega acciones, nunca rellena entidades nulas, cumple el contrato público, títulos intactos salvo clínico | Invariantes (propiedades) |
| ídem | Renombrar personas, minúsculas de voz y sin puntuación conservan fechas y horas | Metamórficas |
| ídem | El prompt no contiene frases ni nombres del examen; el desarrollo no copia el examen ni las demostraciones; expectativas válidas | Separación de datos |
| `tests/arnes/comparacion-v7-1.test.ts` | Orden balanceado reproducible; orden aplicado por caso; ritmo 4,5 s; 429 detiene; 503 un reintento; regresión pareada; validador que empeora; alerta de invención; fallo de contrato detiene en aceptación y continúa en desarrollo | Evaluador simulado |

Pruebas de mutación: no hay herramienta de mutación instalada (no se agregan dependencias, regla 9.2.13). Las aserciones son específicas por regla para que un cambio de comportamiento las rompa. Puntaje de mutación: NO VERIFICADO.

## 2. Con proveedor (CI, secreto `GEMINI_API_KEY`, solo sintético)

Workflow `.github/workflows/evaluacion-v7-1.yml`, activado al modificar `evals/solicitud-v7-1.json` en `fase-2`.

1. **Desarrollo (antes de congelar, nunca aceptación):** `desarrollo-v7-1` (39 frases) y `desarrollo-v7-1-catalogo` (10 frases de catálogo propio). Ambos brazos, cobertura completa salvo 429. Sirve para falsar H1–H6 sin tocar el examen.
2. **Congelación:** `CONGELACION-V7.1.json` con SHA-256 de instrucción, sufijos, esquemas, validador, validador base 7.0 y adaptador. El workflow verifica las huellas antes de la aceptación.
3. **Aceptación A/B individual:** corpus oficial intacto, `gemini-3.5-flash-lite` fijo, sin respaldos, temperatura 0, orden balanceado por semilla, ≥4,5 s entre solicitudes, un reintento ante 503/timeout, 429 detiene. Paradas: regresión pareada en cualquier capa o criterio, validador que empeora, alerta de invención, cobertura incompleta.
4. **Medición de tokens de entrada** con `countTokens` (misma entrada, ambos brazos), además de `usageMetadata` por solicitud.

## 3. Puertas (sin cambios respecto del encargo)

50/50 válidas por brazo; principal y estricta ≥45/50, bruta y normalizada; cero regresiones frente a V6; cero casos empeorados; discrepancias brutas cero según la aserción histórica; cero invenciones solo tras auditoría manual completa; mediana ≤ V6 +30 %; tokens de entrada ≤ V6 +10 %. La latencia formal de voz no se infiere de esta evaluación textual.
