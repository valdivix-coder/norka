# 07 · Evidencia

## Revisiones

| Qué | Valor |
| --- | --- |
| Rama de auditoría | `claude/beautiful-knuth-9zau24`, creada desde `1dda9d23d037b94e074599c2d2d2a83e14c2f6f8`. Es la rama designada para esta sesión. La rama remota anterior, `4bd3783`, era antecesora, así que el avance fue rápido y sin reescribir historial |
| Código auditado | `bdccc7c092b074e150e23b3646a792126d8e0303`. `git diff bdccc7c 1dda9d23 -- src evals` está vacío; solo cambia `tests/arnes/catalogo-operaciones-universal.test.ts` |
| Paquete leído | `1dda9d23` y las aclaraciones de `fase-2` `280257c`: la revisión de entrega y la advertencia de privacidad del dictado. Esas aclaraciones son solo documentales |
| fase-2 y main | No modificadas |

## Integridad comprobada en la rama

- Corpus oficial `evals/captura-cl.json`: blob `8a1add2d3bda79cd82db2bfc9166a501aaec5ca6` en `bdccc7c` y en la rama. SHA-256 del archivo: `2f5872d1d911bf63ce81ff14e7103becac760b7790c13139310a296661736f16`.
- Prompt V6 `src/data/prompt-captura.ts`: blob `865b9191dbeff277e47a6730d5d48c6a3accc086`.
- Instrucción V7.5 (que también usa V7.6): SHA-256 `df6f9b87af4b9cf25b4e0eecc9e91078dd3c75e89f11045555989f799f2d5a3c`. Tiene 9.536 caracteres, contra 9.368 de V6.
- Validador V7.6: `328515d188f85424bbaba7cb3b72e36b69bc8a6b1019a6637060a8ce06af695d`. V7.4: `c0c1a241dc8af7185fd4ce6ec75118b374910961fe47e925004a94ce885bf172`.
- Ningún candidato, corpus ni expectativa se modificó en esta auditoría. Solo hay archivos nuevos: `evals/auditoria-universal.eval.ts`, `evals/vitest.auditoria-universal.mts` y esta carpeta `resultados/`.

## Comandos ejecutados en el contenedor

| Comando | Resultado |
| --- | --- |
| `npm ci` | Correcto |
| `npm run arnes` (antes de los archivos nuevos) | Arnés mínimo aprobado: 34 archivos, 303/303 |
| `npm run arnes` (después) | 34 archivos, 303/303. Los archivos `.eval.ts` no entran al arnés; pasan TypeScript y el linter |
| `npx vitest run --config evals/vitest.auditoria-universal.mts` | 5 aprobadas, 17 «expected fail» (hallazgos reproducidos), 1 omitida (M-2 necesita el HTML del laboratorio) |
| `npm run arnes -- --completo` | No ejecutado aquí: falta axe-core en el contenedor. El último en CI es 46070603317, verde |

Salida de M-1 (`LISTAS_EQUIVOCADAS`), sobre los 3 fixtures versionados en `src/laboratorio/fixtures/`:

```
6.0: respuestas 61, acciones 77, listas 61, listasConError 12, listasSinPar 2, porCompletar 16, porCompletarCorrectas 9
7.1: respuestas 49, acciones 58, listas 44, listasConError 3,  listasSinPar 1, porCompletar 14, porCompletarCorrectas 11
7.2: respuestas 12, acciones 18, listas 12, listasConError 1,  listasSinPar 0, porCompletar 6,  porCompletarCorrectas 5
```

Sondeo de activación sobre las mismas 61 salidas internas no V6 (script temporal, no versionado):

- la regla `pago_literal_inequivoco` de V7.6 se activa **0** veces;
- el recálculo temporal se activa **1** vez, con el fragmento «a las diez».

## Registros de CI verificados (GitHub Actions, por API)

**Run 46042512690**, job 140653531796, «V7.6 · replay financiero»:
- Conclusión: success.
- Registro textual:
  `REPLAY_V76 {"antiguos":{"n":61,"bruta":50,"v74":55,"v76":55},"desarrollo73":{"n":112,"bruta":92,"v74":100,"v76":101,"mejoran":[{"fuente":"46039721333","id":10,"version":"7.5",...}]},"total":{"n":173,"bruta":142,"v74":155,"v76":156,"empeoran":[]}}`.
