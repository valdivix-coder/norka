-- 2.4/2.6: infraestructura de interpretación; no llama a IA.
-- Dependencias de 5.2: propuestas (solo alta; respuesta en 4.1) y actividad.
-- No se cambia ni se reinterpreta ninguna captura existente.
create table public.propuestas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  de_id uuid not null, para_id uuid not null,
  tipo text not null check(tipo in ('nueva_responsabilidad','cambio_titular','tarea')),
  responsabilidad_id uuid, tarea_id uuid,
  estado text not null default 'enviada' check(estado in ('enviada','aceptada','ajustada','declinada')),
  mensaje text, respondida_en timestamptz,
  revision bigint not null default 0 check(revision>=0),
  creado_en timestamptz not null default now(),
  unique(familia_id,id),
  foreign key(familia_id,de_id) references public.integrantes(familia_id,id),
  foreign key(familia_id,para_id) references public.integrantes(familia_id,id),
  foreign key(familia_id,responsabilidad_id) references public.responsabilidades(familia_id,id),
  foreign key(familia_id,tarea_id) references public.tareas(familia_id,id),
  check(de_id<>para_id),
  check((tipo='tarea' and tarea_id is not null and responsabilidad_id is null)
     or (tipo<>'tarea' and responsabilidad_id is not null and tarea_id is null)),
  check((estado='enviada')=(respondida_en is null))
);
create index propuestas_destino_idx on public.propuestas(familia_id,para_id,estado);
create table public.actividad (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  actor_id uuid not null, tipo text not null check(btrim(tipo)<>''),
  objeto_tipo text not null, objeto_id uuid not null,
  persona_a_cargo_id uuid, ambito_id uuid,
  en_actividad boolean not null default false,
  creado_en timestamptz not null default now(),
  unique(familia_id,id),
  foreign key(familia_id,actor_id) references public.integrantes(familia_id,id),
  foreign key(familia_id,persona_a_cargo_id) references public.personas_a_cargo(familia_id,id),
  foreign key(familia_id,ambito_id) references public.ambitos(familia_id,id)
);
create index actividad_familia_idx on public.actividad(familia_id,creado_en desc);
alter table public.propuestas enable row level security;
alter table public.actividad enable row level security;
revoke all on public.propuestas,public.actividad from public,anon,authenticated;
grant select,insert,update,delete on public.propuestas,public.actividad to service_role;

-- Metadatos técnicos para vincular una responsabilidad con el original y su revisión.
alter table public.responsabilidades add column captura_id uuid,
  add column por_revisar boolean not null default false,
  add foreign key(familia_id,captura_id) references public.capturas(familia_id,id);
-- Consentimiento por integrante, nulo mientras no haya decisión expresa.
alter table public.integrantes add column consentimiento_ia boolean,
  add column consentimiento_ia_en timestamptz,
  add check((consentimiento_ia is null)=(consentimiento_ia_en is null));

-- Registro interno sin texto, sin presencia, sin exposición en Actividad.
create function public.registrar_captura_interna() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  insert into public.actividad(familia_id,actor_id,tipo,objeto_tipo,objeto_id,en_actividad)
    values(new.familia_id,new.autor_id,'captura_guardada','captura',new.id,false);
  return new;
end $$;
create trigger captura_registro_interno after insert on public.capturas
  for each row execute function public.registrar_captura_interna();

-- Guardar consentimiento no habilita el proveedor ni encola capturas antiguas.
create function public.decidir_consentimiento_ia(p_familia uuid,p_cuenta uuid,p_acepta boolean)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_acepta is null then raise exception 'DECISION_INVALIDA'; end if;
  update public.integrantes set consentimiento_ia=p_acepta,consentimiento_ia_en=now(),revision=revision+1
    where familia_id=p_familia and cuenta_id=p_cuenta and estado='activo';
  if not found then raise exception 'FUERA_DE_FAMILIA'; end if;
end $$;

