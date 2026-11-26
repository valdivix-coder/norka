select to_regclass('public.propuestas') is null as propuestas_nueva,
to_regclass('public.actividad') is null as actividad_nueva,
to_regclass('public.trabajos_ia') is not null as cola_existe;
