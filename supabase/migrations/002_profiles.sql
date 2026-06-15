-- Run this in the Supabase SQL editor (project: shkvdpbclqjnvlcnjufg)
-- Profile-Tabelle für angemeldete Nutzer (Anzeigename etc.).
-- Die App läuft weiterhin ohne Login; Profile sind ein Upgrade für
-- eingeloggte Nutzer (analog zu user_progress).

-- ── 1. profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  updated_at   timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- Jeder Nutzer sieht/bearbeitet nur seine eigene Zeile.
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Tabellen-Privilegien für die authenticated-Rolle. Ohne diese GRANTs
-- schlägt jeder Zugriff mit "permission denied for table profiles" fehl
-- (die Privilegien-Prüfung läuft VOR der RLS-Policy). RLS schränkt den
-- Zugriff danach auf die eigene Zeile ein.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- updated_at automatisch pflegen (Funktion stammt aus 001_user_progress.sql)
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── 2. Auto-Insert: bei Registrierung automatisch Profil anlegen ─
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 3. Backfill: Profile für bereits bestehende Nutzer ──────────
insert into public.profiles (id, display_name)
select u.id, split_part(u.email, '@', 1)
from auth.users u
on conflict (id) do nothing;
