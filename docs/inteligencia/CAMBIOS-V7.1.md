# Cambios del candidato 7.1 · diagnóstico, hipótesis y decisiones

27 de noviembre de 2026 · rama `fase-2` · base `7084036` (encargo A–F). V6 (blob `865b919`) predeterminada y V7.0 (`c5c8378a`) congelada: ninguno de sus archivos se modificó. Fase 2 abierta.

## 1. Verificación inicial (tarea A)

- HEAD de partida `70840363beff31f6edd4ae0f5abb53bb14ac17f4`, árbol limpio.
- Corpus oficial blob `8a1add2d3bda79cd82db2bfc9166a501aaec5ca6` (intacto). Prompt V6 blob `865b9191dbeff277e47a6730d5d48c6a3accc086` = `3030411`.
- `CONGELACION-V7.json`: instrucción, esquema fuente y validador 7.0 coinciden por SHA-256.
- No se confundió la «tarea V7.1 de integración» (historial) con este candidato 7.1.

## 2. Diagnóstico: por qué falló una regla que ya existía (hechos frente a hipótesis)

| # | Clase observada (6 casos reales, run 45916614102) | Hecho medido | Hipótesis causal (no medida) |
|---|---|---|---|
| D1 | Fecha inicial + acción siguiente con solo hora | V7.0 bruta: `tiempo:["a las cuatro"]`, `plazo_fecha:null`; V6 acertó | El contrato 7.0 pide que `tiempo` liste solo fragmentos *dentro de la evidencia de la acción* y el modelo deriva la fecha de esa lista; la regla de herencia (texto) queda subordinada a la representación. La representación causó la regresión. |
| D2 | Pago con destino escolar | V7.0 clasificó por destino (Colegio); V6 acertó | En 7.0 la prioridad está en una lista larga tras otras 8 reglas; el destino léxico («curso») domina. |
| D3 | Beneficiario sin nadie nombrado | Ambas brutas inventaron una persona del catálogo; ambos validadores la anularon | Ningún campo obliga a decidir *si hay* beneficiario antes de elegir *cuál*; el modelo completa el campo con el único candidato plausible. |
| D4 | Nota sin acción | 7.0 «Revisar captura», V6 resumen; ninguno conserva el texto | La excepción clínica mezclada en la regla de notas (7.0) empuja al título genérico. |
| D5 | Confianza | 7.0 bajó la confianza de una propuesta correcta | Reglas de baja confianza demasiado amplias («alcance incierto» automático, cobertura por palabras). |
| D6 | Costo | 7.0: salida +61,87 %, mediana +33,87 % (6 casos) | `evidencia` copia literal de cada acción: es el mayor costo de salida y no mejoró la precisión bruta medida (3/6 frente a 4/6). |
| D7 | Tipo de persona a cargo | El corpus no informa tipos | La regla 7.0 «si la comida podría ser humana o animal → null» predice regresiones en los casos etiquetados Mascotas (11 de 50 elementos esperados). |

Conflictos de documentos revisados: maestro §6.2 exige beneficiario contextual en el pago escolar mientras el operativo 7.0 prohibía herencia sin posesivo (riesgo ya señalado por la auditoría 7.0); el maestro especializado incluye alimento animal en Mascotas y la lista operativa V6 no; la convención «mismo día de semana» del calendario aislado (+7) contradice D-04 propuesta (null). Fuentes: `PROMPT-MAESTRO.md` §6.2, `PROMPT-OPERATIVO-V7.md` reglas 7 y 9, `AUDITORIA-RECEPCION-V7.md`, `src/data/prompt-captura*.ts`.

## 3. Alternativas evaluadas y decisión de arquitectura

| Alternativa | Decisión | Razón |
|---|---|---|
| Pulir el texto de 7.0 | Descartada | La causa D1 es de representación, no de redacción. |
| Calcular todas las fechas solo en código | Descartada como sustituto | La puerta bruta (D-08) mide la salida del modelo; el código no puede ocultar un error bruto. Se mantiene el cálculo determinista como validador. |
| Mantener `evidencia` literal | Descartada | Mayor costo de salida (D6) sin beneficio bruto medido; el validador conserva anclas literales vía `tiempo` y el texto. |
| **Decisiones explícitas y baratas antes del campo que fallaba** | **Adoptada** | `persona_base` (nombrada / referida / ninguna) antes de `persona_a_cargo`; `alcance` (propio / hereda / comun / ninguno) antes de `plazo_fecha`. Son enumeraciones de 1–3 tokens que obligan a decidir la existencia antes del valor, sin razonamiento visible. |
| Base de reglas | **V6 compactada** | V6 tiene la mejor evidencia (48/50 agrupado; 4/6 bruto individual). Se conservan sus reglas y se suman protecciones de 7.0 (descartes, HH:MM, unidades de recurrencia, nota, inyección). |
| Ejemplos | **12 nuevos, abreviados** | Familia nueva (Renata, Gaspar, Chispa); pares mínimos para D1–D4. Ninguno proviene del examen ni de demostraciones previas (prueba automática). |

## 4. Hipótesis falsables

