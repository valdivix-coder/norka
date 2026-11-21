-- Fase 1, tarea 1.4. Ejecutar como propietario desde el editor SQL de Supabase.
-- Ejecutar primero supabase/verificaciones/0001_antes.sql.
-- La transacción completa se revierte si falla cualquier instrucción.
begin;

create table public.cuentas (
  id uuid primary key default gen_random_uuid(),
  correo text not null check (btrim(correo) <> ''),
  nombre text not null check (btrim(nombre) <> ''),
  foto_url text,
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now()
);
create unique index cuentas_correo_unico on public.cuentas (lower(btrim(correo)));

create table public.identidades (
  id uuid primary key default gen_random_uuid(),
  cuenta_id uuid not null references public.cuentas(id),
  proveedor text not null check (proveedor in ('google', 'apple', 'facebook')),
  sub text not null check (btrim(sub) <> ''),
  correo text,
  creado_en timestamptz not null default now(),
  unique (proveedor, sub)
);
create index identidades_cuenta_idx on public.identidades (cuenta_id);

create table public.familias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (btrim(nombre) <> ''),
  zona_horaria text not null default 'America/Santiago',
  moneda text not null default 'CLP' check (moneda = 'CLP'),
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now()
);

create table public.integrantes (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  cuenta_id uuid not null references public.cuentas(id),
  rol_familiar text not null check (
    rol_familiar in ('madre', 'padre', 'cuidador', 'abuelo', 'tio', 'otro')
  ),
  rol_etiqueta text check (char_length(rol_etiqueta) between 1 and 20),
  permiso text not null check (permiso in ('administrador', 'integrante')),
  participacion text not null check (participacion in ('corresponsable', 'apoyo')),
  cuota_objetivo smallint check (cuota_objetivo between 0 and 100),
  color text not null,
  icono text not null,
  cumple_dia smallint,
  cumple_mes smallint,
  telefono text check (telefono ~ '^\+[1-9][0-9]{1,14}$'),
  en_pausa_desde date,
  en_pausa_hasta date,
  estado text not null default 'activo' check (estado in ('activo', 'retirado')),
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now(),
  unique (familia_id, cuenta_id),
  unique (familia_id, id),
  constraint integrante_cuota check (
    (participacion = 'apoyo' and cuota_objetivo is null)
    or (participacion = 'corresponsable' and cuota_objetivo is not null)
  ),
  constraint integrante_cumple check (
    (cumple_dia is null and cumple_mes is null)
    or (cumple_dia is not null and cumple_mes is not null
      and cumple_mes between 1 and 12
      and cumple_dia between 1 and case
        when cumple_mes = 2 then 29
        when cumple_mes in (4, 6, 9, 11) then 30
        else 31 end)
  ),
  constraint integrante_pausa check (
    (en_pausa_desde is null and en_pausa_hasta is null)
    or (en_pausa_desde is not null and en_pausa_hasta is not null
      and en_pausa_hasta >= en_pausa_desde)
  )
);
create index integrantes_cuenta_idx on public.integrantes (cuenta_id);
-- casa_id se agrega con su clave foránea cuando exista casas, en la tarea 5.9.

create table public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  creada_por uuid not null,
  rol_familiar text not null check (
    rol_familiar in ('madre', 'padre', 'cuidador', 'abuelo', 'tio', 'otro')
  ),
  participacion text not null check (participacion in ('corresponsable', 'apoyo')),
  hash_codigo text not null unique check (btrim(hash_codigo) <> ''),
  caduca_en timestamptz not null default (now() + interval '7 days'),
  usada_en timestamptz,
  creado_en timestamptz not null default now(),
  foreign key (familia_id, creada_por) references public.integrantes(familia_id, id),
  check (caduca_en > creado_en),
  check (usada_en is null or (usada_en >= creado_en and usada_en <= caduca_en))
);
create index invitaciones_creadora_idx on public.invitaciones (familia_id, creada_por);

create table public.preferencias (
  integrante_id uuid primary key references public.integrantes(id),
  canal_tomas text not null default 'telefono',
  canal_propuestas_respuestas text not null default 'telefono',
  canal_recordatorios text not null default 'telefono',
  canal_reacciones_comentarios text not null default 'telefono',
  canal_sugerencias text not null default 'telefono',
  canal_cambio_casa text not null default 'telefono',
  canal_tu_dia text not null default 'telefono',
  canal_resumen_familia text not null default 'telefono',
  canal_tu_semana text not null default 'telefono',
  canal_acciones_integrantes text not null default 'apagado',
  canal_celebraciones_logros text not null default 'solo_app',
  hora_tu_dia time not null default '07:45',
  hora_resumen time not null default '20:30',
  silencio_desde time not null default '21:00',
  silencio_hasta time not null default '07:30',
  sonidos boolean not null default true,
  logros_activos boolean not null default true,
  compartir_logros boolean,
  mostrar_mis_acciones boolean not null default true,
  tema text not null default 'oscuro' check (tema in ('oscuro', 'claro')),
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now(),
  constraint preferencias_canales check (
    array[canal_tomas, canal_propuestas_respuestas, canal_recordatorios,
      canal_reacciones_comentarios, canal_sugerencias, canal_cambio_casa,
      canal_tu_dia, canal_resumen_familia, canal_tu_semana,
      canal_acciones_integrantes, canal_celebraciones_logros]
    <@ array['telefono', 'solo_app', 'apagado']::text[]
  )
);

alter table public.cuentas enable row level security;
alter table public.identidades enable row level security;
alter table public.familias enable row level security;
alter table public.integrantes enable row level security;
alter table public.invitaciones enable row level security;
alter table public.preferencias enable row level security;

revoke all on table public.cuentas, public.identidades, public.familias,
  public.integrantes, public.invitaciones, public.preferencias
  from public, anon, authenticated;
grant select, insert, update, delete on table
  public.cuentas, public.identidades, public.familias,
  public.integrantes, public.invitaciones, public.preferencias to service_role;

commit;

-- VUELTA ATRÁS
-- Si ocurre un error antes del COMMIT, ejecutar ROLLBACK en la misma sesión.
-- Después de confirmar: detener el uso de la versión nueva y volver al código
-- anterior. Conservar las tablas y sus datos, RLS y permisos. Esta versión
-- solo agrega objetos: no necesita borrar datos para volver al código anterior.
-- Las correcciones de esquema se entregan como una nueva migración aditiva.
-- Nunca usar DROP TABLE ni CASCADE como vuelta atrás en una familia con datos.
