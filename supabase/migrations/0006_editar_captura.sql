-- 2.7: editar o deshacer una captura manual, conservando el original y la revisión.
create function public.editar_resultado_captura(p_familia uuid,p_cuenta uuid,p_captura uuid,p_tarea uuid,p_revision bigint,p_titulo text,p_descartar boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare autor uuid; resultado public.tareas%rowtype;
begin
  select id into autor from public.integrantes where familia_id=p_familia and cuenta_id=p_cuenta and estado='activo' for share;
  if autor is null then raise exception 'FUERA_DE_FAMILIA'; end if;
  perform 1 from public.capturas where id=p_captura and familia_id=p_familia and autor_id=autor and estado='pendiente' for update;
  if not found then raise exception 'CAPTURA_NO_EDITABLE'; end if;
  if p_descartar is null or p_revision is null or (not p_descartar and (p_titulo is null or btrim(p_titulo)='')) then raise exception 'CAPTURA_INVALIDA'; end if;
  update public.tareas set titulo=case when p_descartar then titulo else p_titulo end,
    estado=case when p_descartar then 'descartada' else estado end, revision=revision+1
    where familia_id=p_familia and id=p_tarea and captura_id=p_captura and revision=p_revision
      and estado='pendiente' and por_revisar returning * into resultado;
  if not found then raise exception 'CONFLICTO_REVISION'; end if;
  return jsonb_build_object('id',resultado.id,'familia_id',resultado.familia_id,'captura_id',resultado.captura_id,'titulo',resultado.titulo,'revision',resultado.revision,'estado',resultado.estado);
end;
$$;
revoke all on function public.editar_resultado_captura(uuid,uuid,uuid,uuid,bigint,text,boolean) from public,anon,authenticated;
grant execute on function public.editar_resultado_captura(uuid,uuid,uuid,uuid,bigint,text,boolean) to service_role;
-- Vuelta atrás: revertir código, conservar capturas y tareas. No borrar originales.
