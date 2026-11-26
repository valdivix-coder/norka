begin;
do $$
declare a uuid; ca uuid; cb uuid; cap uuid:=gen_random_uuid(); r jsonb; t uuid;
begin
  insert into public.cuentas(correo,nombre) values(gen_random_uuid()::text||'@example.invalid','QA A') returning id into ca;
  insert into public.cuentas(correo,nombre) values(gen_random_uuid()::text||'@example.invalid','QA B') returning id into cb;
  a:=(public.crear_familia(ca,'QA','padre',null,'corresponsable',null,null,null)->>'familia_id')::uuid;
  r:=public.guardar_captura(a,ca,cap,'Original QA','texto'); t:=(r->>'tarea_id')::uuid;
  r:=public.editar_resultado_captura(a,ca,cap,t,0,'Editada QA',false);
  if r->>'titulo'<>'Editada QA' or (r->>'revision')::int<>1 then raise exception 'QA_EDITAR'; end if;
  if (select texto_original from public.capturas where id=cap)<>'Original QA' then raise exception 'QA_ORIGINAL'; end if;
  begin
    perform public.editar_resultado_captura(a,ca,cap,t,0,'No sobrescribir',false);
    raise exception 'QA_CONCURRENCIA';
  exception when raise_exception then if sqlerrm<>'CONFLICTO_REVISION' then raise; end if; end;
  begin
    perform public.editar_resultado_captura(a,cb,cap,t,1,null,true);
    raise exception 'QA_AISLAMIENTO';
  exception when raise_exception then if sqlerrm<>'FUERA_DE_FAMILIA' then raise; end if; end;
  r:=public.editar_resultado_captura(a,ca,cap,t,1,null,true);
  if r->>'estado'<>'descartada' then raise exception 'QA_DESHACER'; end if;
end $$;
rollback;
