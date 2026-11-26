-- Tarea 2.1. 0003 del prompt ya corresponde a sesiones; se usa 0005.
-- Aditiva. El aplicador de Supabase es transaccional. No modifica registros previos.
create table public.responsabilidades (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  persona_a_cargo_id uuid not null,
  ambito_id uuid not null,
  titulo text not null check (btrim(titulo) <> ''),
  titular_id uuid,
  recurrencia jsonb check (recurrencia is null or jsonb_typeof(recurrencia) = 'object'),
  minutos_estimados integer check (minutos_estimados is null or minutos_estimados >= 0),
  estado text not null default 'activa' check (estado in ('activa','pausada','archivada')),
  ficha_de_pago_id uuid, -- FK se agrega cuando exista fichas_de_pago.
  plantilla text,
  seguimiento_meses integer check (seguimiento_meses is null or seguimiento_meses > 0),
  telefono text,
  enlace text,
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now(),
  unique (familia_id,id),
  foreign key (familia_id,persona_a_cargo_id) references public.personas_a_cargo(familia_id,id),
  foreign key (familia_id,ambito_id) references public.ambitos(familia_id,id),
  foreign key (familia_id,titular_id) references public.integrantes(familia_id,id)
);

create table public.capturas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  autor_id uuid not null,
  texto_original text not null check (btrim(texto_original) <> ''),
  origen text not null check (origen in ('texto','voz')),
  estado text not null default 'pendiente' check (estado in ('pendiente','interpretada','fallida')),
  creado_en timestamptz not null default now(),
  revision bigint not null default 0 check (revision >= 0),
  unique (familia_id,id),
  foreign key (familia_id,autor_id) references public.integrantes(familia_id,id)
);

create table public.tareas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  responsabilidad_id uuid,
  persona_a_cargo_id uuid,
  ambito_id uuid,
  titulo text not null check (btrim(titulo) <> ''),
  plazo_fecha date,
  plazo_hora time without time zone,
  ejecutor_id uuid,
  estado text not null default 'pendiente' check (estado in ('pendiente','hecha','pospuesta','descartada')),
  por_revisar boolean not null default true,
  minutos_estimados integer check (minutos_estimados is null or minutos_estimados >= 0),
  cerrada_por uuid,
  cerrada_en timestamptz,
  captura_id uuid,
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now(),
  unique (familia_id,id),
  foreign key (familia_id,responsabilidad_id) references public.responsabilidades(familia_id,id),
  foreign key (familia_id,persona_a_cargo_id) references public.personas_a_cargo(familia_id,id),
  foreign key (familia_id,ambito_id) references public.ambitos(familia_id,id),
  foreign key (familia_id,ejecutor_id) references public.integrantes(familia_id,id),
  foreign key (familia_id,cerrada_por) references public.integrantes(familia_id,id),
  foreign key (familia_id,captura_id) references public.capturas(familia_id,id),
  check (plazo_hora is null or plazo_fecha is not null)
);

create table public.trabajos_ia (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  captura_id uuid not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','reservado','aplicado','fallido')),
  intentos integer not null default 0 check (intentos >= 0),
  reservado_hasta timestamptz,
  aplicado_en timestamptz,
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now(),
  unique (familia_id,id),
  unique (familia_id,captura_id),
  foreign key (familia_id,captura_id) references public.capturas(familia_id,id),
  check ((estado = 'aplicado') = (aplicado_en is not null))
);

create index responsabilidades_familia_estado_idx on public.responsabilidades(familia_id,estado);
create index tareas_familia_estado_plazo_idx on public.tareas(familia_id,estado,plazo_fecha);
create index tareas_familia_captura_idx on public.tareas(familia_id,captura_id);
create index capturas_familia_autor_idx on public.capturas(familia_id,autor_id);
create index trabajos_ia_cola_idx on public.trabajos_ia(estado,reservado_hasta,creado_en);

alter table public.responsabilidades enable row level security;
alter table public.tareas enable row level security;
alter table public.capturas enable row level security;
alter table public.trabajos_ia enable row level security;
revoke all on public.responsabilidades, public.tareas, public.capturas, public.trabajos_ia from public, anon, authenticated;
grant select, insert, update, delete on public.responsabilidades, public.tareas, public.capturas, public.trabajos_ia to service_role;

-- Guardado original antes de interpretación. Atomicidad e idempotencia de reenvíos.
-- La cuenta es derivada de una sesión por el servidor; se comprueba pertenencia activa
-- dentro de la transacción y no se confía en un autor enviado por el navegador.
create function public.guardar_captura(p_familia uuid,p_cuenta uuid,p_captura uuid,p_texto text,p_origen text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  autor uuid;
  captura public.capturas%rowtype;
  tarea uuid;
begin
  select id into autor from public.integrantes
    where familia_id=p_familia and cuenta_id=p_cuenta and estado='activo' for share;
  if autor is null then raise exception 'FUERA_DE_FAMILIA'; end if;
  if p_captura is null or p_texto is null or btrim(p_texto)='' or p_origen is null or p_origen not in ('texto','voz') then
    raise exception 'CAPTURA_INVALIDA';
  end if;
  insert into public.capturas(id,familia_id,autor_id,texto_original,origen)
    values (p_captura,p_familia,autor,p_texto,p_origen) on conflict (id) do nothing
    returning * into captura;
  if found then
    insert into public.tareas(familia_id,titulo,por_revisar,captura_id)
      values(p_familia,p_texto,true,p_captura) returning id into tarea;
  else
    select * into captura from public.capturas where id=p_captura and familia_id=p_familia and autor_id=autor;
    if not found or captura.texto_original is distinct from p_texto or captura.origen is distinct from p_origen then
      raise exception 'CAPTURA_CONFLICTO';
    end if;
    select id into tarea from public.tareas where familia_id=p_familia and captura_id=p_captura
      order by creado_en,id limit 1;
  end if;
  return jsonb_build_object('captura_id',p_captura,'tarea_id',tarea);
end;
$$;
revoke all on function public.guardar_captura(uuid,uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.guardar_captura(uuid,uuid,uuid,text,text) to service_role;

-- Vuelta atrás: antes de confirmar, rollback de la transacción.
-- Después de aplicar: revertir código y conservar las tablas/RLS/datos; no borrar capturas.
-- Cualquier reparación del esquema se realiza mediante otra migración aditiva.
