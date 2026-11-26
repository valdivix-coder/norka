-- Solo lectura. Deben aparecer seis filas, todas con existe = false.
-- Si una ya existe, revisar 0001_despues.sql y detenerse antes de aplicar.
select nombre, to_regclass('public.' || nombre) is not null as existe
from unnest(array['cuentas','identidades','familias','integrantes',
  'invitaciones','preferencias']) as nombre;

-- Deben existir los tres roles. service_role debe tener bypassrls = true.
select rolname, rolbypassrls as bypassrls
from pg_roles where rolname in ('anon', 'authenticated', 'service_role')
order by rolname;

select current_database() as base, current_user as ejecutor,
  current_setting('server_version') as version_postgresql;
