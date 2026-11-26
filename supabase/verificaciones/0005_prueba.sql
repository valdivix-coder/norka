-- Prueba transaccional aislada: no deja datos. Ejecutar en editor SQL después de 0005.
begin;
do $$
declare a uuid; b uuid; ca uuid; cb uuid; ia uuid; ib uuid; cap uuid := gen_random_uuid(); r jsonb; r2 jsonb; cantidad integer;
begin
  insert into public.cuentas(correo,nombre) values (gen_random_uuid()::text||'@example.invalid','QA A') returning id into ca;
  insert into public.cuentas(correo,nombre) values (gen_random_uuid()::text||'@example.invalid','QA B') returning id into cb;
  a := (public.crear_familia(ca,'QA A','padre',null,'corresponsable',null,null,null)->>'familia_id')::uuid;
  b := (public.crear_familia(cb,'QA B','padre',null,'corresponsable',null,null,null)->>'familia_id')::uuid;
  select id into ia from public.integrantes where familia_id=a and cuenta_id=ca;
  select id into ib from public.integrantes where familia_id=b and cuenta_id=cb;
  r := public.guardar_captura(a,ca,cap,'QA texto original','texto');
  r2 := public.guardar_captura(a,ca,cap,'QA texto original','texto');
  if r is distinct from r2 then raise exception 'QA_IDEMPOTENCIA'; end if;
  select count(*) into cantidad from public.tareas where familia_id=a and captura_id=cap and por_revisar and titulo='QA texto original';
  if cantidad<>1 then raise exception 'QA_TAREA'; end if;
  begin
    perform public.guardar_captura(a,cb,gen_random_uuid(),'QA','texto');
    raise exception 'QA_FALLO_AISLAMIENTO';
  exception when raise_exception then
    if sqlerrm<>'FUERA_DE_FAMILIA' then raise; end if;
  end;
  begin
    insert into public.tareas(familia_id,titulo,ejecutor_id) values(a,'QA ajena',ib);
    raise exception 'QA_FALLO_FK';
  exception when foreign_key_violation then null;
  end;
  begin
    perform public.guardar_captura(a,ca,cap,'QA distinto','texto');
    raise exception 'QA_FALLO_CONFLICTO';
  exception when raise_exception then
    if sqlerrm<>'CAPTURA_CONFLICTO' then raise; end if;
  end;
  raise notice 'QA 0005: guardado original, idempotencia, aislamiento, conflicto aprobados';
end $$;
rollback;
