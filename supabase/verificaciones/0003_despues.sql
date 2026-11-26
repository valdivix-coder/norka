-- Solo lectura. Debe devolver una fila con resultado = 'OK'.
select c.relname as nombre, c.relrowsecurity as rls,
  (select count(*) from pg_policy p where p.polrelid = c.oid) as politicas,
  case when c.relrowsecurity
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
from pg_class c where c.oid = to_regclass('public.sesiones');