- Coincide con el paquete: 142, 155 y 156 de 173, una mejora y cero empeorados.

**Run 46042786577**, job 140654461716, «Revisión universal»:
- `REVISION_REPLAY {"capturas":105,"respuestas":254,"acciones":367,"listas":274,"pendientes":93,"lotes":202,"confirmadas":274,"deshechas":274,"perdidas":0}`.
- El artefacto descargado tiene el digest `059f8930…`. Coincide con el paquete. Ver P2-09: «perdidas 0» es cierto por construcción.

**Run 46070603304**, job 140746373245, «Laboratorio»:
- `LAB_BROWSER_OK: 6 fuentes, …, 360/390/1280, claro/oscuro, sin solicitudes externas`.
- Artefacto 15232343591, digest del ZIP `9b5e93ea24e190074bee3428555af895aebdeaf2d853659ee98faaea305d3050`. Coincide con el paquete.

## NO VERIFICADO

- **Contenido de los artefactos:** el ZIP y el HTML del laboratorio, y las salidas JSON de V7.3, V7.4 y V7.5. El host de blobs está bloqueado desde este contenedor. Por eso M-2, el replay completo de 173 respuestas y las listas equivocadas de V7.5/V7.6 no se reprodujeron aquí; solo se leyó el registro de CI.
- **Hash del HTML** `36e32e90…`: no recalculado.
- **Corridas V7.5:** las de desarrollo y resistencia (46037265864 y 46039721333) no se volvieron a leer en detalle. Las cifras 10/10 y 11/12 se aceptan del informe porque su registro y la cifra del replay coinciden con el resumen, pero no se auditó cada acción.
- **Comportamiento bruto del modelo** ante los 54 casos nuevos: no hubo llamadas.
- **Hardware y entorno real:** Safari iOS, 4G, lector de pantalla real, pilotaje humano, voz integrada, cuota gratuita, acceso de Belén y revisión desplegada.
- **Estimaciones:** el margen de tokens de V7.8 (unos 100 tokens por solicitud) es una estimación, no una medición.
- **Guía gráfica:** esta auditoría no revisó el diseño visual. No se declara conformidad ni incumplimiento con `docs/marca/GUIA-GRAFICA.pdf`.

## Fuentes leídas

- Paquete 00 a 05.
- `AGENTS.md`, `docs/AHORA.md`, `PROMPT-MAESTRO.md` (§6.2, §11, §12 y §13.2–13.3).
- `PLAN-INTELIGENCIA-FAMILIAR-POR-VOZ.md`, `PREPARACION-FASE-3.md`.
- Informes V7.3, V7.5 (evaluación y consolidación), V7.6 y revisión universal piloto.
- `PROTOCOLO-EVALUACION.md`, `CONTRATO-PROCESAMIENTO.md`.
- Código del manifiesto:
  - `prompt-captura-v7-5.ts`, `gemini-sintetico-v7-6.ts`;
  - contratos;
  - `validar-interpretacion-v7`, `-v7-4` y `-v7-6`;
  - `interpretacion.ts`, `procesar-captura.ts`, `captura-acciones.ts`, `[pantalla]/page.tsx`;
  - `revision-sintetica.ts`, `motor-revision-universal.ts`, `laboratorio.js`, `plantilla.html`;
  - `comparacion-v7-2.ts`, `comparacion-v7-5.ts`, `auditar-acciones.ts`, `cobertura-acciones-v7-5.ts`;
  - `replay-v7-6.eval.ts`, `revision-universal.eval.ts`;
  - pruebas V7.6 y del motor, `auditar-aplicabilidad.mjs`.
- Corpus de desarrollo V7.4 y V7.5: textos y etiquetas. Las etiquetas son coherentes con las reglas, pero dirigidas: V7.5 no tiene casos temporales.
- El corpus oficial **no se leyó caso por caso**. Solo se calculó automáticamente su solapamiento de 5-gramas con los casos nuevos, que es cero.
