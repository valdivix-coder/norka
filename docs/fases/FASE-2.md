# Fase 2 — Captura

## 2.1 · Migración 0005

Preparada a partir de la fase 1 autorizada; rama fase-2. 0003 del prompt ya está ocupada por sesiones, 0004 por familias; 0005 agrega responsabilidades, tareas, capturas y trabajos_ia. Todas las referencias a objetos familiares usan FK compuesta (familia_id,id). RLS sin políticas, solo servicio. El RPC guardar_captura es SECURITY INVOKER, comprueba pertenencia activa, guarda texto original y tarea sin clasificar atómicamente, e impide duplicación por reenvío del mismo UUID. No encola IA sin consentimiento. La referencia a ficha de pago queda pendiente de la tabla de fase posterior. Estados técnicos de trabajo: pendiente/reservado/aplicado/fallido; no se usa aún el modelo. Las consultas antes/después y prueba transaccional sin datos reales se encuentran en supabase/verificaciones. Aplicada el 26-nov (20261126030716), RPC solo servicio, prueba transaccional con rollback aprobada.

Siguiente: 2.2. No declarar fase 2 aprobada sin cumplir 2.9 y las metas del prompt maestro.

## 2.2–2.3 · Captura texto y cola local

Guardado atómico de original y tarea sin clasificar; acción valida cookie y cuenta esperada y RPC comprueba pertenencia activa. La cola IndexedDB solo retiene capturas pendientes, separadas por cuenta/familia; reintento al volver conexión, al abrir y cada 30 s. No se elimina hasta confirmación. No es cifrado frente a acceso local al dispositivo. En caso de fallo de IndexedDB, se intenta el servidor sin borrar texto si falla. Capturar en el marco de todas las pantallas, foco de campo al abrir; no se pide otro dato. No se promete recarga offline/PWA todavía. Falta validar en navegador y teléfono. Vuelta atrás: revertir código y conservar capturas guardadas y cola.

## 2.4 · Contrato y reglas puras

Zod 4.6.7 ya estaba en el lock como dependencia indirecta de desarrollo; se declara explícitamente como dependencia de ejecución, exigida por 6.2. Contrato estricto, fechas válidas, nombres exactos y únicos, notas sin clasificar, baja confianza por revisar, propuestas sin asignación directa, dos intentos máximos. Las pruebas no llaman a IA. El plan resultante aún no se escribe en BD: la persistencia atómica de propuestas (tabla programada en 4.1) y actividad (5.2 exige registro desde fase 2) requiere resolver esa dependencia del plan. NO VERIFICADO: precisión o invención de datos del modelo; se medirá con evals y Gemini. No se envían datos personales.

## 2.5 · Corpus sintético

50 frases y resultados esperados en evals/captura-cl.json; fecha y familia sintéticas. Recuentos de categorías y validación Zod comprobables en CI. El primer caso obligatorio cuenta en múltiples y pagos; el segundo es control sin plazo, de modo que las 50 frases cumplen los recuentos. No se han medido aciertos de Gemini.

## 2.7 · Resultado manual, editar y deshacer

Migración 0006 aplicada 20261126031155; función solo servicio, prueba transaccional de edición, revisión obsoleta, rechazo cuenta ajena, conservación original y descarte aprobada. Tarjeta del último envío confirmado, también tras reconectar; editar en hoja, deshacer descarta tarea sin borrar captura original. Solo autor activo y revisión vigente; no altera tareas interpretadas. Prueba de navegador pendiente. No se interpreta ni escribe propuestas mientras IA no habilitada.


