# Traspaso V7.3 y laboratorio · para el agente que retome

**Estado (27-nov-2026): PUNTO DE PARADA.** Entrega I hecha hasta la aceptación. El A/B oficial individual V6 vs 7.3 se detuvo en el caso 3 por una **alerta de invención del control V6**, conforme al plan aprobado. **No hacer más llamadas a Gemini ni construir el laboratorio** hasta que el propietario responda D-21 y autorice el laboratorio independiente. V6 sigue predeterminada; IA familiar deshabilitada; nada en `main`; fase 2 abierta.

## 1. Referencias
- Rama `fase-2`. Base del encargo `594c98a`; HEAD de partida `a51a449`.
- Commits de esta intervención: `d721177` y `9847743` (exportación de replay; el bot aportó `9b6369d` con los fixtures), `84bef54` (7.3 en desarrollo), `266549c` (**7.3 congelada**), `8b46803` (solicitud de aceptación) y el commit documental final.
- Encargo: `docs/inteligencia/ENCARGO-V7.3-LABORATORIO.md`.

## 2. Avance (5 tareas por entrega)
- **Entrega I:** A auditoría 100 %; B módulos 100 % de lo priorizado (M1, M2, M3 y M6; M4 y M5 sin proveedor, justificado); C integración y congelación 100 %; D aceptación 6 % de cobertura (3 de 50 pares), detenida; E informe 100 % de lo posible. Total ≈ 81 % (4,06 de 5).
- **Entrega II:** L1–L5 0 %, bloqueadas por el encargo hasta la autorización. Ya existe, sin interfaz, la base de replay: fixtures con procedencia (61 salidas reales) y el script de exportación.

## 3. Archivos nuevos
- Código 7.3: `src/data/prompt-captura-v7-3.ts`, `src/core/usecases/validar-interpretacion-v7-3.ts`, `src/data/gemini-sintetico-v7-3.ts` (selector 6.0 | 7.0 | 7.1 | 7.2 | 7.3, 6.0 por defecto). Contrato interno reutilizado de 7.1.
- Evaluación: `evals/comparacion-v7-3.ts` (N brazos, D-19, hogar, ablación, capa aplicable), `evals/ab-v7-3.eval.ts`, `evals/congelacion-v7-3.eval.ts`, `evals/vitest.v7-3.mts`, `evals/vitest.congelacion-v7-3.mts`, `evals/solicitud-v7-3.json`, `.github/workflows/evaluacion-v7-3.yml`, `evals/replay-validadores.ts`.
- Replay: `.github/workflows/exportar-replay.yml`, `scripts/exportar-fixtures-laboratorio.mjs`, `src/laboratorio/fixtures/replay-*.json` (3 corridas de desarrollo; nunca el corpus oficial).
- Datos: `evals/desarrollo-v7-3.json` (22), `docs/inteligencia/EJEMPLOS-DESARROLLO-V7.3.json`.
- Documentos: `CAMBIOS-V7.3.md`, `PROMPT-MAESTRO-IA-V7.3.md`, `PROMPT-OPERATIVO-V7.3.md`, `PLAN-PRUEBAS-V7.3.md`, `CONGELACION-V7.3.json`, `INFORME-EVALUACION-V7.3.md`, `evidencia-v7-3/`.
- Pruebas: `tests/arnes/interpretacion-v7-3.test.ts` (19). Arnés 260/260.

## 4. Ejecuciones (sintéticas, Lite fijo, sin respaldos)
- Exportación de replay: [45992920754](https://github.com/valdivix-coder/norka/actions/runs/45992920754) (sin proveedor).
- Desarrollo de tres brazos: [45994191002](https://github.com/valdivix-coder/norka/actions/runs/45994191002). V6 13/22, 7.2 14/22, 7.3 21/22 normalizada; artefacto 15194768714.
- Aceptación oficial: [45995259777](https://github.com/valdivix-coder/norka/actions/runs/45995259777). Parada en el caso 3 (alerta del control); 3/50 pares; artefacto 15195786456.
- Solicitudes de generación en esta intervención: 66 + 6 = 72. Sin 429, 503 ni truncamientos. Cuota restante: NO VERIFICADO.

## 5. Medido frente a hipótesis
- Medido: hogar FP 7 → 0 en desarrollo; validador 7.3 sube el replay de 53 a 55/61 y una corrida de 7.2 de 14 a 19/22; entrada +6,0 % y mediana +10,9 % frente a V6; en aceptación, error nuevo de 7.3 (El hogar en un pago escolar, caso 1) y alerta del control en el caso 3.
- No verificado: precisión oficial completa, generalización ciega, latencia de voz, D-03 con proveedor, auditoría independiente.

## 6. Decisiones del propietario
1. **D-21:** tratamiento de una alerta de invención en el control (recomendada: registrar sin detener; la candidata sigue deteniéndose ante cualquier alerta propia).
2. Autorizar el **laboratorio independiente de replay** (Entrega II) pese a la parada.
3. Decidir si el error de El hogar en un pago no doméstico se corrige en 7.4 antes de repetir el A/B, o si se repite primero con 7.3.

## 7. Siguiente paso exacto
- Con D-21 = (b): editar `evals/comparacion-v7-3.ts` **solo** en la condición de parada del control (pasar `c6.alertas` a registro) como evaluador 7.3.1, registrar su huella, y repetir el A/B desde cero con 7.3 congelada (`evals/solicitud-v7-3.json`, modo aceptación). Como el evaluador forma parte de la congelación, el cambio exige una congelación nueva del evaluador, documentada.
- Con laboratorio autorizado: leer completa la guía gráfica (`docs/marca/GUIA-GRAFICA.pdf`), exportar también la corrida 45994191002 a fixtures (agregarla a `exportar-replay.yml`) y construir `/laboratorio` detrás de una bandera desactivada por defecto, solo en desarrollo, sin red ni base de datos, siguiendo L1–L5.

## 8. Comandos
```bash
npm ci && npm run arnes                                    # 260/260
npx vitest run --config evals/vitest.congelacion-v7-3.mts  # huellas 7.3
# Evaluación (solo CI): editar evals/solicitud-v7-3.json y hacer push a fase-2.
```

## 9. Reversión
Selector 6.0 (por defecto). Los commits de 7.3 y del replay son solo aditivos: se revierten sin afectar datos, producción ni versiones previas.
