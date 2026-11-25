-- Las cuatro funciones deben estar ausentes y las tablas de las que dependen deben existir.
select
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('repartir_cuotas','color_integrante','crear_familia','aceptar_invitacion')) = 0
    as funciones_por_crear,
  to_regclass('public.integrantes') is not null as integrantes_existe,
  to_regclass('public.invitaciones') is not null as invitaciones_existe;
