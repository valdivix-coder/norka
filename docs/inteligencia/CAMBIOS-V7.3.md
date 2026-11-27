# Cambios del candidato 7.3 · auditoría, hipótesis y decisiones

27-nov-2026 · rama `fase-2` · base del encargo `594c98a` (HEAD de partida `a51a449`). V6, 7.0, 7.1 y la revisión evaluada de 7.2 (`979e8ef3`) no se modificaron. V6 sigue predeterminada en el selector sintético; la IA para capturas familiares sigue deshabilitada.

## A. Auditoría

Verificado: corpus oficial blob `8a1add2d…` intacto; prompt V6 blob `865b9191…`; huellas 7.0 y 7.1 coinciden (`CONGELACION-V7*.json`); los archivos de 7.1 no cambiaron desde `6deaaac`. La evidencia de V7.2 se contrastó con su artefacto real (ver «Replay»): V6 8/12 y 7.2 9/12 bruta coinciden con el informe.

### Mapa de contradicciones y riesgos (fuente → efecto)

| # | Fuente | Contradicción o riesgo | Decisión 7.3 |
|---|---|---|---|
| C1 | Prompt 7.2 regla 4 frente a la demostración «Comprar ampolletas» | La regla prohíbe El hogar como relleno, pero ninguna demostración muestra una compra sin ancla; el ejemplo existente omite «para la casa» del título | Regla explícita «comprar algo sin decir para quién ni para la casa → ninguna» y par mínimo nuevo (limpiar la cocina / comprar fósforos) |
| C2 | Validador 7.2 `hogar_sin_ancla` | El ancla es global (cualquier palabra de casa en toda la captura), así que no detecta la compra independiente tras una tarea de la casa; además solo marca | Ancla por acción: cláusulas cortadas solo antes de un verbo, emparejadas por palabras del título; una compra sin ancla propia se anula (inequívoco por regla 4); otras acciones solo se marcan |
| C3 | Evaluador 7.2 `alertasInvencion` | Exime a El hogar: la atribución no respaldada no se ve | Métrica nueva hogar TP/FP/FN por capa. No se convierte en alerta de parada porque V6 (control) también rellena El hogar y bloquearía toda evaluación |
| C4 | Calendario 7.2 (`proximos` con +7 para el día de hoy) frente a D-04 (mismo día → null) | La representación contradice la convención aprobada; el modelo bruto copia el +7 (caso 6 de 7.2) | El día de hoy sale de `proximos`; `proximo_mismo_dia` lleva el +7. Datos y regla coinciden |
| C5 | Entrada 7.2 +10,11 % frente al límite +10 % | Falla una puerta de costo | Instrucción −4,6 % (9.711 → 9.263 caracteres): se quitan dos demostraciones redundantes con reglas existentes (nombre fuera de lista, inyección) y se aprieta la redacción |
| C6 | `planInterpretacion` | Hora sin fecha se descarta; responsabilidad sin entidad/ámbito/recurrencia se degrada; nota → sin clasificar | Sin cambio (contrato real). Se mide como capa aplicable y se mostrará en el laboratorio |
| C7 | Etiqueta 45922944781#39 (desarrollo 7.1) | Anterior a D-04: espera +7 donde D-04 manda null | Se documenta como cambio de convención, no como error de validador |

## B. Hipótesis falsables

| H | Predicción | Prueba | Se descarta si |
|---|---|---|---|
| H1 hogar | Regla + ancla por acción eliminan El hogar en compras sin ancla sin perder hogares legítimos | Replay de 61 salidas reales (M6) y M1 en desarrollo nuevo | Aparecen falsos negativos de hogar o el validador empeora casos |
| H2 calendario | Con la representación D-04 el modelo bruto deja sin fecha «el <hoy>» y acierta «el próximo <hoy>» | M2 en desarrollo nuevo | 7.3 bruto sigue asignando +7 |
| H3 costo | Tokens de entrada ≤ V6 +10 % | usageMetadata en desarrollo y aceptación | Supera +10 % |
| H4 sin regresión | 7.3 no empeora clases ya ganadas (beneficiario contextual, alcance) | M3 y casos de alcance | 7.3 pierde aciertos de 7.2 |

## C. Qué se resuelve con IA y qué con código

IA: segmentar, tipo, beneficiario, ámbito, alcance temporal. Código: calendario y horas desde fragmentos literales (corrige solo lo inequívoco), nombres y ámbitos fuera de lista, unidad de recurrencia, ancla de hogar por acción en compras, números del título, títulos clínicos. Se conserva lo que el replay mostró útil: correcciones temporales, unidad de recurrencia y destinatario inválido (7.1); mismo día D-04 (7.2).

## D. Decisiones

- **D-20 (nueva, técnica):** una compra cuya cláusula no nombra la casa ni un bien común no puede tener El hogar como beneficiario; el validador lo anula. Otras acciones sin ancla solo se marcan. Riesgo: si el oráculo oficial esperara El hogar en una compra genérica, habría regresión, y D-19 la detectaría.
- D-03 (tipos): sin cambios respecto de 7.2. M4 (con y sin tipos) no se ejecutó con proveedor: prioridad M1, M2 y M6 por cuota.
- D-04: aplicada en la representación del calendario.
- D-19: conservada en el evaluador 7.3.
- Contrato interno: idéntico a 7.1 (comparabilidad y replay).

## E. Reversión

No seleccionar 7.3 (el valor por defecto es 6.0) o revertir los commits de 7.3. No hay datos, migraciones ni contratos públicos que deshacer.
