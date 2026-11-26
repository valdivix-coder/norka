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
