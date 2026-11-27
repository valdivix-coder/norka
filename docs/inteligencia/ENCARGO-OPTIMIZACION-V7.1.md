# Encargo activo · optimización integral del candidato 7.1 de norka
26 de noviembre de 2026 · rama fase-2 · autorizado por el propietario.
Estado: TRASPASO PARA EJECUCIÓN. No se ha creado ni evaluado 7.1 todavía.

## 0. Misión y autoridad

Actúa como arquitecto de interpretación estructurada, especialista en ingeniería de prompts para modelos pequeños, razonamiento temporal, pruebas de software, evaluación experimental y español chileno. Tu capacidad de razonamiento se utiliza para diseñar y verificar el sistema; el modelo de producción/evaluación sigue siendo Gemini gratuito, no tú. Objetivo: maximizar precisión bruta, normalizada, generalización y seguridad de interpretación de capturas sin aumentar innecesariamente costo, latencia o revisión humana. Prioriza evidencia frente a intuición. No te limites a pulir redacción: analiza arquitectura, contrato interno, precedencias, ejemplos, abstención, validador y evaluador conjuntamente. No asumas que propuestas anteriores son correctas.

El propietario autoriza diseñar, implementar y probar 7.1 dentro de fase-2, ejecutar en secuencia A–F (ver abajo) y dejar un traspaso verificable. No requiere aprobación entre tareas si pasan todas las puertas. No es autorización para cerrar fase 2, fusionar main, usar datos reales ni cambiar proveedor, presupuesto, privacidad o contrato público. No sobreescribir V6, V7.0 ni sus documentos congelados. Si solo tienes acceso de lectura o no puedes ejecutar, entrega los archivos propuestos y reporta bloqueo explícito; no simules pruebas. El siguiente agente debe poder retomar sin depender de esta conversación.

## 1. Lectura obligatoria, antes de editar

1. AGENTS.md, docs/AHORA.md, docs/PROMPT-MAESTRO.md completo (en especial 0.7, 5, 6.2, 6.10, 6.19, 9, 12 y 13.2).
2. docs/inteligencia/INFORME-EVALUACION-V6.md, INFORME-EVALUACION-V7.md (leer hasta el último apartado), CONGELACION-V7.json, AUDITORIA-RECEPCION-V7.md, HISTORIAL-VERSIONES.md.
3. docs/inteligencia/PROMPT-MAESTRO-IA.md, CONTRATO-PROCESAMIENTO.md, PROTOCOLO-EVALUACION.md, PROMPT-MAESTRO-IA-V7.md, PROMPT-OPERATIVO-V7.md, CAMBIOS-V7.md, PLAN-PRUEBAS-V7.md, EJEMPLOS-DESARROLLO-V7.json; copia corregida docs/inteligencia/candidato-v7-0/. La instrucción realmente utilizada está en src/data/prompt-captura-v7.ts y difiere del documento original.
4. src/data/prompt-captura.ts, prompt-captura-v7.ts, gemini-sintetico.ts; src/core/contracts/interpretacion.ts, interpretacion-interna-v7.ts; src/core/usecases/revisar-interpretacion.ts, validar-interpretacion-v7.ts, calendario-captura.ts; evals/comparacion-v7.ts, gemini.eval.ts, auditar-acciones.ts; tests/arnes/interpretacion-v7.test.ts, comparacion-v7.test.ts, gemini-sintetico.test.ts; .github/workflows/evaluacion-ab-v7.yml.
5. Revisa el artefacto sintético original https://github.com/valdivix-coder/norka/actions/runs/45916614102/artifacts/15162493127 (caduca 11-dic-2026; resumen permanente en informe V7 y sección 2 de este documento). ZIP verificado por SHA-256 b9adf0e9f8f5d23c022a7fa45c97f0d6f370ec9dfa506b5110f873ea312ba45b. No incorporar textos oficiales ni sus respuestas a las instrucciones, ejemplos, reglas específicas, fixtures de desarrollo o entradas enviadas fuera del examen.

## 2. Evidencia medida, no extrapolar

V6 referencia 3030411: agrupada histórica 48/50 (96%) principal y estricta, pero no aprobada por discrepancias. V7.0 congelada c5c8378ae4ebecc2f5eb1eb8cf11a5fa7c12368f; arnés 195/195, 23 archivos (f3061539, run 45916508438) y completo aprobado 45916508461. La evaluación real individual 45916614102 (commit f8a09cad, Lite fijo, 0 respaldos, temperatura 0, semilla 20261126) se detuvo en caso 6 por regresión bruta; 6 pares válidos, 44 no ejecutados por brazo, sin fallos ni reintentos. No fue cuota. Los 12 finishReason son STOP. Se verificó el ZIP y se cotejó JSON real. En la primera respuesta V7 las claves evidencia y tiempo preceden a clasificación; verificar todas las respuestas del futuro candidato.

