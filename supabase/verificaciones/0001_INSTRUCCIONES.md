# Preparar las cuentas y familias de norka

La tarea 1.4 está preparada para que Simón aplique el cambio. La sección 9.2.10 del prompt maestro reserva ese paso para la propietaria.

## Antes de aplicar

Primero hay que identificar el proyecto de norka. La conexión disponible muestra dos proyectos, «Ideafix» y «valdivix-coder's Project». El destino está pendiente de confirmación.

1. Abrir el proyecto confirmado en Supabase y entrar en **SQL Editor**.
2. Copiar el contenido de [0001_antes.sql](0001_antes.sql) en una consulta nueva y ejecutar **Run**.
3. Deben aparecer seis tablas con `existe = false`, los roles `anon`, `authenticated` y `service_role`, y `bypassrls = true` para el último.
4. Si alguna tabla ya existe, revisar el resultado con el asistente antes de continuar. Así evitamos confundir una aplicación anterior con una base vacía.

## Aplicar y comprobar

1. Abrir una consulta nueva y copiar íntegro [0001_cuentas_y_familias.sql](../migrations/0001_cuentas_y_familias.sql).
2. Pulsar **Run** una vez. Las instrucciones están dentro de una transacción. Si aparece un error antes de terminar, ejecutar `ROLLBACK;` en la misma sesión y conservar el mensaje del error.
3. En una consulta nueva ejecutar [0001_despues.sql](0001_despues.sql).
4. Comprobar seis filas con `resultado = OK`, `rls = true` y `politicas = 0`. La segunda consulta muestra las restricciones de datos.
5. Confirmar al asistente que se aplicó y compartir esos resultados, que contienen metadatos de las tablas.

La repetición accidental detecta que las tablas existen y detiene la transacción. Las tablas originales conservan sus datos.

## Vuelta atrás

Antes de confirmar la transacción, `ROLLBACK;` revierte los cambios de esa sesión. Después de confirmar, volver a la versión anterior de la aplicación y conservar las seis tablas protegidas. Una corrección posterior se entrega como otra migración aditiva. La vuelta atrás también está escrita al pie de la migración.

## Decisiones técnicas

- Las cuentas y sus identidades existen antes de elegir familia. Las preferencias pertenecen al integrante mediante su clave foránea. Se respeta esa estructura de la sección 5.2.
- `creada_por` referencia al integrante dentro de la misma familia. La base rechaza referencias cruzadas.
- Los correos de cuenta son únicos sin distinguir mayúsculas ni espacios exteriores. El servidor deberá verificar el correo antes de vincular identidades, en 1.5.
- Cada registro editable incorpora `revision`. El uso de esa revisión para detectar ediciones simultáneas corresponde al almacén de 1.6.
- `casa_id` se incorpora junto con su relación a `casas` en 5.9, conforme al orden explícito del plan.
- Las preferencias incluyen las once categorías de 6.15. La obligación de recibir avisos de tomas mientras se está a cargo se implementará junto con los tratamientos.
- Los valores internos de rol `cuidador`, `abuelo` y `tio` corresponden a las opciones cuidador/a, abuelo/a y tío/a. La etiqueta personal admite hasta 20 caracteres.
- Los campos de cumpleaños permiten el 29 de febrero, sin almacenar año. Las pausas admiten un intervalo completo de fechas.

## Comprobaciones realizadas

La migración y ambas consultas se ejecutaron en una base temporal PGlite 0.5.17, motor PostgreSQL 18.7. Esta herramienta se usó fuera del repositorio y no se agregó como dependencia de la aplicación. Se verificaron valores iniciales, unicidad, fechas, teléfonos, permisos, separación de familias en invitaciones y repetición accidental. [Salida real](../../docs/fases/evidencia-1-4/prueba-sql.txt)

NO VERIFICADO: ejecución en el proyecto real de Supabase. Se comprueba siguiendo los pasos anteriores. La prueba temporal valida SQL y restricciones, y la aplicación real permite confirmar además los roles y configuración del proyecto elegido.

Se consultaron la documentación de RLS y el registro de cambios de Supabase. El cambio de exposición automática de tablas se cubre mediante concesiones explícitas de permisos a `service_role`.

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/changelog
