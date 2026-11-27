# Traspaso V7.1 · para el agente que retome

**Estado al cerrar esta intervención (27-nov-2026): PUNTO DE PARADA.** El candidato 7.1 está congelado y su A/B individual de aceptación se detuvo en el caso 1 por una regresión frente a V6, en las capas bruta y normalizada. Se espera respuesta del propietario. **No hacer más llamadas a Gemini** hasta que responda. V6 sigue siendo la única versión predeterminada. Fase 2 abierta; nada fusionado en `main`.

## 1. Dónde está todo

| Dato | Valor |
|---|---|
| Rama | `fase-2` |
| Commit base del encargo | `70840363beff31f6edd4ae0f5abb53bb14ac17f4` |
| Candidato 7.1 congelado | `6deaaac21091e871423fe9fc726dce1d8e3953bf` |
| Solicitud del A/B | `d44c8d8d5a43b612379491dba07365a679d90ce2` |
| HEAD al terminar | commit documental posterior a `d44c8d8` (ver `git log`) |
| Fuente de verdad del encargo | `docs/inteligencia/ENCARGO-OPTIMIZACION-V7.1.md` |

Commits de esta intervención, en orden: `15d7568` (candidato en desarrollo), `46c845e` (diagnóstico y plan), `efad13f` (ajustes tras desarrollo), `6deaaac` (congelación), `d44c8d8` (solicitud A/B) y el commit documental final.

## 2. Avance por tarea (denominador: 6 tareas A–F del encargo)

| Tarea | Avance | Estado |
|---|---:|---|
| A Auditoría e hipótesis | 100 % | Hecha: `CAMBIOS-V7.1.md` §1–6 |
| B Diseño y desarrollo sin proveedor | 100 % | Hecha: prompt, contrato interno, validador, 49 frases de desarrollo, 38 pruebas nuevas, dos corridas reales de desarrollo |
| C Integración y congelación | 100 % | Hecha: selector 6.0 / 7.0 / 7.1 (6.0 por defecto), arnés 233/233, arnés completo en CI aprobado, `CONGELACION-V7.1.json` |
| D Evaluación controlada | 30 % | Evaluador auditado y mejorado; A/B ejecutado y detenido en 1/50 pares (punto de parada) |
| E Informe y decisión | 100 % de lo posible | `INFORME-EVALUACION-V7.1.md` con recomendación; la decisión final depende del propietario |
| F Entrega | 100 % | Este traspaso, handoff, historial, AHORA, estado y documento de fase actualizados |

Avance total ponderado ≈ 88 % (5,3 de 6 tareas). Lo pendiente es D, que está bloqueado por el punto de parada y no por trabajo sin hacer.

## 3. Archivos nuevos (V6 y V7.0 sin cambios)

- Código: `src/core/contracts/interpretacion-interna-v7-1.ts`, `src/data/prompt-captura-v7-1.ts`, `src/core/usecases/validar-interpretacion-v7-1.ts`, `src/data/gemini-sintetico-v7-1.ts` (incluye `crearGeminiPorVersion` y `VERSION_PREDETERMINADA = "6.0"`).
- Evaluación: `evals/comparacion-v7-1.ts`, `evals/ab-v7-1.eval.ts`, `evals/congelacion-v7-1.eval.ts`, `evals/vitest.v7-1.mts`, `evals/vitest.congelacion-v7-1.mts`, `evals/solicitud-v7-1.json`, `.github/workflows/evaluacion-v7-1.yml`.
- Corpus de desarrollo: `evals/desarrollo-v7-1.json` (39), `evals/desarrollo-v7-1-catalogo.json` (10); metadatos en `docs/inteligencia/EJEMPLOS-DESARROLLO-V7.1.json`.
- Pruebas: `tests/arnes/interpretacion-v7-1.test.ts` (30), `tests/arnes/comparacion-v7-1.test.ts` (8).
- Documentos: `CAMBIOS-V7.1.md`, `PROMPT-MAESTRO-IA-V7.1.md`, `PROMPT-OPERATIVO-V7.1.md` (generado desde el código), `PLAN-PRUEBAS-V7.1.md`, `CONGELACION-V7.1.json`, `INFORME-EVALUACION-V7.1.md`, `evidencia-v7-1/desarrollo-1.md`, `evidencia-v7-1/desarrollo-2.md`.

## 4. Huellas (SHA-256)

- 7.1: instrucción `9aeb220e0e7fe003dc7c4aff1b980b5d051640c40f11f2068628946c1b9af035`; sufijo individual `c99e97e5…`; sufijo lote `fa235a3c…`; esquema `75aa6cf3…`; esquema lote `b53883d3…`; validador `0bca0663fbb93c46afd27c4a6576a93d86c51ba690f0a5dd9b7afb7a7413758e`; adaptador `1781ac7c…`. Completas en `CONGELACION-V7.1.json`.
- V6: prompt blob `865b9191dbeff277e47a6730d5d48c6a3accc086`; instrucción `2977309124e9…`; validador `cbb52099…`.
- V7.0: según `CONGELACION-V7.json` (verificado: coincide).
- Corpus oficial: blob `8a1add2d3bda79cd82db2bfc9166a501aaec5ca6` (intacto).

