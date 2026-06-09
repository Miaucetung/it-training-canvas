-- Run this in the Supabase SQL editor (project: shkvdpbclqjnvlcnjufg)

-- ── 1. User progress (Lernpfad-Fortschritt) ──────────────────
create table if not exists public.user_progress (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  path_id     text        not null,
  data        jsonb       not null,
  updated_at  timestamptz default now() not null,
  unique (user_id, path_id)
);

alter table public.user_progress enable row level security;

create policy "user_progress_own"
  on public.user_progress for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 2. Exam weak questions (Schwächen-Drill) ─────────────────
create table if not exists public.exam_weak_questions (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  question_ids text[]      default '{}' not null,
  updated_at   timestamptz default now() not null,
  unique (user_id)
);

alter table public.exam_weak_questions enable row level security;

create policy "exam_weak_own"
  on public.exam_weak_questions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. updated_at trigger (optional, for server-side ordering) ─
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_progress_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

create trigger exam_weak_updated_at
  before update on public.exam_weak_questions
  for each row execute function public.set_updated_at();
