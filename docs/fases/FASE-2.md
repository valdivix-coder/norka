# Fase 2 — Captura

## 2.1 · Migración 0005

Preparada a partir de la fase 1 autorizada; rama fase-2. 0003 del prompt ya está ocupada por sesiones, 0004 por familias; 0005 agrega responsabilidades, tareas, capturas y trabajos_ia. Todas las referencias a objetos familiares usan FK compuesta (familia_id,id). RLS sin políticas, solo servicio. El RPC guardar_captura es SECURITY INVOKER, comprueba pertenencia activa, guarda texto original y tarea sin clasificar atómicamente, e impide duplicación por reenvío del mismo UUID. No encola IA sin consentimiento. La referencia a ficha de pago queda pendiente de la tabla de fase posterior. Estados técnicos de trabajo: pendiente/reservado/aplicado/fallido; no se usa aún el modelo. Las consultas antes/después y prueba transaccional sin datos reales se encuentran en supabase/verificaciones. No se ha aplicado aún. No se activa captura hasta comprobar migración.

Siguiente: 2.2. No declarar fase 2 aprobada sin cumplir 2.9 y las metas del prompt maestro.
