-- public.familias debe existir y las otras dos tablas deben estar ausentes.
select to_regclass('public.familias') is not null as familias_existe,
  to_regclass('public.personas_a_cargo') is null as personas_por_crear,
  to_regclass('public.ambitos') is null as ambitos_por_crear;
