-- public.cuentas debe existir y public.sesiones debe estar ausente.
select to_regclass('public.cuentas') is not null as cuentas_existe,
  to_regclass('public.sesiones') is null as sesiones_por_crear;
