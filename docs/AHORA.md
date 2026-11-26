# Ahora

**Actualizado:** 26 de noviembre de 2026.

Fase 1 aprobada y fusionada por PR #1, main 75f8600, producción READY. Fase 2 en rama independiente. No avanzar a implementación formal de fase 3 sin la aprobación y metas de fase 2.

**Evidencia de referencia:** 141/141 pruebas, arnés completo aprobado en d1886f4 (45747776610). 0005 y 0006 aplicadas previamente, sin cambios en producción en esta intervención. Captura texto, cola offline, edición y deshacer manual validados en navegador.

**Trabajo nuevo:** migración 0007 aplicada y verificada (20261126145358); incluye propuestas, actividad, consentimiento, reserva, aplicación atómica e idempotencia. Caso de uso de procesamiento sin IA real; evaluación de Gemini aislada con activación explícita futura. CI SQL y núcleo de revisión 3cd070d aprobados; 145/145 pruebas. No se envían datos familiares.

**Pendientes en orden:**
1. Pruebas SQL 0007, arnés mínimo y recorrido completo aprobados. 0007 aplicada con autorización expresa y verificada en Supabase. No requiere intervención del propietario.
2. Cuando el propietario tenga computador: revocar clave compartida y guardar otra exclusivamente como secreto GitHub Actions GEMINI_API_KEY. Confirmar proyecto sin facturación y cuota. Ejecutar evaluación sintética (50 casos), revisar títulos/montos y campos inventados. No activar proveedor para datos familiares.
3. Completar adaptador acotado de cola, consentimiento visible, resultado múltiple/editar/deshacer, y definir modalidad compatible con privacidad. Probar voz en iPhone y cronometrar texto y voz según 12. Aprobar fase 2 solo con criterios cumplidos.
4. Iniciar fase 3 siguiendo 13.3; mapa preparado en PREPARACION-FASE-3.md. No implementar todavía sus pantallas o migraciones.

Enlace estable de pruebas: https://norka-git-fase-2-neuralia1.vercel.app/ . El callback de esta rama debe estar autorizado en Supabase. No quitar protección Vercel ni cambiar datos personales.

**Evidencia confirmada:** revisión 3cd070d: 145/145 pruebas del arnés mínimo aprobadas (https://github.com/valdivix-coder/norka/actions/runs/45830995992); PostgreSQL 17 aislado aplicó migraciones 0001–0007 y pasó las pruebas transaccionales 0005/0006/0007 (https://github.com/valdivix-coder/norka/actions/runs/45830996056). Incluye dos intentos, reserva previa, conservación del original, no asignación automática, revocación de consentimiento, conflicto de revisión, RLS e idempotencia. 0007 aplicada a Supabase de producción con autorización expresa. Las pruebas no llamaron a Gemini. Arnés completo del código aprobado; los 50 casos de Gemini y las metas físicas aún no comprobados.

## 26-nov · Aplicación autorizada de 0007 en Supabase

El propietario autorizó expresamente aplicar 0007 con el conector, como excepción puntual a la regla de aplicación manual. Se comprobó que las tablas y la migración no existían, que la cola existía y que el SQL coincidía exactamente con la revisión 3cd070d aprobada en PostgreSQL aislado. Aplicada correctamente: `20261126145358` (0007_interpretacion), 11:53 Chile. Consultas posteriores: actividad y propuestas con RLS=true, 0 políticas, anon/authenticated sin acceso, service_role con permisos; cuatro funciones SECURITY INVOKER con EXECUTE solo del servidor; trigger captura_registro_interno habilitado. Prueba 0007_prueba.sql ejecutada sin errores dentro de BEGIN/ROLLBACK; sin registros sintéticos persistidos. Asesor de seguridad: INFO RLS sin políticas deliberado por arquitectura §9.2; WARN de protección de contraseñas filtradas, revisar antes de habilitar entrada con contraseña, fuera de alcance actual. No se habilitó Gemini ni se reinterpretaron capturas previas. No se cambió la configuración de autenticación. No fusionar fase 2 aún.

Arnés mínimo 145/145 y SQL aislado aprobados en 3cd070d; recorrido completo del código ab3be8c también aprobado (https://github.com/valdivix-coder/norka/actions/runs/45830947208); el cambio posterior 3cd070d solo corrige SQL. Pendientes: rotación de clave compartida y secreto GitHub Actions, evaluación sintética, política de privacidad para uso real, adaptador acotado de cola, consentimiento visible, resultado múltiple y deshacer, pruebas de voz/tiempos reales y aprobación fase 2. No requiere que el propietario repita ninguna migración hasta 0007. La fase 3 permanece en preparación documental.

## 26-nov · Evaluación y modelos preferidos

El propietario confirma revocación de clave anterior y secreto GEMINI_API_KEY guardado. Primera corrida 45845412670 (3.8 Flash): 7/50 intentados, 0 respuestas válidas, errores 503/429 y sin salida válida; 43 no ejecutados. No es medición de precisión. Se configura por instrucción del propietario 4 Hydrogen → 3.8 Flash → 3.5 Flash-Lite (identificadores oficiales, https://ai.google.dev/gemini-api/docs/pricing, 26-nov). Respaldo solo en evaluación sintética, límites por modelo: un intento por caso/modelo, suspende 429/404 en la corrida, 401/403 no rota, máximo 20 s por solicitud, sin facturación activada, no se puede verificar plan de cuenta desde GitHub. Se registra modelo usado por caso. Adaptador REST de cola familiar acotada implementado pero desconectado de Gemini; pruebas nuevas. No enviar datos reales al nivel gratuito. Pendiente evaluación de cadena y UI de consentimiento/multiresultado; no fusionar ni aprobar fase 2. Vuelta atrás: revertir commits de adaptadores y flujo; no cambiar esquema.