| H | Predicción | Prueba discriminante | Se descarta si |
|---|---|---|---|
| H1 alcance | Con `alcance` explícito, la acción con solo hora hereda el día en la salida bruta sin aumentar copias a acciones sin marcador | Pares mínimos de desarrollo (hereda/ninguno/común) y A/B oficial | 7.1 bruto pierde herencias o copia fechas más que V6 |
| H2 beneficiario | `persona_base` reduce a cero las invenciones brutas por catálogo y mantiene el beneficiario referido | Pares «nombrada / referida / ninguna» y casos de rutina sin persona | Persisten invenciones brutas o caen los referidos |
| H3 salida compacta | Sin `evidencia`, salida ≤ V7.0 −25 % y mediana ≤ V6 +30 % | Tokens y latencia por solicitud en la corrida real | No se cumple el límite de mediana |
| H4 precedencia de pago | Regla a) con «aunque sea de colegio, salud o mascota» y par mínimo pago/compra escolar corrige D2 | Pares pago vs compra escolar | Algún pago escolar queda en Colegio |
| H5 sin abstención por tipo | Quitar la regla 7.0 de comida humana/animal evita regresiones Mascotas | A/B oficial, casos Mascotas | Hay regresiones Mascotas frente a V6 |
| H6 confianza | Lista cerrada de motivos de «baja» reduce Por revisar frente a 7.0 | Tasa Por revisar por elemento | La tasa no baja o se ocultan errores |

## 5. Responsabilidad IA frente a código

| Decisión | Responsable | Detalle |
|---|---|---|
| Segmentar acciones, tipo, beneficiario, ámbito, alcance temporal | IA | Semántica; el código no puede resolverla sin inventar. |
| Fechas y horas desde fragmentos literales | IA (bruto) + código (corrige solo si es inequívoco) | `resolverTiempo` de 7.0 (reutilizado sin cambios). Convenciones y ambigüedades: se conservan y se marcan. |
| Nombres, destinatarios y ámbitos fuera de lista o no mencionados | Código (anula) | Reglas V6. |
| Recurrencia | IA + código | El código anula repeticiones sin marcador, rechaza `cada_n`, corrige unidad explícita de una acción única. |
| Montos y números del título | Código (marca) | Global, no por acción: limitación declarada. |
| Negaciones | IA (descartes) + código (marca coincidencias) | El código no borra: podría ser la acción afirmada. |
| Datos clínicos en títulos de nota | Código (reemplaza) | D-10; no promete detectar todo dato clínico. |

## 6. Riesgos del validador revisados

Negación (marca, no borra); cobertura por palabras de 7.0 (eliminada: generaba Por revisar masivo); mayúsculas de voz (no se usa capitalización para decidir nombres); ancla El hogar (marca, no anula); montos por acción (global, marcado); recurrencia (anula solo si el texto no tiene ninguna marca de repetición); orden de propiedades (comprobado en la solicitud); notas clínicas (D-10); fechas alternativas, vagas y mismo día (conserva y marca, o anula si es vaga); formatos de hora (HH:MM conserva minutos). Riesgo nuevo: `alcance` mal declarado por el modelo. Mitigación: con `ninguno` solo se anula si no hay fragmentos literales; con otro alcance nunca se borra un plazo sin fragmento, solo se marca.

## 7. Decisiones D-01 a D-18

| D | Estado en 7.1 | Configuración |
|---|---|---|
| D-01 contrato interno en memoria | Adoptada (copia versionada 7.1) | No se persiste ni se registra fuera del artefacto sintético |
| D-02 calendario derivado | Adoptada | `calendario.proximos` de 7 días y `pasado_manana` |
| D-03 tipo de persona a cargo | **Pendiente del propietario** | Sin tipo en el examen: 7.1 no se abstiene por tipo ni infiere por nombre; si el contexto trae tipo, se usa. Limitación declarada |
| D-04 mismo día de semana | **Cambiada, requiere confirmación** | 7.1 usa la semana siguiente (+7) con confianza baja; el validador no la sobrescribe |
| D-05 «el próximo <día>» | Adoptada | Fecha de `proximos`, baja |
| D-06 horas 8–12/1–6/7 | Adoptada | No sobrescribe una hora explícita |
| D-07 al tiro / ayer | Adoptada parcial | «al tiro» = hoy |
| D-08 puertas bruta y normalizada | **Mantenida** | Umbrales originales sin cambio |
| D-09 corrección solo inequívoca | **Mantenida** | Lo demás se marca |
| D-10 nota no clínica | Mantenida | Título = texto; clínico → «Revisar captura»; política real pendiente, no habilitada |
| D-11 apodos | Sin cambio | No se agrega esquema |
| D-12 múltiples beneficiarios | Adoptada | null y baja, sin duplicar |
| D-13 declaración sin petición | Adoptada | tarea, baja |
| D-14 compra escolar específica | Adoptada | Colegio solo si es escolar |
| D-15 insumo de salud | Adoptada | Salud sin indicaciones |
| D-16 cada quince días | Adoptada | diaria cada 15 |
| D-17 límites de salida | Adoptada | 1024 individual / 4096 lote; truncamiento rechazado |
| D-18 solo sintético gratuito | Mantenida | Sin facturación ni datos reales |

## 8. Qué se conserva, qué cambia, reversión

Se conserva: V6 y V7.0 completas, contrato público §6.2, corpus y umbrales, base de datos, RLS, privacidad y proveedor. Cambia (solo archivos nuevos): `src/core/contracts/interpretacion-interna-v7-1.ts`, `src/data/prompt-captura-v7-1.ts`, `src/core/usecases/validar-interpretacion-v7-1.ts`, `src/data/gemini-sintetico-v7-1.ts` (incluye el selector 6.0 | 7.0 | 7.1, 6.0 por defecto), `evals/comparacion-v7-1.ts`, `evals/ab-v7-1.eval.ts`, corpus de desarrollo y pruebas. **Reversión:** no seleccionar 7.1 (el valor por defecto ya es 6.0) o revertir los commits de 7.1; no hay datos ni migraciones que deshacer.
