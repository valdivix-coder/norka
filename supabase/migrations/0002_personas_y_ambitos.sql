-- ESTADO: Aplicada con apply_migration el 21 de noviembre de 2026 (20261121131915).
-- Sin begin/commit: el aplicador de Supabase ya es transaccional. El SQL coincide con el guardado en el historial.
-- Tarea 1.8. Aplicar por Simón después de 0002_antes.sql.

create table public.personas_a_cargo (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  tipo text not null check (tipo in ('hija_hijo','mascota','adulto_dependiente','hogar')),
  nombre text not null check (btrim(nombre) <> ''),
  cumple_dia smallint,
  cumple_mes smallint,
  anio_nacimiento smallint,
  va_al_colegio boolean not null default false,
  color text not null,
  icono text not null,
  archivada_en timestamptz,
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now(),
  unique (familia_id, id),
  check ((cumple_dia is null and cumple_mes is null) or (
    cumple_dia is not null and cumple_mes is not null and cumple_mes between 1 and 12
    and cumple_dia between 1 and case
      when cumple_mes = 2 then 29 when cumple_mes in (4,6,9,11) then 30 else 31 end
  )),
  check (tipo <> 'hogar' or archivada_en is null)
);
create unique index personas_un_hogar_por_familia
  on public.personas_a_cargo(familia_id) where tipo = 'hogar';

create table public.ambitos (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id),
  nombre text not null check (btrim(nombre) <> ''),
  color text not null,
  icono text not null,
  orden integer not null,
  exige_plazo boolean not null,
  revision bigint not null default 0 check (revision >= 0),
  creado_en timestamptz not null default now(),
  unique (familia_id, id)
);
create index ambitos_familia_orden_idx on public.ambitos(familia_id, orden);

alter table public.personas_a_cargo enable row level security;
alter table public.ambitos enable row level security;
revoke all on public.personas_a_cargo, public.ambitos from public, anon, authenticated;
grant select, insert, update, delete on public.personas_a_cargo, public.ambitos to service_role;

-- Impide convertir el hogar en otra clase de persona para borrarlo después.
create function public.proteger_hogar() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if old.tipo = 'hogar' then
    if tg_op = 'DELETE' then
      raise exception 'HOGAR_NO_BORRABLE';
    end if;
    if new.tipo <> 'hogar' or new.familia_id <> old.familia_id or new.archivada_en is not null then
      raise exception 'HOGAR_NO_ARCHIVABLE';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.proteger_hogar() from public, anon, authenticated;
grant execute on function public.proteger_hogar() to service_role;
create trigger personas_proteger_hogar before update or delete on public.personas_a_cargo
  for each row execute function public.proteger_hogar();

-- El hogar y los ocho ámbitos nacen en la misma transacción que la familia.
create function public.inicializar_familia() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.personas_a_cargo(familia_id,tipo,nombre,color,icono)
    values (new.id,'hogar','El hogar','ambito-hogar','puerta');
  insert into public.ambitos(familia_id,nombre,color,icono,orden,exige_plazo)
    select new.id, nombre, color, icono, orden, exige_plazo
    from (values
      ('Salud','ambito-salud','cruz',1,true),
      ('Colegio','ambito-colegio','birrete',2,true),
      ('Pagos y finanzas','ambito-pagos','tarjeta',3,true),
      ('Crianza diaria','ambito-crianza','corazon',4,false),
      ('Hogar','ambito-hogar','puerta',5,false),
      ('Mascotas','ambito-mascotas','huella',6,false),
      ('Trámites','ambito-tramites','documento',7,true),
      ('Compras','ambito-compras','bolsa',8,false)
    ) as iniciales(nombre,color,icono,orden,exige_plazo);
  return new;
end;
$$;
revoke all on function public.inicializar_familia() from public, anon, authenticated;
grant execute on function public.inicializar_familia() to service_role;
create trigger familias_inicializar after insert on public.familias
  for each row execute function public.inicializar_familia();

-- Completa las familias creadas antes de esta migración.
insert into public.personas_a_cargo(familia_id,tipo,nombre,color,icono)
  select id,'hogar','El hogar','ambito-hogar','puerta' from public.familias;
insert into public.ambitos(familia_id,nombre,color,icono,orden,exige_plazo)
  select f.id,a.nombre,a.color,a.icono,a.orden,a.exige_plazo
  from public.familias f cross join (values
    ('Salud','ambito-salud','cruz',1,true),
    ('Colegio','ambito-colegio','birrete',2,true),
    ('Pagos y finanzas','ambito-pagos','tarjeta',3,true),
    ('Crianza diaria','ambito-crianza','corazon',4,false),
    ('Hogar','ambito-hogar','puerta',5,false),
    ('Mascotas','ambito-mascotas','huella',6,false),
    ('Trámites','ambito-tramites','documento',7,true),
    ('Compras','ambito-compras','bolsa',8,false)
  ) as a(nombre,color,icono,orden,exige_plazo);


-- VUELTA ATRÁS
-- Antes de COMMIT: ROLLBACK en la misma sesión.
-- Después de COMMIT: volver al código anterior conservando tablas, datos y RLS.
-- Corregir el esquema mediante otra migración aditiva.
