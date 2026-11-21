-- Solo lectura. Debe devolver dos filas con resultado = 'OK'.
with esperadas(nombre) as (
  select unnest(array['personas_a_cargo','ambitos'])
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


-- Cada familia debe tener un hogar activo. Las familias recién creadas tienen 8 ámbitos.
select f.id as familia_id,
  (select count(*) from public.personas_a_cargo p where p.familia_id=f.id and p.tipo='hogar' and p.archivada_en is null) as hogares,
  (select count(*) from public.ambitos a where a.familia_id=f.id) as ambitos
from public.familias f;
