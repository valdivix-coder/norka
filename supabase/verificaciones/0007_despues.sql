select c.relname,c.relrowsecurity,has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') as anon,
has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE') as autenticado,
has_table_privilege('service_role',c.oid,'SELECT') as servidor
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('propuestas','actividad');
select proname,prosecdef,has_function_privilege('anon',p.oid,'EXECUTE') as anon,
has_function_privilege('authenticated',p.oid,'EXECUTE') as autenticado,
has_function_privilege('service_role',p.oid,'EXECUTE') as servidor
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and proname in ('registrar_captura_interna','decidir_consentimiento_ia','reservar_interpretacion','aplicar_interpretacion');
