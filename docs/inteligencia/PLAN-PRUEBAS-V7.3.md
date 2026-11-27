# Plan de pruebas · candidato 7.3

## Sin proveedor (arnés)
- `tests/arnes/interpretacion-v7-3.test.ts` (19): selector con 6.0 por defecto y solicitud de 7.2 idéntica a su selector original; solicitud 7.3 exacta (instrucción, esquema ordenado igual a 7.1, calendario D-04 sin el día de hoy y con `proximo_mismo_dia`); calendario en bisiesto y fin de año; rechazo de truncamiento y de lote duplicado; M1 ancla de hogar (segmentación sin dividir compuestos; anula compra sin ancla; conserva compra para la casa, bien común sin la palabra casa y compuestos; solo marca acciones que no son compras; metamórfica de mayúsculas y puntuación); M2 (mismo día → null conservando la hora; próximo +7 con minutos); 300 salidas aleatorias (nunca agrega acciones, nunca rellena nulos, contrato válido); guarda de replay sobre 61 salidas reales (corrige 29 y 38, sin empeoramientos fuera del cambio D-04); separación de datos (prompt y desarrollo sin textos ni nombres oficiales); evaluador simulado (orden balanceado o permutado reproducible, tres brazos con ablación, aceptación solo 6.0 vs 7.3, D-19 con regresión reproducida, 429, capa aplicable y métricas de hogar).
- Pruebas previas intactas: 241 → 260.

## Con proveedor (CI, `evaluacion-v7-3.yml`, solicitud `evals/solicitud-v7-3.json`)
1. Desarrollo de tres brazos (6.0, 7.2 y 7.3) sobre `desarrollo-v7-3` (22 frases): hecho, run 45994191002.
2. Congelación con huellas (`CONGELACION-V7.3.json`), verificadas antes de la aceptación.
3. Aceptación 6.0 vs 7.3: puertas y paradas idénticas a las de 7.2, incluida D-19. Hecho y detenido en el caso 3 (run 45995259777) por una alerta del control.

## Replay (sin proveedor)
- `.github/workflows/exportar-replay.yml` convierte artefactos de desarrollo en fixtures con SHA-256 (rechaza el corpus oficial).
- `evals/replay-validadores.ts` aplica los validadores 7.1, 7.2 y 7.3 a las mismas salidas brutas reales.

## Puertas (sin cambios)
50/50 válidas; ≥45/50 principal y estricta, bruta y normalizada; cero regresiones; cero validador que empeora; contadores históricos en cero; cero invenciones tras auditoría; mediana ≤ V6 +30 %; entrada ≤ V6 +10 %.
