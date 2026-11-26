-- Debe devolver las 4 tablas base existentes y ninguna de captura; si aparece alguna nueva, detenerse.
select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' and c.relname in
('familias','integrantes','personas_a_cargo','ambitos','responsabilidades','tareas','capturas','trabajos_ia') order by c.relname;
select con.conrelid::regclass as tabla,pg_get_constraintdef(con.oid) as restriccion
from pg_constraint con where con.conrelid in ('public.integrantes'::regclass,'public.personas_a_cargo'::regclass,'public.ambitos'::regclass)
and con.contype in ('p','u') order by 1,2;
