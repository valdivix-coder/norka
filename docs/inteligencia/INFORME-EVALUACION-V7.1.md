# Informe de evaluación · candidato 7.1

27 de noviembre de 2026 · rama `fase-2` · **Resultado: PUNTO DE PARADA en el caso 1 del A/B individual (regresión bruta y normalizada frente a V6). 7.1 no pasa. V6 sigue predeterminada.** Fase 2 abierta.

## 1. Candidato evaluado

- Congelado en `6deaaac21091e871423fe9fc726dce1d8e3953bf` (`CONGELACION-V7.1.json`). Huellas verificadas en CI antes de generar (`evals/congelacion-v7-1.eval.ts`, aprobado).
- Instrucción SHA-256 `9aeb220e0e7fe003dc7c4aff1b980b5d051640c40f11f2068628946c1b9af035` (9.549 caracteres); esquema individual `75aa6cf3…` (2.144 caracteres); validador `0bca0663…`; validador base 7.0 `d8a28289…` (sin cambios); adaptador `1781ac7c…`.
- Calidad del software: arnés mínimo 233/233 (25 archivos) en local y en el workflow; arnés completo con navegador aprobado en CI para `15d7568` (45922944692), `efad13f` (45923854024) y el congelado `6deaaac` (45924268232). Localmente, `--completo` no corre porque falta axe-core: limitación del contenedor, no del código.

## 2. Aceptación · A/B individual sobre el corpus oficial

Run https://github.com/valdivix-coder/norka/actions/runs/45924281334 (commit de solicitud `d44c8d8`), artefacto 15165079784 (ZIP SHA-256 `65657e05b232294b5df3a46a3c3e1ba00bf187e19f4909bdea2ecacc3dde6401`). `gemini-3.5-flash-lite` fijo, sin respaldos, temperatura 0, semilla 20261127 con orden balanceado, corpus blob `8a1add2d…` intacto, prompt V6 blob `865b9191…`.

| Métrica (pares completos: 1 de 50) | V6 | 7.1 |
|---|---:|---:|
| Válidas / fallidas / no ejecutadas | 1 / 0 / 49 | 1 / 0 / 49 |
| Principal y estricta, bruta | 1/1 | 0/1 |
| Principal y estricta, normalizada | 1/1 | 0/1 |
| finishReason | STOP | STOP |
| Tokens entrada (countTokens, misma entrada) | 2.801 | 3.059 (+9,2 %) |
| Tokens entrada / salida (usageMetadata) | 2.801 / 240 | 3.059 / 207 |
| Latencia de la solicitud | 991 ms | 1.135 ms |

**Causa (auditoría manual del caso):** frase con dos acciones, una persona nombrada en la primera y un pago escolar en la segunda. V6 asignó la persona a ambas. 7.1 declaró `persona_base: "ninguna"` en el pago y dejó `persona_a_cargo: null` (confianza baja); el resto de campos (ámbito Pagos y finanzas, fechas 2026-12-01 10:00 y 2026-12-05, hora) coincide en ambos brazos. El validador no modificó nada (sin ajustes): la regresión es del modelo y no del validador. No es invención (es una omisión). No hay alertas automáticas.

**Diagnóstico:** al compactar la regla 2 de V6 se perdió su cláusula operativa «actividad escolar asociada a la única persona nombrada en esa secuencia, sin otro beneficiario», sustituida por «depende de algo suyo ya dicho en esta misma captura». Con la decisión explícita `persona_base`, el modelo aplica la definición más estricta. Era el riesgo previsto para H2 («se descarta si caen los referidos»).

**Hallazgo de proceso:** con prompt, modelo, temperatura y entrada idénticos, V6 falló este mismo caso en el A/B de 7.0 (run 45916614102: beneficiario omitido) y acertó ahora. La salida de Flash-Lite no es determinista entre corridas aun con temperatura 0, de modo que la puerta «cero regresiones» con una sola muestra por caso tiene ruido medible. No se cambió ningún umbral; se registra para decisión del propietario (§5).

