# Plan de pruebas · V6 vs V7 (candidato)

Estado: **protocolo, no ejecutado contra Gemini.** Lo único medido hasta ahora son las pruebas locales del prototipo determinista (§2). Ningún resultado de este plan puede declararse antes de ejecutarlo; si la cuota bloquea, los casos se registran como **no ejecutados**, nunca simulados.

## 1. Preguntas que debe responder

1. ¿V7 elimina la clase de error de alcance temporal y de compra para mascota **sin perder** lo que V6 ya acierta?
2. ¿Cuánto aporta el modelo solo (bruta) y cuánto el validador (normalizada)?
3. ¿Cuánto cuesta (tokens, latencia, fallos de esquema, tasa Por revisar)?
4. ¿Generaliza a frases nuevas que nadie del equipo de prompts vio?

## 2. Etapa 0 · pruebas locales sin proveedor (ya ejecutadas en esta entrega)

Ejecutadas en un directorio de trabajo aislado con Node 22 y `tsx`, sin red ni proveedor:

| Prueba | Resultado medido | Qué demuestra | Qué NO demuestra |
|---|---|---|---|
| Calendario, hora, recurrencia, montos (`calendario.test.ts`) | 69/69 | Mismo día, fin de año, bisiestos (2028, 2027, 2100, 2000), herencia de día y mes, convenciones | Nada del modelo |
| Traducción interna → pública de los 50 casos de ejemplo (`validador.test.ts`) | 50/50 idénticos al esperado, confianza incluida | Coherencia entre ejemplos, contrato y validador | Que Gemini produzca esa salida |
| Mutaciones que simulan errores del modelo | 20/22 neutralizadas o marcadas; 2/22 no detectables (ámbito semántico Compras vs Mascotas y vs Colegio), tal como se esperaba | Alcance del código | Frecuencia real de esos errores |
| Consistencia del código con etiquetas existentes, con evidencia escrita a mano (`regresion.test.ts`) | Oficial 50/50 y desarrollo 50/50 sin cambio de campos; solo bajan 4 y 1 confianzas a propósito | El validador no rompe respuestas correctas | Precisión del modelo |
| Esquema interno (`contrato.test.ts`) | 50/50 referencias válidas; orden de propiedades conservado en el JSON Schema generado | Contrato implementable con zod del repo | Que Gemini respete el orden |

Al integrar, estas pruebas pasan al arnés (`tests/arnes/`) y el arnés existente (180/180 en 9d9b63c) debe seguir verde. Si una prueba se pone en rojo, se corrige el código, no la prueba.

## 3. Etapa 1 · integración candidata (modelo de desarrollo, rama de fase 2)

1. Añadir archivos V7 sin tocar V6 (lista en `PROMPT-OPERATIVO-V7.md` §8).
2. Selector de versión explícito; por defecto V6.
3. `npm run arnes` y `npm run arnes -- --completo` verdes; registrar run.
4. Congelar candidato: hash del commit y SHA-256 de la instrucción V7, del esquema interno y del validador. **No se modifican después de iniciar la etapa 2**; cualquier cambio crea V7.1 y reinicia la comparación.

## 4. Etapa 2 · A/B sintético controlado V6 vs V7

### 4.1 Variables fijas

| Variable | Valor |
|---|---|
| Corpus | `evals/captura-cl.json`, blob 8a1add2d3bda79cd82db2bfc9166a501aaec5ca6, 50 casos, expectativas intactas |
| Reloj | `2026-11-26T12:00:00-03:00` del corpus |
| Modelo | `gemini-3.5-flash-lite` **fijo**, sin respaldos (`respaldos=[]`). Si responde otro modelo o hay rotación, el caso se excluye y se declara |
| Configuración | temperatura 0; mismo timeout; `thinkingConfig` por defecto en ambos brazos |
| Brazo A | V6 exacta de 3030411 (instrucción, contrato §6.2, `revisarInterpretacion`) |
| Brazo B | V7 congelada (instrucción, calendario derivado, contrato interno, `validarV7`), personas como lista de nombres (sin `tipo`) |
| Tamaño | Primario: individual (1 frase por solicitud). Diagnóstico: lote de 5, mismas particiones en ambos brazos |
| Orden | Alternado por caso con orden de brazo aleatorizado con semilla fija y registrada (A-B, B-A, …) para repartir deriva del proveedor |
| Ritmo | ≥ 4,5 s entre solicitudes (NO VERIFICADO: límites vigentes del plan gratuito; consultar la consola antes y anotarlos) |
| Presupuesto | Individual 100 solicitudes válidas (50 × 2); lote 20 (10 × 2); como máximo 1 reintento por caso ante 503/timeout; ante 429 se detiene y se registra el resto como no ejecutado. Sin facturación |

### 4.2 Métricas (denominador 50, por brazo, bruta y normalizada)

