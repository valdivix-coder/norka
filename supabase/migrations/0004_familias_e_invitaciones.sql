-- ESTADO: aplicada con apply_migration el 25 de noviembre de 2026 (20261125113029). CONFLICTO PENDIENTE: existe otra migración de 1.7 en Supabase (20261125030539, funciones norka_*) sin archivo en el repositorio; Simón debe decidir cuál se conserva.
-- Tarea 1.7. Solo agrega funciones; no cambia tablas ni datos. Sin begin/commit.
-- Todas las funciones usan los permisos de quien las ejecuta y solo las puede llamar el servidor.

-- Reparto inicial en partes iguales entre corresponsables (sección 7). Suma siempre 100.
create function public.repartir_cuotas(p_familia uuid) returns void
language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  select count(*) into n from public.integrantes
    where familia_id = p_familia and estado = 'activo' and participacion = 'corresponsable';
  if n = 0 then return; end if;
  update public.integrantes i
    set cuota_objetivo = (100 / n) + case when r.pos <= (100 % n) then 1 else 0 end,
        revision = i.revision + 1
    from (select id, row_number() over (order by creado_en, id) as pos
            from public.integrantes
           where familia_id = p_familia and estado = 'activo' and participacion = 'corresponsable') r
    where i.id = r.id;
end;
$$;

-- Primer color de persona libre en la familia; si se acaban, vuelve a empezar.
create function public.color_integrante(p_familia uuid) returns text
language plpgsql security invoker set search_path = '' as $$
declare k integer; total integer;
begin
  for k in 1..8 loop
    if not exists (select 1 from public.integrantes
                    where familia_id = p_familia and color = 'persona-' || k) then
      return 'persona-' || k;
    end if;
  end loop;
  select count(*) into total from public.integrantes where familia_id = p_familia;
  return 'persona-' || ((total % 8) + 1);
end;
$$;

-- Crea la familia (el disparador de 0002 agrega «El hogar» y los 8 ámbitos) y a su
-- administrador, todo en una sola transacción.
create function public.crear_familia(
  p_cuenta uuid, p_nombre text, p_rol text, p_etiqueta text, p_participacion text,
  p_cumple_dia smallint, p_cumple_mes smallint, p_telefono text
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare f uuid; i uuid;
begin
  insert into public.familias(nombre) values (btrim(p_nombre)) returning id into f;
  insert into public.integrantes(familia_id, cuenta_id, rol_familiar, rol_etiqueta, permiso,
      participacion, cuota_objetivo, color, icono, cumple_dia, cumple_mes, telefono)
    values (f, p_cuenta, p_rol, nullif(btrim(p_etiqueta), ''), 'administrador', p_participacion,
      case when p_participacion = 'corresponsable' then 100 end,
      public.color_integrante(f), 'inicial', p_cumple_dia, p_cumple_mes, p_telefono)
    returning id into i;
  return jsonb_build_object('familia_id', f, 'integrante_id', i);
end;
$$;

-- Acepta una invitación de un solo uso. La fila se bloquea para que dos personas no puedan
-- usar el mismo enlace a la vez. La hora llega como parámetro para poder probarla.
create function public.aceptar_invitacion(
  p_hash text, p_cuenta uuid, p_ahora timestamptz,
  p_cumple_dia smallint, p_cumple_mes smallint, p_telefono text
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare inv public.invitaciones%rowtype; i uuid;
begin
  select * into inv from public.invitaciones where hash_codigo = p_hash for update;
  if not found then raise exception 'INVITACION_NO_EXISTE'; end if;
  if inv.usada_en is not null then raise exception 'INVITACION_USADA'; end if;
  if inv.caduca_en <= p_ahora then raise exception 'INVITACION_CADUCADA'; end if;
  if exists (select 1 from public.integrantes
              where familia_id = inv.familia_id and cuenta_id = p_cuenta) then
    raise exception 'YA_ES_INTEGRANTE';
  end if;
  insert into public.integrantes(familia_id, cuenta_id, rol_familiar, permiso, participacion,
      cuota_objetivo, color, icono, cumple_dia, cumple_mes, telefono)
    values (inv.familia_id, p_cuenta, inv.rol_familiar, 'integrante', inv.participacion,
      case when inv.participacion = 'corresponsable' then 0 end,
      public.color_integrante(inv.familia_id), 'inicial', p_cumple_dia, p_cumple_mes, p_telefono)
    returning id into i;
  update public.invitaciones set usada_en = greatest(p_ahora, inv.creado_en) where id = inv.id;
  perform public.repartir_cuotas(inv.familia_id);
  return jsonb_build_object('familia_id', inv.familia_id, 'integrante_id', i);
end;
$$;

revoke all on function public.repartir_cuotas(uuid), public.color_integrante(uuid),
  public.crear_familia(uuid, text, text, text, text, smallint, smallint, text),
  public.aceptar_invitacion(text, uuid, timestamptz, smallint, smallint, text)
  from public, anon, authenticated;
grant execute on function public.repartir_cuotas(uuid), public.color_integrante(uuid),
  public.crear_familia(uuid, text, text, text, text, smallint, smallint, text),
  public.aceptar_invitacion(text, uuid, timestamptz, smallint, smallint, text)
  to service_role;

-- VUELTA ATRÁS
-- Solo agrega funciones. Para volver al código anterior basta no llamarlas: no hay datos
-- que convertir. Si hiciera falta retirarlas (sin familias reales que dependan de ellas):
--   drop function public.aceptar_invitacion(text, uuid, timestamptz, smallint, smallint, text);
--   drop function public.crear_familia(uuid, text, text, text, text, smallint, smallint, text);
--   drop function public.color_integrante(uuid);
--   drop function public.repartir_cuotas(uuid);