| Indicador parcial | V6 | V7.0 |
|---|---:|---:|
| Principal y estricta bruta | 4/6 | 3/6 |
| Principal y estricta normalizada | 5/6 | 5/6 |
| Casos corregidos | 1 | 2 |
| Casos empeorados | 0 | 0 |
| Discrepancias por acción bruta / normalizada (contador histórico) | 1/0 | 2/1 |
| Elementos Por revisar | 3/8 | 5/8 |
| Tokens entrada / salida | 16732 / 577 | 17896 / 934 |
| Mediana / p95 ms | 708.5 / 860 | 948.5 / 980 |

Entrada +6.96%, salida +61.87%, mediana +33.87%, tasa revisión +25 puntos porcentuales. Muestra pequeña; no inferir superioridad ni costo global. El contador histórico no cuenta todos los campos nulos omitidos; exactitud y auditoría manual siguen siendo obligatorias. No hay montos explícitos en los seis casos.

Diagnóstico de clases de fallo (no reglas por ID):
- Secuencia con fecha inequívoca inicial y acción siguiente con solo hora: V7.0 omitió fecha bruta, aunque recuperó exactamente fecha/hora en validador. V6 acertó ambas capas. Distinguir copia indebida sin marcador, herencia por hora, fecha propia, encabezado común y secuencia que cambia tema.
- Pago escolar: V7.0 priorizó destino del pago por encima de su naturaleza financiera; V6 clasificó bien. Ambas omitieron beneficiario implícito del pago. Distinguir beneficiario contextual inequívoco de elección por descarte.
- Responsabilidad doméstica/escolar sin persona nombrada: ambas brutas inventaron un beneficiario del catálogo; ambos validadores lo anularon. No inferir por rutina ni catálogo, ni siquiera si hay una sola persona disponible.
- Nota no clínica sin acción: V7.0 usó título genérico, V6 resumen abreviado; ambos incumplen regla de conservar original. Separar la excepción de privacidad, sin prometer detección de todos los datos clínicos mediante regex.
- Confianza: V7.0 bajó confianza en propuesta de trámite correcta, aunque sin ajuste del validador; revisar regla de confianza y separar abstención legítima de falsos positivos.
- Ambigüedad estructural: catálogo de nombres sin tipos no determina si una compra de comida para X es humana o animal. No memorizar nombres oficiales ni inferir tipo por nombre. Mantener entrada del examen intacta. Si las exigencias son incompatibles, documentar la limitación y pedir decisión D-03; solo ablación sintética separada con tipos explícitos, no equivalencia con examen original.

## 3. Plan de trabajo A–F

### A · Auditoría y diseño de hipótesis (sin cambiar candidato)
- Verifica HEAD, estado de rama, hashes congelados V6/V7.0 y corpus (blob 8a1add2d3bda79cd82db2bfc9166a501aaec5ca6). No confundas tarea V7.1 de integración ya realizada con versión del candidato 7.1.
- Haz mapa de conflictos maestro ↔ operativo ↔ contrato ↔ código ↔ criterios. Investiga por qué falló una regla ya presente: precedencia de reglas, orden de campos, ejemplos abreviados, atención del modelo, ambigüedad de datos, configuración. Diferencia hechos medidos, hipótesis y limitaciones.
- Evalúa alternativas razonadas: reglas jerárquicas de decisión, tabla de alcance temporal, anclaje de beneficiario explícito/contextual/ausente, taxonomía por intención, evidencia por atributo, abstención, reducción de ejemplos redundantes. No añadas complejidad sin hipótesis falsable; el contrato interno puede evolucionar solo en copia versionada, no el público. No exigir razonamiento visible.
- Revisa riesgos pendientes del validador: negaciones y correcciones, cobertura por palabras vs acciones, mayúsculas de voz, ancla El hogar, montos por acción, recurrencia, orden de propiedades, notas clínicas, alternativas y formatos de hora. Decide qué corregir por código y qué solo marcar; no inventar fechas/entidades ni degradar una respuesta correcta.
- Define tres o más hipótesis con predicción, prueba discriminante, riesgos y criterio para descartar. Prioriza precisión bruta, no una corrección posterior que enmascare error del modelo.

