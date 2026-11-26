-- Solo lectura. Debe devolver cuatro filas con resultado = 'OK'.
select p.proname as funcion,
  p.prosecdef = false as usa_permisos_de_quien_llama,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as servidor_puede,
  not has_function_privilege('anon', p.oid, 'EXECUTE')
    and not has_function_privilege('authenticated', p.oid, 'EXECUTE') as publico_no_puede,
  case when p.prosecdef = false
    and has_function_privilege('service_role', p.oid, 'EXECUTE')
    and not has_function_privilege('anon', p.oid, 'EXECUTE')
    and not has_function_privilege('authenticated', p.oid, 'EXECUTE')
  then 'OK' else 'REVISAR' end as resultado
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('repartir_cuotas','color_integrante','crear_familia','aceptar_invitacion')
order by p.proname;