- **Cobertura:** válidas / intentadas / no enviadas / fallidas por causa (HTTP, timeout, JSON, Zod interno, Zod público, lote incompleto). La cobertura no es precisión.
- **Principal (§12):** persona, ámbito, fecha y hora correctos → meta ≥ 45/50.
- **Estricta:** además tipo, recurrencia y destinatario → meta interna ≥ 45/50.
- **Por acción y por campo:** emparejamiento uno a uno (`auditarAcciones`), discrepancias por campo, acciones omitidas y agregadas.
- **Invenciones (manual, obligatoria):** dos pasadas independientes sobre las 50 salidas brutas y normalizadas; checklist por elemento: ¿persona/destinatario nombrados en el texto?, ¿fecha y hora con fragmento propio?, ¿monto presente y sin números ajenos?, ¿intervalo y días escritos?, ¿negación o corrección respetadas? Discrepancia ≠ invención: se clasifica cada una (invención, alcance, clasificación, convención). **Cero invenciones solo se declara con esta revisión completa.**
- **Títulos y montos:** revisión de los 50 títulos.
- **Validador (solo B):** ajustes por motivo; casos que el validador corrigió (bruta mal → normalizada bien) y casos que empeoró (bruta bien → normalizada mal; debe ser 0).
- **Tasa Por revisar:** elementos con confianza baja o persona/ámbito null, sobre total de elementos.
- **Costo:** tokens de entrada, salida y razonamiento declarados por solicitud válida; mediana y p95 de latencia; las fallidas sin medición se reportan aparte, no como costo cero.
- **Estabilidad (si hay cuota):** segunda repetición individual de ambos brazos; casos que cambian de resultado entre repeticiones.

### 4.3 Comparación pareada

Tabla 2×2 por caso (A acierta/falla × B acierta/falla) en individual, principal y estricta. Prueba exacta de McNemar como referencia: con 50 casos y pocos pares discordantes **no habrá significación estadística**; por eso la decisión usa además regresiones, desarrollo y el conjunto ciego.

### 4.4 Conjuntos de desarrollo (reportar aparte, nunca como aceptación)

- `EJEMPLOS-DESARROLLO-V7.json`, solo los 30 casos `prueba` (los 20 `demostracion` pertenecen a pares que tienen un caso en el prompt y no cuentan).
- `evals/desarrollo-cl-v6.json` (50, no ciegos; sus etiquetas de mismo día de semana dependen de la convención aún no aprobada: reportar el caso 46 por separado).
- Mismo modelo, reloj de cada archivo y configuración.

### 4.5 Ablaciones opcionales (solo con cuota sobrante, una variable por vez)

V7 sin calendario derivado · V7 sin validador (bruta) · V7 con `tipo` de persona a cargo (D-03) · V7 con `thinkingConfig` bajo. Cada una contra V7 congelada, nunca contra V6.

## 5. Criterios de decisión

**V7 pasa a evaluación ciega solo si, en individual y con la misma cobertura que V6:**

1. Cobertura 50/50 válidas, sin rotación de modelo.
2. Principal ≥ 45/50 y estricta ≥ 45/50, **bruta y normalizada**.
3. Cero regresiones pareadas: ningún caso que V6 acierta en individual lo falla V7. Si aparece una, se analiza la causa y se itera (V7.1), no se promedia.
4. Cero casos empeorados por el validador.
5. Discrepancias por acción normalizadas = 0 y revisión manual sin invenciones; si hay discrepancias brutas, cada una clasificada.
6. Fallos de esquema ≤ V6; tokens de entrada ≤ V6 + 10 %; latencia mediana ≤ V6 + 30 % sin timeouts nuevos.

**Vuelta atrás inmediata a V6** (selector, sin revertir código) si: cualquier invención confirmada nueva; regresión pareada no explicada; cobertura < 50/50 por causas del esquema V7; salida truncada (`finishReason` distinto de STOP); aumento de latencia que dispare timeouts. Comparación siempre por versión registrada en el resumen (`version`, hash de instrucción).

**Nota sobre la puerta actual:** `evals/gemini.eval.ts` exige `porAccionBruta = 0` y `camposBrutosDiscrepantes = 0`. Con V7 la «bruta» es la salida traducida sin corregir: el validador no puede ayudar a pasar esa aserción. Mantenerla mide la calidad del prompt; la decisión de si la puerta del producto es la normalizada es del propietario (D-08).

## 6. Etapa 3 · generalización ciega

- 50 frases nuevas escritas y etiquetadas por un evaluador independiente **después** de congelar el candidato; nunca se muestran al ingeniero de prompts ni se usan para iterar ese mismo candidato.
- Al menos 15 de resistencia: negación, autocorrección, homónimos, nombres desconocidos, plazos compartidos y no compartidos, mismo día de semana, fin de año, montos, instrucciones maliciosas, catálogo personalizado, nota sin acción, privacidad.
- Meta aspiracional ≥ 95 % (no cambia la meta formal). Si se itera tras verla, ese conjunto deja de ser ciego y se encarga otro.

## 7. Informe por versión (plantilla)

Commit · fecha · versión y hash de instrucción · modelo por caso · modo y tamaño · cobertura · principal y estricta (bruta/normalizada) · discrepancias por acción y por campo · omitidas/agregadas · invenciones (manual, quién y cuándo) · títulos y montos · tasa Por revisar · ajustes por motivo · tokens y latencias · fallos y causas · cambios aplicados · pendientes · recomendación avanzar / no avanzar. Sin datos reales, sin facturación, fase 2 no cerrada por este informe.

## 8. Comandos (cuando esté integrado)

```bash
npm run arnes && npm run arnes -- --completo
GEMINI_EVAL_ACTIVA=1 GEMINI_MODELO=gemini-3.5-flash-lite GEMINI_EVAL_TAMANO=1 GEMINI_PROMPT_VERSION=6.0 npm run eval
GEMINI_EVAL_ACTIVA=1 GEMINI_MODELO=gemini-3.5-flash-lite GEMINI_EVAL_TAMANO=1 GEMINI_PROMPT_VERSION=7.0 npm run eval
```

`GEMINI_PROMPT_VERSION`, la desactivación de respaldos y la alternancia por caso son cambios propuestos al arnés de evaluación (no aplicados). La clave va solo en el entorno seguro de CI.