### B · Diseño de 7.1 y desarrollo sin proveedor
- Escribe prompt maestro y operativo completos versionados, coherentes, compactos. Meta orientativa de instrucción ≤2500 tokens si viable; medir tokens reales después. Evita reintroducir pérdida de minutos, fechas alternativas, negación, responsabilidades sin recurrencia y demás protecciones de 7.0.
- Diseña 20–30 pares nuevos mínimos (40–60 frases sintéticas) con familias y nombres diferentes a los oficiales y demostraciones anteriores; incluir contraste pago vs compra, fecha inicial + hora posterior vs acción sin marcador, dos personas nombradas vs beneficiario implícito único vs ninguno, nota no clínica vs nota clínica, titular vs destinatario, compras humanas/animales ambiguas, catálogos personalizados, voz en minúsculas, nombres homónimos, autocorrecciones, inyección, montos y recurrencias. Etiqueta reglas, reloj, contexto, salida esperada y razón; separar demostración de prueba antes de redactar prompt. No tomar las 50 frases oficiales como datos de entrenamiento ni para optimizar por caso. Casos ya observados solo inspiran clases abstractas de error. No afirmar que desarrollo es ciego.
- Si propones cambios deterministas, crea pruebas positivas, negativas, metamórficas (cambio de nombres, orden, voz y signos), de invariantes y mutaciones. Preserva las pruebas originales y añade casos en archivos nuevos. Probar entradas desconocidas y falsos positivos, no solo happy path.
- Mantén decisión D-08: puerta bruta y normalizada intactas. D-09: solo corregir evidencia inequívoca, resto marcar/revisar. D-10: conservar nota no clínica; política real de datos clínicos queda pendiente y no se habilita. D-03: sin tipo en examen, ablación solo sintética y separada si sobra cuota y no hay parada. Para D-01 a D-18 entregar matriz de decisión y configuración; no tomar una decisión incompatible con reglas o privacidad.

### C · Integración y congelación
- Crear archivos nuevos de 7.1 (nombres inequívocos, no tocar versiones congeladas ni cinco archivos originales). Selector explícito 6.0 | 7.0 | 7.1, 6.0 predeterminado. Preservar payload y salida de las referencias, probado byte a byte donde aplique. Campos internos en memoria, no persistir ni registrar datos reales; en artefacto de evaluación exclusivamente sintético conservar tres capas y ajustes sin texto.
- Mantener orden de propiedades en request real (responseJsonSchema), validar esquema interno y público, lote aislado, Gemma solo como respaldo existente fuera de A/B, no modificar proveedor. Verificar finishReason, límites de salida, no aceptar truncamiento. Nada de Next UI ni migraciones.
- Ejecutar las cuatro pruebas originales, resistencia adicional, npm run arnes y npm run arnes -- --completo. Arnés previo 195/195, ninguna reducción de intención o umbral. Registrar pruebas nuevas/total, runs, commits, trazabilidad y cambios. Si pasa, congelar commit y SHA-256 instrucción, sufijos, schema individual/lote serializado, validador; registrar hashes V6 y V7.0, corpus y configuración. Si cambia cualquier componente después de iniciar el A/B, crear otra versión y reiniciar, nunca sustituir resultados.

