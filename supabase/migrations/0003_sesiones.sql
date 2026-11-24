-- ESTADO: aplicada con apply_migration el 24 de noviembre de 2026 (20261124212830).
-- Tarea 1.5. Sesión propia: en la base solo se guarda el hash del token (9.2.6 y 12).
-- Sin begin/commit: el aplicador de Supabase ya es transaccional.
create table public.sesiones (
  id uuid primary key default gen_random_uuid(),
  cuenta_id uuid not null references public.cuentas(id),
  hash_token text not null unique check (hash_token ~ '^[0-9a-f]{64}$'),
  creada_en timestamptz not null default now(),
  caduca_en timestamptz not null,
  revocada_en timestamptz,
  check (caduca_en > creada_en)
);
create index sesiones_cuenta_idx on public.sesiones (cuenta_id);

alter table public.sesiones enable row level security;
revoke all on table public.sesiones from public, anon, authenticated;
grant select, insert, update, delete on table public.sesiones to service_role;

-- VUELTA ATRÁS
-- Antes de aplicar: nada que deshacer.
-- Después: cerrar la sesión de todas las personas es aceptable en esta etapa, pero
-- siguiendo la regla de no borrar, se conserva la tabla y se vuelve al código anterior.
-- Si fuese imprescindible quitarla (solo sin datos reales): drop table public.sesiones;