### Dictado y evaluación (avance)
- 2.8: puerto de voz y vibración, Web Speech es-CL, pulsación 400 ms, deslizamiento horizontal >44 px cancela, soltar confirma y conserva texto si falla. Sin envío a Gemini ni audio al servidor de norka. El proveedor de reconocimiento del navegador puede procesar voz fuera del dispositivo; no asumir local. iPhone/Safari y tiempos reales pendientes.
- 2.6: `npm run eval` solo usa las 50 frases sintéticas versionadas y exige activación, clave y modelo en entorno privado. No se ejecutó sin credenciales. No se conecta con datos reales. Términos Gemini gratuito prohíben enviar información personal/confidencial/sensible: https://ai.google.dev/gemini-api/terms . Se requiere una decisión de privacidad y presupuesto antes de activar IA familiar.
- 2.4: interpretación pura no persistida; existe dependencia de tablas propuestas (4.1) y actividad. No se crean asignaciones ni propuestas simuladas.
- 2.9: medir en teléfono 10 capturas manuales desde pulsación hasta confirmación persistente (meta <=5 s); 10 dictados de frase de 5 s desde pulsación hasta confirmación (meta <=8 s), registrar red, dispositivo, fallos y mediana/máximo; evaluación de 50 casos >=90%, revisión de títulos y datos inventados =0. Aún sin medición física.

## 26-nov · Preparación sin clave y sin cambios de producción

- El propietario pospone rotar y almacenar la clave de Gemini hasta disponer de computador; no se utiliza la clave previamente compartida. Revocar esa clave y crear otra exclusiva de evaluación sin facturación; almacenar solo en GitHub Actions como GEMINI_API_KEY. No colocarla en Vercel ni copiarla al chat.
- Migración 0007 preparada en rama fase-2; **NO aplicada a producción**. Incluye propuestas (alta sin asignar a otro integrante), actividad interna sin texto, consentimiento individual nulo por defecto, reserva de trabajo con revisión, dos intentos, persistencia atómica, conservación del original y protección ante edición concurrente. La respuesta de una propuesta y sus avisos siguen en fase 4. Las nuevas tablas son prerrequisitos de 5.2/6.2/9.2, no avance formal de fase 4. El consentimiento no autoriza por sí solo el envío a un proveedor cuya modalidad no cumpla privacidad.
- Nuevo puerto y caso de uso de procesamiento, probado con sustitutos; no se activa desde ninguna pantalla. Falta adaptador de cola de producción, pantalla de consentimiento, política de privacidad del proveedor y tarjeta multiresultado. El arnés inicial 275ff86 detectó columna ambigua; se corrigió en 3cd070d. CI SQL aislado: https://github.com/valdivix-coder/norka/actions/runs/45830996056. Arnés de núcleo: https://github.com/valdivix-coder/norka/actions/runs/45830995992. No declarar éxito hasta confirmar conclusión.
- Evaluación sintética preparada en .github/workflows/evaluacion-gemini.yml: push únicamente en fase-2 al archivo evals/solicitud.json (no creado aún), sin PR externos ni ejecución automática con cambios normales; requiere secreto nuevo y proyecto sin facturación. La ejecución deja artefacto JSON de las frases ficticias y contabiliza aciertos, campos no sustentados por las expectativas, fallos y casos no procesados. Revisión manual de títulos/montos obligatoria; una discrepancia estructural no certifica por sí sola invención. El flujo no usa datos de Supabase. NO EJECUTADA.
- Modelo previsto gemini-3.8-flash según catálogo oficial; cuota/acceso de la cuenta NO VERIFICADOS. Ver https://ai.google.dev/gemini-api/docs/models y https://ai.google.dev/gemini-api/docs/rate-limits. Los servicios gratuitos no admiten datos personales, sensibles o confidenciales; https://ai.google.dev/gemini-api/terms. No activar interpretación real hasta resolver modalidad y restricciones (incluido acceso exclusivo de adultos). No se activa facturación.
- Fase 3: solo preparación documental en docs/fases/PREPARACION-FASE-3.md. Puerta de 13.2 todavía no cumplida; no fusionar fase 2 ni crear fase 3 funcional.

**Evidencia confirmada:** revisión 3cd070d: 145/145 pruebas del arnés mínimo aprobadas (https://github.com/valdivix-coder/norka/actions/runs/45830995992); PostgreSQL 17 aislado aplicó migraciones 0001–0007 y pasó las pruebas transaccionales 0005/0006/0007 (https://github.com/valdivix-coder/norka/actions/runs/45830996056). Incluye dos intentos, reserva previa, conservación del original, no asignación automática, revocación de consentimiento, conflicto de revisión, RLS e idempotencia. 0007 NO aplicada a Supabase de producción. Las pruebas no llamaron a Gemini. No se certifica aún el arnés completo de la última revisión, los 50 casos reales ni las metas físicas.