### D · Evaluación reproducible y controlada
- Auditar arnés actual antes de gastar cuota: semilla actualmente solo alterna paridad; documentar o implementar alternancia reproducible sin sesgo. Revisar conteo por acción/campo, campos nulos, omitidas/extras, fallos, estados no ejecutados, registro de finishReason y tokens/latencia por solicitud. No debilitar aserciones históricas de discrepancias brutas cero. Probar simulaciones de 429, 503/timeout, schema, regresión, invención y aislamiento. Evaluador debe detenerse cuando exista invención confirmada; distinguir alerta automática de auditoría humana. No exponer datos internos en logs.
- Ejecutar primero individual V6 vs V7.1, ambos desde cero: Lite fijo, sin respaldos, mismo corpus oficial, reloj, configuración temperatura 0, orden alternado con semilla registrada, ≥4,5 s entre solicitudes, máximo un reintento ante 503/timeout, 429 detiene. Verificar cuota gratuita si hay acceso; si no, marcar NO VERIFICADO y no activar facturación. Clave solo secreto de CI. Guardar respuestas sintéticas y resumen de artefacto. No reutilizar resultados de otra corrida como brazo control.
- Mantener 7.0 como comparador congelado histórico parcial; compararlo directamente con 7.1 solo si los brazos completos V6/7.1 pasan, sobra cuota y no hay parada. Lotes de 5 únicamente después de individual completo y conforme a criterios; desarrollo de 30 casos prueba de V7, 50 de desarrollo V6 y nuevos casos aparte, nunca aceptación. No ejecutar nuevas llamadas tras punto de parada.
- Gates: 50/50 válidas por brazo, principal ≥45/50 y estricta ≥45/50 bruta y normalizada; cero regresiones individuales de V6; cero casos empeorados por validador; mantener discrepancias brutas cero y puerta original; cero invenciones solo tras auditoría manual completa; sin fallos adicionales de esquema, mediana ≤V6+30%, tokens entrada ≤V6+10%, latencia formal texto ≤5s/voz ≤8s (no inferir voz con evaluación textual). Metas aspiracionales: 98–100% corpus y ≥95% ciego, no garantías ni nuevos umbrales. Revisión de confianza/Por revisar separada.
- Puntos de parada obligatorios: regresión pareada en cualquier capa/criterio, invención confirmada, validador empeora, cobertura incompleta, cuota agotada, truncamiento, fallo de arnés no reparable sin cambiar intención, requerimiento incompatible con restricciones o D-xx sin default seguro, cualquier cambio necesario al contrato público, datos, privacidad, pagos, proveedor o base de datos. Guardar evidencia, detener y esperar respuesta del propietario. No continuar para compensar por promedio.

### E · Informe y decisión
- Comparación pareada por caso y campo (principal/estricta), bruta y normalizada; acciones omitidas/agregadas; tasa revisión; ajustes por motivo, corregidos/empeorados; tokens entrada/salida/razonamiento, mediana/p95, fallos por causa, cobertura, hash y versión. Separar error de clasificación, alcance, convención e invención real. Auditar títulos, montos, negaciones, fechas y personas; dos pasadas independientes cuando posible, si no, decirlo. En corrida parcial reportar únicamente pares completos, no afirmar 50/50 ni cero invenciones.
- Recomendar: pasar a conjunto ciego nuevo de 50 frases de evaluador independiente si cumple todas puertas; iterar 7.2 con hipótesis concretas si no; o mantener 6.0. No inventar métricas ni cerrar fase 2.
- Si la precisión se estanca, justificar qué cambiar en arquitectura y qué no conviene, con costo y restricciones; no seguir iterando por número de versión ni sobreajustar al examen.

### F · Entrega y devolución del trabajo
Deja todo en rama fase-2 con commits propios, actualiza docs/inteligencia/HANDOFF-INGENIERIA-PROMPTS.md (encargo activo y enlace), HISTORIAL-VERSIONES.md, docs/AHORA.md, docs/IMPLEMENTATION_STATUS.md, docs/fases/FASE-2.md. Entregables nuevos en docs/inteligencia/:
- CAMBIOS-V7.1.md (diagnóstico, hipótesis, riesgos, decisiones D-xx, qué se conserva/cambia, rollback).
- PROMPT-MAESTRO-IA-V7.1.md y PROMPT-OPERATIVO-V7.1.md (instrucción exacta, sufijos y schema).
- EJEMPLOS-DESARROLLO-V7.1.json y PLAN-PRUEBAS-V7.1.md.
- CONGELACION-V7.1.json (si pasa C), INFORME-EVALUACION-V7.1.md (aunque se detenga).
- TRASPASO-V7.1.md (para el agente que retome): HEAD/rama, commit base, tareas A–F hechas y pendientes, porcentajes y pruebas, hashes, runs/artefactos, errores medidos vs hipótesis, decisiones que requieren propietario, restricciones, comandos reproducibles y próximo paso exacto. Si hay impedimento, escribirlo aquí; no ocultarlo.

Formato de comunicación: español claro, pasos numerados y sin tecnicismo innecesario. Reporta evidencia y NO VERIFICADO; usa porcentajes por tarea y total indicando denominador. No te presentes como aprobado si no has medido. El modelo que retome auditará de forma independiente antes de aprobar o avanzar. No fusionar main, no fase 3, no cambios al corpus o umbrales, no datos reales, no secretos, no facturación, no RLS/políticas/migraciones. V6 sigue como única opción predeterminada. Reversión: selector 6.0; conservar V7.0 y 7.1 con su evidencia.
