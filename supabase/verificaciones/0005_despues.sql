-- Cuatro tablas con RLS activo, sin políticas y sin permisos de roles de navegador.
select c.relname,c.relrowsecurity,
has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') as anon_acceso,
has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE') as autenticado_acceso,
has_table_privilege('service_role',c.oid,'SELECT') as servidor_lectura,
(select count(*) from pg_policy p where p.polrelid=c.oid) as politicas
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' and c.relname in ('responsabilidades','tareas','capturas','trabajos_ia') order by c.relname;
select con.conrelid::regclass as tabla, pg_get_constraintdef(con.oid) as restriccion
from pg_constraint con where con.conrelid in ('public.responsabilidades'::regclass,'public.tareas'::regclass,'public.capturas'::regclass,'public.trabajos_ia'::regclass) and con.contype='f' order by 1,2;
select p.proname,p.prosecdef,
has_function_privilege('anon',p.oid,'EXECUTE') as anon_ejecuta,
has_function_privilege('authenticated',p.oid,'EXECUTE') as autenticado_ejecuta,
has_function_privilege('service_role',p.oid,'EXECUTE') as servidor_ejecuta
from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='guardar_captura';
