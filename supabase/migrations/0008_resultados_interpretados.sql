-- 2.7: edición y deshacer de resultados interpretados; conserva texto original.
-- No modifica las capturas manuales ni activa IA.
create function public.gestionar_resultados_interpretados(p_familia uuid,p_cuenta uuid,p_captura uuid,p_cambios jsonb,p_deshacer boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare autor uuid; c public.capturas%rowtype; e jsonb; n integer; esperado integer;
  objeto uuid; clase text; rev bigint; nuevo_titulo text; rev_prop bigint;
  t public.tareas%rowtype; resp public.responsabilidades%rowtype; prop public.propuestas%rowtype;
  salida jsonb:='[]'::jsonb; ids uuid[]:='{}'::uuid[];
begin
  select id into autor from public.integrantes where familia_id=p_familia and cuenta_id=p_cuenta and estado='activo' for share;
  if autor is null then raise exception 'FUERA_DE_FAMILIA';end if;
  select * into c from public.capturas where familia_id=p_familia and id=p_captura and autor_id=autor and estado='interpretada' for update;
  if not found then raise exception 'CAPTURA_NO_EDITABLE';end if;
  if p_deshacer is null or jsonb_typeof(p_cambios) is distinct from 'array' then raise exception 'CAMBIOS_INVALIDOS';end if;
  n:=jsonb_array_length(p_cambios);
  if n not between 1 and 50 then raise exception 'CAMBIOS_INVALIDOS';end if;
  -- Lock stable set before checking revisions. The original fallback is already discarded.
  perform 1 from public.tareas where familia_id=p_familia and captura_id=p_captura order by id for update;
  perform 1 from public.responsabilidades where familia_id=p_familia and captura_id=p_captura order by id for update;
  if p_deshacer then
    select (select count(*) from public.tareas where familia_id=p_familia and captura_id=p_captura and estado<>'descartada')
      +(select count(*) from public.responsabilidades where familia_id=p_familia and captura_id=p_captura and estado<>'archivada') into esperado;
    if n<>esperado then raise exception 'CONFLICTO_REVISION';end if;
  end if;
  for e in select value from jsonb_array_elements(p_cambios) loop
    objeto:=(e->>'id')::uuid;clase:=e->>'tipo';rev:=(e->>'revision')::bigint;nuevo_titulo:=e->>'titulo';
    rev_prop:=(e->>'revision_propuesta')::bigint;
    if objeto is null or objeto=any(ids) or clase is null or clase not in ('tarea','responsabilidad') or rev is null or rev<0
      or (not p_deshacer and (nuevo_titulo is null or btrim(nuevo_titulo)='')) then raise exception 'CAMBIOS_INVALIDOS';end if;
    ids:=array_append(ids,objeto);
    if clase='tarea' then
      select * into t from public.tareas where familia_id=p_familia and captura_id=p_captura and id=objeto;
      if not found or t.revision<>rev or t.estado<>'pendiente' or t.ejecutor_id is not null then raise exception 'CONFLICTO_REVISION';end if;
    else
      select * into resp from public.responsabilidades where familia_id=p_familia and captura_id=p_captura and id=objeto;
      if not found or resp.revision<>rev or resp.estado not in ('activa','pausada') or resp.titular_id is not null then raise exception 'CONFLICTO_REVISION';end if;
      if p_deshacer and exists(select 1 from public.tareas where familia_id=p_familia and responsabilidad_id=objeto) then raise exception 'CONFLICTO_REVISION';end if;
    end if;
    select * into prop from public.propuestas where familia_id=p_familia and
      ((clase='tarea' and tarea_id=objeto) or (clase='responsabilidad' and responsabilidad_id=objeto)) for update;
    if found then
      if prop.de_id<>autor or prop.estado<>'enviada' or prop.respondida_en is not null or rev_prop is distinct from prop.revision then raise exception 'CONFLICTO_REVISION';end if;
      -- Retirar solo una propuesta aún no respondida. Se conserva el registro interno y el original.
      if p_deshacer then delete from public.propuestas where familia_id=p_familia and id=prop.id;end if;
    elsif rev_prop is not null then raise exception 'CONFLICTO_REVISION';
    end if;
    if clase='tarea' then
      update public.tareas set titulo=case when p_deshacer then t.titulo else nuevo_titulo end,
        estado=case when p_deshacer then 'descartada' else t.estado end,revision=rev+1 where familia_id=p_familia and id=objeto;
    else
      update public.responsabilidades set titulo=case when p_deshacer then resp.titulo else nuevo_titulo end,
        estado=case when p_deshacer then 'archivada' else resp.estado end,revision=rev+1 where familia_id=p_familia and id=objeto;
    end if;
    insert into public.actividad(familia_id,actor_id,tipo,objeto_tipo,objeto_id,en_actividad)
      values(p_familia,autor,case when p_deshacer then 'captura_resultado_deshecho' else 'captura_resultado_editado' end,clase,objeto,false);
    salida:=salida||jsonb_build_array(jsonb_build_object('id',objeto,'tipo',clase,'revision',rev+1));
  end loop;
  update public.capturas set revision=revision+1 where familia_id=p_familia and id=p_captura;
  return salida;
end $$;
revoke all on function public.gestionar_resultados_interpretados(uuid,uuid,uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.gestionar_resultados_interpretados(uuid,uuid,uuid,jsonb,boolean) to service_role;
-- Vuelta atrás: dejar función sin llamar. No borrar originales ni revertir datos.
