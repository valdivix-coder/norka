-- Solo lectura. Debe devolver seis filas con resultado = 'OK'.
with esperadas(nombre) as (
  select unnest(array['cuentas','identidades','familias','integrantes',
    'invitaciones','preferencias'])
)
select e.nombre, c.relrowsecurity as rls,
  (select count(*) from pg_policy p where p.polrelid = c.oid) as politicas,
  case when c.oid is not null and c.relrowsecurity
    and not exists (select 1 from pg_policy p where p.polrelid = c.oid)
    and not exists (
      select 1 from unnest(array['SELECT','INSERT','UPDATE','DELETE',
        'TRUNCATE','REFERENCES','TRIGGER']) as privilegio
      where has_table_privilege('anon', c.oid, privilegio)
         or has_table_privilege('authenticated', c.oid, privilegio)
    )
    and not exists (
      select 1 from unnest(array['SELECT','INSERT','UPDATE','DELETE']) as privilegio
      where not has_table_privilege('service_role', c.oid, privilegio)
    ) then 'OK' else 'REVISAR' end as resultado
from esperadas e
left join pg_class c on c.oid = to_regclass('public.' || e.nombre)
order by e.nombre;

-- Inventario de restricciones para revisar relaciones, unicidad y validaciones.
select conrelid::regclass as tabla, conname as restriccion,
  pg_get_constraintdef(oid) as definicion
from pg_constraint
where conrelid in (
  to_regclass('public.cuentas'), to_regclass('public.identidades'),
  to_regclass('public.familias'), to_regclass('public.integrantes'),
  to_regclass('public.invitaciones'), to_regclass('public.preferencias')
)
order by tabla, restriccion;
