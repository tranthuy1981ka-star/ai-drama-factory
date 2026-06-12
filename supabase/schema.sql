-- AI Factory / AI_Guoman_MASTER Supabase Database Sync v0.1
-- v0.1 stores one full production_db.json snapshot per project_id.
-- Do not put service_role keys in the Vite client.

create extension if not exists pgcrypto;

create table if not exists public.production_state (
  id uuid primary key default gen_random_uuid(),
  project_id text not null default 'AI_Guoman_MASTER',
  state jsonb not null,
  updated_at timestamptz default now(),
  updated_by text,
  note text,
  constraint production_state_project_id_unique unique (project_id)
);

create or replace function public.set_production_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_production_state_updated_at on public.production_state;

create trigger trg_production_state_updated_at
before update on public.production_state
for each row
execute function public.set_production_state_updated_at();

alter table public.production_state enable row level security;

-- RLS plan:
-- 1. Before auth is enabled, do not expose anonymous write access in production.
-- 2. Production should use Supabase Auth + RLS.
-- 3. anon key is only safe when RLS policies restrict access.
-- 4. service_role key must never be used in Vite client code.
-- 5. v0.1 policies below allow authenticated users to read/write snapshots.
-- 6. If you want anonymous local testing, create a temporary policy manually,
--    then remove it before production.

drop policy if exists "Authenticated users can read production_state" on public.production_state;
create policy "Authenticated users can read production_state"
on public.production_state
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert production_state" on public.production_state;
create policy "Authenticated users can insert production_state"
on public.production_state
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update production_state" on public.production_state;
create policy "Authenticated users can update production_state"
on public.production_state
for update
to authenticated
using (true)
with check (true);
