# Migración 0002 · Personas a cargo y ámbitos

Preparada y probada en una base temporal. La aplica Simón según 9.2.10. La migración crea las dos tablas, sus permisos y la creación automática de «El hogar» y los ocho ámbitos al crear una familia. También completa las familias que ya existan.

1. Abrir [el editor SQL de norka](https://supabase.com/dashboard/project/yplhlooidqzqhrjbwrdp/sql/new).
2. Ejecutar [0002_antes.sql](0002_antes.sql). Las tres columnas deben indicar true.
3. Copiar íntegro [0002_personas_y_ambitos.sql](../migrations/0002_personas_y_ambitos.sql) y pulsar Run una vez. Se espera Success. No rows returned.
4. Ejecutar [0002_despues.sql](0002_despues.sql). Debe mostrar dos tablas con resultado OK. La segunda consulta puede devolver cero filas si todavía no hay familias. Cada familia recién inicializada tendrá un hogar y ocho ámbitos.
5. Confirmar al asistente que se ejecutó para que compruebe el resultado directamente.

La creación de familia y sus datos iniciales comparten transacción. Si algo falla, se revierte toda esa creación. El hogar tiene protección contra archivo, borrado y cambio de tipo.

Los colores se guardan como claves de los tokens de la guía, por ejemplo `ambito-salud`. Los ocho nombres y la obligación de plazo siguen las secciones 5.1 y 5.2. Las funciones usan los permisos de quien las ejecuta.

La vuelta atrás está al pie del SQL. Antes de confirmar la transacción se usa ROLLBACK. Después se conserva el esquema y sus datos y se vuelve al código anterior.

NO VERIFICADO: aplicación real en Supabase. La prueba local usó PGlite 0.5.17, PostgreSQL 18.7, y comprobó familias previas, nuevas, permisos, creación automática y protección del hogar. [Salida real](../../docs/fases/evidencia-1-8/prueba-0002.txt)