## 5. Ejecuciones reales (todas sintéticas, Lite fijo, sin respaldos, temperatura 0)

| Run | Tipo | Resultado |
|---|---|---|
| [45922944781](https://github.com/valdivix-coder/norka/actions/runs/45922944781) | Desarrollo, 39 frases | V6 32/30 bruta · 7.1 35/33 bruta, 35/35 normalizada. Artefacto 15165543123 |
| [45923853986](https://github.com/valdivix-coder/norka/actions/runs/45923853986) | Desarrollo, catálogo propio, 10 | V6 3/3 · 7.1 8/8. Artefacto 15165492608 |
| [45924281334](https://github.com/valdivix-coder/norka/actions/runs/45924281334) | **Aceptación, oficial** | **Parada en el caso 1:** V6 1/1, 7.1 0/1 en ambas capas. 1 de 50 pares. Artefacto 15165079784 |

Solicitudes a Gemini en total: 78 + 20 + 2 = 100 de generación, más 2 de `countTokens`. No hubo 429, 503 ni truncamientos; los 100 `finishReason` fueron STOP. Cuota gratuita restante: NO VERIFICADO. No se activó facturación.

## 6. Hechos medidos frente a hipótesis

- **Medido:** regresión de beneficiario contextual en el caso oficial 1. En desarrollo, 7.1 supera a V6 (49 frases, sin ceguera). Tokens de entrada +9,2 % (countTokens). Mediana de desarrollo +8 % a +13 %. Salida −16 % a −28 % frente a 7.0. Por revisar más alto que V6 en desarrollo 1. V6 no es determinista entre corridas en el caso 1.
- **Hipótesis no verificadas:** que restaurar la cláusula de V6 corrija la regresión sin reintroducir invenciones; que 7.x supere a V6 en los 50 oficiales; generalización ciega; latencia de voz.

## 7. Decisiones que requieren al propietario

1. **D-19 (nueva):** cómo tratar el no determinismo en la puerta de regresión individual. Opciones: (a) dejarla como está; (b) repetir una vez los casos con discrepancia y exigir que se reproduzca (recomendada); (c) otra regla. No cambia umbrales.
2. **Autorizar 7.2:** versión nueva con un único cambio dirigido (ver §8).
3. **D-03:** tipo de persona a cargo (el examen no lo trae).
4. **D-04:** «el <día>» dicho ese mismo día. 7.1 usa +7 con confianza baja; requiere confirmación.

## 8. Siguiente paso concreto (solo con autorización)

1. Crear `src/data/prompt-captura-v7-2.ts` copiando 7.1. En la regla 4, definición de `referida`, agregar literalmente la cláusula de V6: «o es una actividad escolar o un pago asociado a la única persona nombrada en esta captura, sin otro beneficiario». Agregar un par mínimo nuevo de desarrollo con: persona nombrada + pago de su colegio sin posesivo → referida; frente a: nadie nombrado + pago escolar → ninguna. No usar textos del examen.
2. Correr desarrollo (`evals/solicitud-v7-1.json` con modo desarrollo, tras extender el workflow y el selector a 7.2) y confirmar que no reaparezcan invenciones por catálogo (casos 29 y 38 de desarrollo-v7-1).
3. Congelar 7.2 y repetir el A/B individual desde cero, según la decisión D-19.

## 9. Comandos reproducibles

```bash
git checkout fase-2 && npm ci
npm run arnes                                   # 233/233
npx vitest run --config evals/vitest.congelacion-v7-1.mts   # huellas 7.1
# Evaluación real (solo CI, secreto GEMINI_API_KEY): editar evals/solicitud-v7-1.json
#   {"modo":"desarrollo"|"aceptacion","corpus":"desarrollo-v7-1"|"desarrollo-v7-1-catalogo"|"desarrollo-v6"|"oficial","semilla":N}
#   y hacer push a fase-2; workflow .github/workflows/evaluacion-v7-1.yml
```

## 10. Restricciones vigentes

Sin datos reales, sin facturación, sin cambio de proveedor, sin cambios al contrato público, a la base de datos, a RLS, a los secretos ni a la privacidad. Corpus oficial, expectativas y umbrales intactos. V6 y V7.0 congeladas. No fusionar en `main`. No cerrar fase 2. No usar textos oficiales como ejemplos. Cualquier cambio a 7.1 obliga a crear 7.2 y reiniciar la evaluación.

## 11. Limitaciones e impedimentos

- El arnés completo no corre en este contenedor (falta axe-core); en CI sí corre y está aprobado.
- No hay herramienta de mutación instalada: puntaje de mutación NO VERIFICADO.
- La auditoría del caso y del desarrollo es de una sola pasada, hecha por el mismo diseñador; no es independiente.
- Los registros de CI contienen salidas sintéticas del corpus oficial (permitido: sintético). No se usaron para redactar prompts.
