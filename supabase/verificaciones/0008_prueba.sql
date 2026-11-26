begin;
do $$
declare a uuid; b uuid; ca uuid; cb uuid; cc uuid; ia uuid; ib uuid; ic uuid; h uuid; amb uuid;
 cap uuid:=gen_random_uuid(); cap2 uuid:=gen_random_uuid(); cap3 uuid:=gen_random_uuid(); j jsonb; r jsonb; plan jsonb; original uuid; cambios jsonb; tarea_propuesta uuid; tarea_normal uuid; propuesta uuid;
begin
 insert into public.cuentas(correo,nombre) values(gen_random_uuid()::text||'@example.invalid','QA A') returning id into ca;
 insert into public.cuentas(correo,nombre) values(gen_random_uuid()::text||'@example.invalid','QA B') returning id into cb;
 insert into public.cuentas(correo,nombre) values(gen_random_uuid()::text||'@example.invalid','QA C') returning id into cc;
 a:=(public.crear_familia(ca,'QA A','padre',null,'corresponsable',null,null,null)->>'familia_id')::uuid;
 b:=(public.crear_familia(cb,'QA B','padre',null,'corresponsable',null,null,null)->>'familia_id')::uuid;
 select id into ia from public.integrantes where familia_id=a and cuenta_id=ca;
 select id into ib from public.integrantes where familia_id=b and cuenta_id=cb;
 insert into public.integrantes(familia_id,cuenta_id,rol_familiar,permiso,participacion,cuota_objetivo,color,icono)
 values(a,cc,'madre','integrante','corresponsable',0,'persona-2','inicial') returning id into ic;
 select id into h from public.personas_a_cargo where familia_id=a and tipo='hogar';
 select id into amb from public.ambitos where familia_id=a limit 1;
 r:=public.guardar_captura(a,ca,cap,'QA original','texto'); original:=(r->>'tarea_id')::uuid;
 if (select count(*) from public.actividad where objeto_id=cap and not en_actividad)<>1 then raise exception 'QA_ACTIVIDAD'; end if;
 begin
  perform public.reservar_interpretacion(a,ca,cap);raise exception 'QA_SIN_CONSENTIMIENTO';
 exception when raise_exception then if sqlerrm<>'SIN_CONSENTIMIENTO_O_ACCESO' then raise;end if;end;
 perform public.decidir_consentimiento_ia(a,ca,true);
 j:=public.reservar_interpretacion(a,ca,cap);
 if j is null or public.reservar_interpretacion(a,ca,cap) is not null then raise exception 'QA_RESERVA';end if;
 plan:=jsonb_build_array(jsonb_build_object('tipo','propuesta','titulo','QA propuesta','persona_a_cargo_id',h,'ambito_id',amb,
  'dirigida_a_id',ib,'ejecutor_id',null,'por_revisar',false,'plazo_fecha',null,'plazo_hora',null,'recurrencia',null));
 begin
  perform public.aplicar_interpretacion(a,ca,cap,(j->>'revision')::bigint,plan,false);raise exception 'QA_AJENO';
 exception when raise_exception then if sqlerrm<>'DESTINATARIO_INVALIDO' then raise;end if;end;
 if (select estado from public.tareas where id=original)<>'pendiente' then raise exception 'QA_ATOMICIDAD';end if;
 plan:=jsonb_set(plan,'{0,dirigida_a_id}',to_jsonb(ic))||jsonb_build_array(jsonb_build_object(
 'tipo','tarea','titulo','QA tarea','persona_a_cargo_id',h,'ambito_id',amb,'dirigida_a_id',null,'ejecutor_id',null,'por_revisar',false));
 r:=public.aplicar_interpretacion(a,ca,cap,(j->>'revision')::bigint,plan,false);
 if r->>'estado'<>'aplicada' or jsonb_array_length(r->'objetos')<>2 then raise exception 'QA_APLICAR';end if;
 if (select count(*) from public.propuestas where familia_id=a and para_id=ic and estado='enviada')<>1 then raise exception 'QA_PROPUESTA';end if;
 if exists(select 1 from public.tareas where captura_id=cap and ejecutor_id is not null) then raise exception 'QA_ASIGNACION';end if;
 if (public.aplicar_interpretacion(a,ca,cap,(j->>'revision')::bigint,plan,false)->>'estado')<>'ya_aplicada' then raise exception 'QA_IDEMPOTENCIA';end if;
 if (select count(*) from public.tareas where captura_id=cap and estado='pendiente')<>2 then raise exception 'QA_DUPLICADO';end if;
 if (select texto_original from public.capturas where id=cap)<>'QA original' then raise exception 'QA_ORIGINAL';end if;
 select id,tarea_id into propuesta,tarea_propuesta from public.propuestas where familia_id=a and para_id=ic;
 select id into tarea_normal from public.tareas where familia_id=a and captura_id=cap and estado='pendiente' and id<>tarea_propuesta;
 cambios:=jsonb_build_array(jsonb_build_object('id',tarea_normal,'tipo','tarea','revision',0,'titulo','QA corregida'));
 begin
  perform public.gestionar_resultados_interpretados(a,cc,cap,cambios,false);raise exception 'QA_AUTOR';
 exception when raise_exception then if sqlerrm<>'CAPTURA_NO_EDITABLE' then raise;end if;end;
 perform public.gestionar_resultados_interpretados(a,ca,cap,cambios,false);
 if not exists(select 1 from public.tareas where id=tarea_normal and titulo='QA corregida' and revision=1) then raise exception 'QA_EDICION_MULTIPLE';end if;
 cambios:=jsonb_build_array(jsonb_build_object('id',tarea_propuesta,'tipo','tarea','revision',0,'revision_propuesta',0),
 jsonb_build_object('id',tarea_normal,'tipo','tarea','revision',0));
 begin
  perform public.gestionar_resultados_interpretados(a,ca,cap,cambios,true);raise exception 'QA_REVISION';
 exception when raise_exception then if sqlerrm<>'CONFLICTO_REVISION' then raise;end if;end;
 if not exists(select 1 from public.propuestas where id=propuesta) or not exists(select 1 from public.tareas where id=tarea_propuesta and estado='pendiente') then raise exception 'QA_ROLLBACK';end if;
 cambios:=jsonb_set(cambios,'{1,revision}','1'::jsonb);
 perform public.gestionar_resultados_interpretados(a,ca,cap,cambios,true);
 if exists(select 1 from public.propuestas where id=propuesta) or exists(select 1 from public.tareas where captura_id=cap and estado='pendiente') then raise exception 'QA_DESHACER_MULTIPLE';end if;
 if (select texto_original from public.capturas where id=cap)<>'QA original' then raise exception 'QA_ORIGINAL';end if;
 if has_function_privilege('anon','public.gestionar_resultados_interpretados(uuid,uuid,uuid,jsonb,boolean)','EXECUTE') or has_function_privilege('authenticated','public.gestionar_resultados_interpretados(uuid,uuid,uuid,jsonb,boolean)','EXECUTE') then raise exception 'QA_ACCESO';end if;
 perform public.guardar_captura(a,ca,cap2,'QA sin clasificar','texto');
 j:=public.reservar_interpretacion(a,ca,cap2);
 if (public.aplicar_interpretacion(a,ca,cap2,(j->>'revision')::bigint,null,true)->>'estado')<>'reintentar' then raise exception 'QA_REINTENTO';end if;
 j:=public.reservar_interpretacion(a,ca,cap2);
 if (j->>'intentos')::integer<>2 then raise exception 'QA_INTENTOS';end if;
 perform public.aplicar_interpretacion(a,ca,cap2,(j->>'revision')::bigint,null,true);
 if (select estado from public.capturas where id=cap2)<>'fallida' then raise exception 'QA_FALLO_FINAL';end if;
 if not exists(select 1 from public.tareas where captura_id=cap2 and estado='pendiente' and por_revisar) then raise exception 'QA_FALLBACK';end if;
 r:=public.guardar_captura(a,ca,cap3,'QA edición','texto');
 j:=public.reservar_interpretacion(a,ca,cap3);
 perform public.editar_resultado_captura(a,ca,cap3,(r->>'tarea_id')::uuid,0,'QA editada',false);
 begin
  perform public.aplicar_interpretacion(a,ca,cap3,(j->>'revision')::bigint,plan,false);raise exception 'QA_EDICION';
 exception when raise_exception then if sqlerrm<>'CAPTURA_MODIFICADA' then raise;end if;end;
 if not exists(select 1 from public.tareas where captura_id=cap3 and titulo='QA editada') then raise exception 'QA_EDICION_PERDIDA';end if;
 perform public.decidir_consentimiento_ia(a,ca,false);
 begin
  perform public.reservar_interpretacion(a,ca,cap3);raise exception 'QA_REVOCACION';
 exception when raise_exception then if sqlerrm<>'SIN_CONSENTIMIENTO_O_ACCESO' then raise;end if;end;
 if exists(select 1 from pg_class c where c.oid in ('public.propuestas'::regclass,'public.actividad'::regclass) and
 (not c.relrowsecurity or has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') or has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE'))) then raise exception 'QA_RLS';end if;
 raise notice 'QA 0008: edición múltiple, deshacer atómico, aislamiento y original conservado';
end $$;
rollback;
