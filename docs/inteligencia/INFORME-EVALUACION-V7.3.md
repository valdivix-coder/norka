# Informe de evaluación · candidato 7.3

27-nov-2026 · rama `fase-2` · **Resultado: PUNTO DE PARADA en el caso 3 del A/B individual oficial por una alerta de invención en el brazo de control (V6), no en la candidata. 7.3 no está aprobada ni rechazada: la aceptación queda bloqueada hasta que el propietario decida. V6 sigue predeterminada.** Fase 2 abierta.

## 1. Candidata

Congelada en `266549cdc95231c658a41606020f441ece039699` (`CONGELACION-V7.3.json`, huellas verificadas en CI). Instrucción 9.263 caracteres, SHA-256 `6e552592b3374f801ff3deb2e53cad3378f10876c05f58ec6b3acedf3fca0b28`; validador `2015199c…`; contrato interno igual al de 7.1. Arnés 260/260 (27 archivos).

## 2. Pruebas por módulo

### M6 · validadores sobre salidas reales ya obtenidas (sin proveedor)
61 salidas brutas reales de Gemini (49 de 7.1, 12 de 7.2), fixtures en `src/laboratorio/fixtures/` con SHA-256 del JSON de cada artefacto. Estricta: bruta 50/61; validador 7.1 53; 7.2 53; **7.3 55**. El validador 7.3 corrige además los casos de hogar 29 y 38 de 7.2. Único «empeorado», común a 7.2 y 7.3: una etiqueta de 7.1 anterior a D-04. El replay reproduce exactamente 59/61 resultados guardados; los 2 restantes provienen de corridas hechas con versiones previas del validador 7.1. Evidencia: `evidencia-v7-3/replay-validadores.json`.

### M1, M2 y M3 · comparación de sistemas en desarrollo (22 frases nuevas)
Run 45994191002. Principal y estricta, normalizada: V6 13/22 (59,1 %), 7.2 14/22 (63,6 %), **7.3 21/22 (95,5 %)**; bruta 13, 13 y **19**. Hogar, falsos positivos: 7, 7 y **0**, sin falsos negativos. Entrada por solicitud +6,0 % frente a V6 (7.2 +10,1 %); mediana +10,9 % (7.2 +29 %). Sin regresiones 7.3 frente a V6 ni frente a 7.2. Detalle: `evidencia-v7-3/desarrollo-v7-3.md`. Es una comparación de sistemas: cambian varios factores a la vez; la ablación del validador es la única medición causal.

No ejecutado con proveedor (prioridad M1, M2 y M6 por cuota): M4 tipos con y sin (D-03) y M5 catálogo propio nuevo. Para M5 existe la evidencia de 7.1 (8/10 frente a 3/10).

## 3. Aceptación · A/B individual oficial

Run https://github.com/valdivix-coder/norka/actions/runs/45995259777 (solicitud `8b46803`), artefacto 15195786456 (ZIP SHA-256 `c5727313ca10486efe395b194624a639fe602cefe5689ffd74e43db0931a1b5b`). Lite fijo, sin respaldos, temperatura 0, semilla 20261129, corpus blob `8a1add2d…` intacto. Huellas verificadas antes de generar.

- **Pares completos:** 3 de 50; 47 no ejecutados por brazo; 6 STOP, 0 fallos HTTP, 0 truncamientos.
- **Caso 1:** ambos fallan frente al oráculo. V6 deja sin persona el pago escolar, que es un beneficiario contextual. 7.3 le asigna El hogar (con `persona_base: ninguna`, de modo que el validador lo marca como base contradictoria pero no lo anula, porque no es una compra). No es regresión: V6 también falla. Es un **error nuevo de 7.3**: El hogar en un pago no doméstico.
- **Caso 2:** ambos aciertan.
- **Caso 3:** V6 bruta asigna un beneficiario no mencionado y su validador lo anula. **Alerta de invención del control → parada sin repetición**, según el plan aprobado en V7.2 (`PLAN-PRUEBAS-V7.2.md` §7) y el evaluador. 7.3 acierta en bruto y normalizado.
- Ninguna conclusión global: no se compara una cobertura parcial.

## 4. Diagnóstico de la parada

La regla «una alerta en cualquiera de los brazos detiene sin repetición» está bien para detectar invenciones de la candidata. Pero el control V6 ya inventó ese mismo beneficiario en la corrida de V7.0 (run 45916614102, caso 3, invención confirmada en la auditoría). Mientras V6 sea el control, cualquier A/B oficial se detendrá en ese caso aunque la candidata no invente nada. Es un bloqueo estructural del protocolo, no un fallo de 7.3. No se cambió la regla: cambiarla es una decisión de criterio que corresponde al propietario.

## 5. Recomendación

1. **D-21 (nueva, del propietario):** qué hacer con una alerta de invención en el **control**. Opciones: (a) mantenerla como parada (con lo que la aceptación queda bloqueada en el caso 3); (b) registrarla como evidencia del control, sin detener, y seguir deteniendo ante cualquier alerta de la candidata (recomendada: la puerta de la candidata no se relaja); (c) otra regla. Con (b), repetir el A/B desde cero con la misma candidata congelada.
2. **Antes de repetir, decidir si se corrige en 7.4 el error nuevo de El hogar en un pago no doméstico** (caso 1), o si se acepta que D-19 lo detecte. Corregirlo sería una versión nueva y obligaría a otra corrida de desarrollo. Recomendación: ejecutar primero el A/B con 7.3 congelada si se aprueba (b), para no perder la comparabilidad.
3. **Laboratorio:** como la aceptación de 7.3 está bloqueada, el encargo exige tu autorización antes de construir el laboratorio de replay independiente. Recomendación: autorizarlo. Ya existen 61 + 66 respuestas reales de desarrollo con procedencia verificable, y el laboratorio no llama a Gemini ni escribe en la base de datos.
