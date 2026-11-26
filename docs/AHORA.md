# Ahora

**Actualizado:** 26 de noviembre de 2026.

Fase 1 aprobada y fusionada por PR #1, main 75f8600, producción READY. Fase 2 en rama independiente. No avanzar a implementación formal de fase 3 sin la aprobación y metas de fase 2.

**Evidencia de referencia:** 141/141 pruebas, arnés completo aprobado en d1886f4 (45747776610). 0005 y 0006 aplicadas previamente, sin cambios en producción en esta intervención. Captura texto, cola offline, edición y deshacer manual validados en navegador.

**Trabajo nuevo:** migración 0007 preparada pero NO aplicada; incluye propuestas, actividad, consentimiento, reserva, aplicación atómica e idempotencia. Caso de uso de procesamiento sin IA real; evaluación de Gemini aislada con activación explícita futura. CI SQL y núcleo de revisión 3cd070d aprobados; 145/145 pruebas. No se envían datos familiares.

**Pendientes en orden:**
1. Pruebas SQL 0007 y arnés mínimo aprobadas; comprobar arnés completo. Aplicar 0007 solo por el procedimiento de producción autorizado conforme 9.2.10, después de revisar antes/después.
2. Cuando el propietario tenga computador: revocar clave compartida y guardar otra exclusivamente como secreto GitHub Actions GEMINI_API_KEY. Confirmar proyecto sin facturación y cuota. Ejecutar evaluación sintética (50 casos), revisar títulos/montos y campos inventados. No activar proveedor para datos familiares.
3. Completar adaptador acotado de cola, consentimiento visible, resultado múltiple/editar/deshacer, y definir modalidad compatible con privacidad. Probar voz en iPhone y cronometrar texto y voz según 12. Aprobar fase 2 solo con criterios cumplidos.
4. Iniciar fase 3 siguiendo 13.3; mapa preparado en PREPARACION-FASE-3.md. No implementar todavía sus pantallas o migraciones.

Enlace estable de pruebas: https://norka-git-fase-2-neuralia1.vercel.app/ . El callback de esta rama debe estar autorizado en Supabase. No quitar protección Vercel ni cambiar datos personales.

**Evidencia confirmada:** revisión 3cd070d: 145/145 pruebas del arnés mínimo aprobadas (https://github.com/valdivix-coder/norka/actions/runs/45830995992); PostgreSQL 17 aislado aplicó migraciones 0001–0007 y pasó las pruebas transaccionales 0005/0006/0007 (https://github.com/valdivix-coder/norka/actions/runs/45830996056). Incluye dos intentos, reserva previa, conservación del original, no asignación automática, revocación de consentimiento, conflicto de revisión, RLS e idempotencia. 0007 NO aplicada a Supabase de producción. Las pruebas no llamaron a Gemini. No se certifica aún el arnés completo de la última revisión, los 50 casos reales ni las metas físicas.