**Cobertura:** 49 casos no ejecutados por brazo. No se afirma 50/50, ni precisión global, ni cero invenciones. Tras la parada no se hicieron más llamadas.

## 3. Desarrollo (antes de congelar; nunca aceptación)

| Corpus | n | V6 principal/estricta bruta | 7.1 principal/estricta bruta | 7.1 normalizada | Regresiones 7.1 |
|---|---:|---:|---:|---:|---:|
| desarrollo-v7-1 (run 45922944781) | 39 | 32 / 30 | 35 / 33 | 35 / 35 | 1 bruta (destinatario desconocido), corregida por el validador |
| desarrollo-v7-1-catalogo (run 45923853986) | 10 | 3 / 3 | 8 / 8 | 8 / 8 | 0 |

Detalle y auditoría por caso en `evidencia-v7-1/desarrollo-1.md` y `desarrollo-2.md`. La corrida 1 usó una instrucción previa (`db06ba42…`); la 2 usó la congelada con el validador anterior al último ajuste. El desarrollo no es ciego (lo escribió el mismo diseñador) y la muestra es pequeña.

## 4. Hipótesis: estado

| H | Estado | Evidencia |
|---|---|---|
| H1 alcance | Apoyada en desarrollo; sin datos de aceptación | Pares hereda / ninguno / común correctos en ambas capas (desarrollo 1, casos 1–3). En el caso oficial 1 las fechas de ambas acciones fueron correctas |
| H2 beneficiario | **Falsada en un caso de aceptación** | Sin invenciones por catálogo en desarrollo (29, 38), pero perdió un beneficiario contextual que V6 sí asignó |
| H3 salida compacta | Parcial | Salida por solicitud 131 (desarrollo 1) y 112 (desarrollo 2) frente a 156 de 7.0: −16 % y −28 %; no se alcanza −25 % de forma estable. Mediana +12,6 % y +8,2 % frente a V6, dentro de +30 % |
| H4 pago | Apoyada en desarrollo | Pagos escolares, de salud y de servicios correctos (4, 6, 21, 31; catálogo 1). En aceptación, ámbito correcto en el caso 1 |
| H5 sin abstención por tipo | Sin datos de aceptación | En desarrollo, compras de alimento y arena correctas; un error inverso (corte de pelo de un hijo → Mascotas) |
| H6 confianza | No apoyada | Por revisar: 21,3 % frente a 10,6 % de V6 en desarrollo 1 (parte por la convención de mismo día, parte por un falso positivo del validador ya corregido) |
| Tokens de entrada | Dentro del límite, con margen estrecho | +9,2 % (countTokens) y +8,5 % / +9,3 % (usageMetadata de desarrollo) frente a V6 +10 % |

## 5. Recomendación

1. **No** pasar a un conjunto ciego ni a lotes. Mantener V6.
2. Iterar **7.2** como versión nueva (7.1 congelado, sin modificarlo), con un solo cambio dirigido: restaurar literalmente en la definición de `referida` la cláusula de V6 (actividad escolar o pago asociado a la única persona nombrada en la secuencia, sin otro beneficiario), y agregar un par mínimo de desarrollo nuevo, no tomado del examen. Verificar antes en desarrollo que no reaparezcan invenciones por catálogo.
3. **Decisión del propietario sobre la puerta de regresión individual (D-19, nueva):** dado el no determinismo medido, elegir entre (a) mantenerla con una muestra por caso (actual, máxima sensibilidad), (b) repetir automáticamente una vez los casos con discrepancia pareada y exigir que la regresión se reproduzca, o (c) otra regla. Sin su respuesta no se modifica el evaluador. Recomendación: (b), porque conserva la protección y distingue regresión estable de ruido.
4. Decisiones pendientes: D-03 (tipo de persona a cargo) y D-04 (mismo día de semana, cambiada a +7 con confianza baja en 7.1).