-- Una reserva por captura. Máximo dos intentos, revisión como token de reserva.
-- Se llama solo tras decisión expresa Y autorización del proveedor desde el servidor.
-- No existe conexión a Gemini en SQL ni acceso desde el cliente.
create function public.reservar_interpretacion(p_familia uuid,p_cuenta uuid,p_captura uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare autor uuid; j public.trabajos_ia%rowtype;
begin
  select id into autor from public.integrantes where familia_id=p_familia
    and cuenta_id=p_cuenta and estado='activo' and consentimiento_ia is true for share;
  if autor is null then raise exception 'SIN_CONSENTIMIENTO_O_ACCESO'; end if;
  perform 1 from public.capturas where familia_id=p_familia and id=p_captura
    and autor_id=autor and estado='pendiente' for update;
  if not found then raise exception 'CAPTURA_NO_DISPONIBLE'; end if;
  -- Una edición/deshacer manual prevalece sobre el modelo.
  if not exists(select 1 from public.tareas t join public.capturas c
    on c.familia_id=t.familia_id and c.id=t.captura_id
    where t.familia_id=p_familia and t.captura_id=p_captura
      and t.estado='pendiente' and t.revision=0 and t.titulo=c.texto_original) then
    raise exception 'CAPTURA_MODIFICADA';
  end if;
  insert into public.trabajos_ia(familia_id,captura_id) values(p_familia,p_captura)
    on conflict(familia_id,captura_id) do nothing;
  update public.trabajos_ia set estado='reservado',intentos=intentos+1,
    reservado_hasta=now()+interval '60 seconds',revision=revision+1
    where familia_id=p_familia and captura_id=p_captura and aplicado_en is null
      and intentos<2 and (estado='pendiente' or (estado='reservado' and reservado_hasta<=now()))
    returning * into j;
  if not found then return null; end if;
  return jsonb_build_object('id',j.id,'revision',j.revision,'intentos',j.intentos);
end $$;

-- Recibe exclusivamente un plan ya validado por Zod y transformado en IDs en el servidor.
-- La comprobación relacional y el reemplazo de la tarea original son atómicos.
create function public.aplicar_interpretacion(p_familia uuid,p_cuenta uuid,p_captura uuid,p_revision bigint,p_plan jsonb,p_fallida boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare autor uuid; c public.capturas%rowtype; j public.trabajos_ia%rowtype;
  original public.tareas%rowtype; e jsonb; persona uuid; ambito uuid; destinatario uuid;
  t uuid; resp uuid; prop uuid; clase text; titulo text; revisar boolean; rec jsonb;
  objetos jsonb:='[]'::jsonb;
begin
  select id into autor from public.integrantes where familia_id=p_familia and cuenta_id=p_cuenta
    and estado='activo' and consentimiento_ia is true for share;
  if autor is null then raise exception 'SIN_CONSENTIMIENTO_O_ACCESO'; end if;
  select * into c from public.capturas where familia_id=p_familia and id=p_captura and autor_id=autor for update;
  if not found then raise exception 'CAPTURA_NO_DISPONIBLE'; end if;
  select * into j from public.trabajos_ia where familia_id=p_familia and captura_id=p_captura for update;
  if not found then raise exception 'SIN_RESERVA'; end if;
  if j.aplicado_en is not null then return jsonb_build_object('estado','ya_aplicada'); end if;
  if j.estado<>'reservado' or j.revision<>p_revision or j.reservado_hasta<=now()
    or c.estado<>'pendiente' then raise exception 'RESERVA_INVALIDA'; end if;
  select * into original from public.tareas where familia_id=p_familia and captura_id=p_captura
    and estado='pendiente' and revision=0 and titulo=c.texto_original for update;
  if not found then raise exception 'CAPTURA_MODIFICADA'; end if;
  if p_fallida is null then raise exception 'PLAN_INVALIDO'; end if;
  if p_fallida then
    update public.capturas set estado='fallida',revision=revision+1 where id=c.id;
    update public.trabajos_ia set estado='fallido',reservado_hasta=null,revision=revision+1 where id=j.id;
    return jsonb_build_object('estado','sin_clasificar','tarea_id',original.id);
  end if;
  if jsonb_typeof(p_plan) is distinct from 'array' or jsonb_array_length(p_plan) not between 1 and 50
    then raise exception 'PLAN_INVALIDO'; end if;
  for e in select value from jsonb_array_elements(p_plan) loop
    clase:=e->>'tipo'; titulo:=e->>'titulo';
    persona:=(e->>'persona_a_cargo_id')::uuid; ambito:=(e->>'ambito_id')::uuid;
    destinatario:=(e->>'dirigida_a_id')::uuid;
    revisar:=(e->>'por_revisar')::boolean;
    rec:=nullif(e->'recurrencia','null'::jsonb);
    if clase is null or clase not in ('tarea','responsabilidad','propuesta') or titulo is null or btrim(titulo)=''
      or revisar is null or e->>'ejecutor_id' is not null
      or (clase='propuesta') is distinct from (destinatario is not null)
      or destinatario=autor then raise exception 'PLAN_INVALIDO'; end if;
    if persona is not null then
      perform 1 from public.personas_a_cargo where familia_id=p_familia and id=persona and archivada_en is null for share;
      if not found then raise exception 'PERSONA_INVALIDA'; end if;
    end if;
    if ambito is not null then
      perform 1 from public.ambitos where familia_id=p_familia and id=ambito for share;
      if not found then raise exception 'AMBITO_INVALIDO'; end if;
    end if;
    if destinatario is not null then
      perform 1 from public.integrantes where familia_id=p_familia and id=destinatario and estado='activo' for share;
      if not found then raise exception 'DESTINATARIO_INVALIDO'; end if;
    end if;
    revisar:=revisar or persona is null or ambito is null;
    t:=null;resp:=null;prop:=null;
    if clase='responsabilidad' or (clase='propuesta' and rec is not null and persona is not null and ambito is not null) then
      if persona is null or ambito is null or rec is null then raise exception 'RESPONSABILIDAD_INVALIDA'; end if;
      insert into public.responsabilidades(familia_id,persona_a_cargo_id,ambito_id,titulo,recurrencia,estado,captura_id,por_revisar)
        values(p_familia,persona,ambito,titulo,rec,case when clase='propuesta' then 'pausada' else 'activa' end,c.id,revisar)
        returning id into resp;
    else
      insert into public.tareas(familia_id,persona_a_cargo_id,ambito_id,titulo,plazo_fecha,plazo_hora,por_revisar,captura_id)
        values(p_familia,persona,ambito,titulo,(e->>'plazo_fecha')::date,(e->>'plazo_hora')::time,revisar,c.id)
        returning id into t;
    end if;
    if clase='propuesta' then
      insert into public.propuestas(familia_id,de_id,para_id,tipo,responsabilidad_id,tarea_id)
        values(p_familia,autor,destinatario,case when resp is null then 'tarea' else 'nueva_responsabilidad' end,resp,t)
        returning id into prop;
    end if;
    objetos:=objetos||jsonb_build_array(jsonb_build_object('tarea_id',t,'responsabilidad_id',resp,'propuesta_id',prop));
    insert into public.actividad(familia_id,actor_id,tipo,objeto_tipo,objeto_id,persona_a_cargo_id,ambito_id,en_actividad)
      values(p_familia,autor,case when prop is not null then 'propuesta_enviada' when resp is not null then 'responsabilidad_agregada' else 'tarea_agregada' end,
      case when prop is not null then 'propuesta' when resp is not null then 'responsabilidad' else 'tarea' end,
      coalesce(prop,resp,t),persona,ambito,false);
  end loop;
  update public.tareas set estado='descartada',revision=revision+1 where id=original.id;
  update public.capturas set estado='interpretada',revision=revision+1 where id=c.id;
  update public.trabajos_ia set estado='aplicado',aplicado_en=now(),reservado_hasta=null,revision=revision+1 where id=j.id;
  return jsonb_build_object('estado','aplicada','objetos',objetos);
end $$;

revoke all on function public.registrar_captura_interna(),public.decidir_consentimiento_ia(uuid,uuid,boolean),
 public.reservar_interpretacion(uuid,uuid,uuid),public.aplicar_interpretacion(uuid,uuid,uuid,bigint,jsonb,boolean)
 from public,anon,authenticated;
grant execute on function public.registrar_captura_interna(),public.decidir_consentimiento_ia(uuid,uuid,boolean),
 public.reservar_interpretacion(uuid,uuid,uuid),public.aplicar_interpretacion(uuid,uuid,uuid,bigint,jsonb,boolean)
 to service_role;

-- Vuelta atrás: desactivar el llamador del servidor; conservar capturas, filas y seguridad.
-- No eliminar tablas ni datos de familias. Sin activación ni aplicación en producción.
