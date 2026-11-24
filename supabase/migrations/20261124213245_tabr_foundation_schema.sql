-- Applied to the Detail Pro project on 2026-11-24 (migration version 20261124213245).
-- ============================================================
-- tabr: guitar learning app. All objects prefixed tabr_.
-- Boundaries:
--   1. Learning content   (shared, read-only to users, written by service role)
--   2. Personal user data (owner-only read/write)
--   3. Curriculum output  (owner can read, only the server writes)
--   4. Integrations       (status readable by owner, tokens + outbox server-only)
-- ============================================================

create type public.tabr_mastery_level as enum
  ('not_started','exposure','recognition','demonstration','application','mastery');

create type public.tabr_content_status as enum ('draft','published','retired');

-- shared updated_at trigger
create or replace function public.tabr_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

-- ---------- 1. LEARNING CONTENT ----------
create table public.tabr_skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  domain text not null,                 -- e.g. technique, theory, rhythm, repertoire, ear
  summary text,
  explanation text,
  objectives jsonb not null default '[]',
  musical_applications jsonb not null default '[]',
  common_mistakes jsonb not null default '[]',
  estimated_hours numeric,
  status public.tabr_content_status not null default 'draft',
  content_version int not null default 1,
  sources jsonb not null default '[]',   -- research citations backing the content
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tabr_skill_prerequisites (
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  prerequisite_id uuid not null references public.tabr_skills(id) on delete cascade,
  required_level public.tabr_mastery_level not null default 'demonstration',
  primary key (skill_id, prerequisite_id),
  check (skill_id <> prerequisite_id)
);

create table public.tabr_exercises (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  slug text not null unique,
  title text not null,
  instructions text,
  tab text,                             -- original exercise tablature
  target_level public.tabr_mastery_level not null default 'demonstration',
  tempo_start_bpm int,
  tempo_goal_bpm int,
  duration_minutes int,
  tool text,                            -- embedded tool: fretboard, metronome, tuner, tab_player
  tool_config jsonb not null default '{}',
  status public.tabr_content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tabr_assessment_criteria (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  level public.tabr_mastery_level not null,
  method text not null,                 -- self_report, audio_check, quiz, timed_tempo
  criteria jsonb not null default '{}',
  description text,
  status public.tabr_content_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- ---------- 2. PERSONAL USER DATA ----------
create table public.tabr_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  experience_months int,
  practice_days_per_week int check (practice_days_per_week between 0 and 7),
  practice_minutes_per_session int check (practice_minutes_per_session between 0 and 600),
  preferred_genres text[] not null default '{}',
  preferred_artists text[] not null default '{}',
  learning_preferences jsonb not null default '{}',
  ambitions text,
  handedness text not null default 'right' check (handedness in ('right','left')),
  default_tuning text not null default 'standard',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tabr_equipment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,                   -- guitar, amp, pedal, interface, other
  name text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.tabr_repertoire (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  status text not null default 'learning' check (status in ('want_to_learn','learning','can_play','performance_ready')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tabr_skill_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  level public.tabr_mastery_level not null default 'not_started',
  evidence_count int not null default 0,
  last_practiced_at timestamptz,
  last_assessed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create table public.tabr_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid references public.tabr_skills(id) on delete set null,
  criteria_id uuid references public.tabr_assessment_criteria(id) on delete set null,
  method text not null,
  score numeric,
  passed boolean,
  level_awarded public.tabr_mastery_level,
  result jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.tabr_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  planned_minutes int,
  actual_minutes int,
  notes text,
  source text not null default 'app',   -- app, align_plan
  created_at timestamptz not null default now()
);

create table public.tabr_practice_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tabr_practice_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid references public.tabr_skills(id) on delete set null,
  exercise_id uuid references public.tabr_exercises(id) on delete set null,
  minutes int,
  tempo_bpm int,
  self_rating int check (self_rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- 3. CURRICULUM OUTPUT ----------
create table public.tabr_curricula (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','superseded','archived')),
  generator text not null,              -- rules engine version / model id
  inputs_snapshot jsonb not null default '{}',
  rationale text,
  created_at timestamptz not null default now()
);

create table public.tabr_curriculum_items (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references public.tabr_curricula(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  position int not null,
  target_level public.tabr_mastery_level not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','active','complete','skipped')),
  created_at timestamptz not null default now()
);

-- ---------- 4. INTEGRATIONS ----------
create table public.tabr_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('align')),
  status text not null default 'pending' check (status in ('pending','connected','revoked','error')),
  external_account_id text,
  scopes text[] not null default '{}',
  connected_at timestamptz,
  revoked_at timestamptz,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- tokens: server only (RLS on, no policies)
create table public.tabr_integration_tokens (
  integration_id uuid primary key references public.tabr_integrations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- outbox for retryable, idempotent sync: server only
create table public.tabr_sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  direction text not null check (direction in ('export','import')),
  event_type text not null,             -- practice_session.completed, assessment.recorded, ...
  schema_version int not null default 1,
  idempotency_key text not null unique,
  payload jsonb not null,
  status text not null default 'queued' check (status in ('queued','sent','failed','dead')),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- ---------- INDEXES ----------
create index tabr_skills_domain_idx on public.tabr_skills(domain) where status = 'published';
create index tabr_prereq_prereq_idx on public.tabr_skill_prerequisites(prerequisite_id);
create index tabr_exercises_skill_idx on public.tabr_exercises(skill_id);
create index tabr_criteria_skill_idx on public.tabr_assessment_criteria(skill_id);
create index tabr_equipment_user_idx on public.tabr_equipment(user_id);
create index tabr_repertoire_user_idx on public.tabr_repertoire(user_id);
create index tabr_mastery_skill_idx on public.tabr_skill_mastery(skill_id);
create index tabr_assessments_user_idx on public.tabr_assessments(user_id, created_at desc);
create index tabr_assessments_skill_idx on public.tabr_assessments(skill_id);
create index tabr_assessments_criteria_idx on public.tabr_assessments(criteria_id);
create index tabr_sessions_user_idx on public.tabr_practice_sessions(user_id, started_at desc);
create index tabr_items_session_idx on public.tabr_practice_items(session_id);
create index tabr_items_user_idx on public.tabr_practice_items(user_id);
create index tabr_items_skill_idx on public.tabr_practice_items(skill_id);
create index tabr_items_exercise_idx on public.tabr_practice_items(exercise_id);
create index tabr_curricula_user_idx on public.tabr_curricula(user_id, created_at desc);
create index tabr_citems_curr_idx on public.tabr_curriculum_items(curriculum_id, position);
create index tabr_citems_user_idx on public.tabr_curriculum_items(user_id);
create index tabr_citems_skill_idx on public.tabr_curriculum_items(skill_id);
create index tabr_tokens_user_idx on public.tabr_integration_tokens(user_id);
create index tabr_sync_due_idx on public.tabr_sync_events(status, next_attempt_at);
create index tabr_sync_user_idx on public.tabr_sync_events(user_id);

-- ---------- updated_at triggers ----------
create trigger tabr_skills_touch before update on public.tabr_skills for each row execute function public.tabr_touch_updated_at();
create trigger tabr_exercises_touch before update on public.tabr_exercises for each row execute function public.tabr_touch_updated_at();
create trigger tabr_profiles_touch before update on public.tabr_profiles for each row execute function public.tabr_touch_updated_at();
create trigger tabr_repertoire_touch before update on public.tabr_repertoire for each row execute function public.tabr_touch_updated_at();
create trigger tabr_mastery_touch before update on public.tabr_skill_mastery for each row execute function public.tabr_touch_updated_at();
create trigger tabr_tokens_touch before update on public.tabr_integration_tokens for each row execute function public.tabr_touch_updated_at();

-- ---------- RLS ----------
alter table public.tabr_skills enable row level security;
alter table public.tabr_skill_prerequisites enable row level security;
alter table public.tabr_exercises enable row level security;
alter table public.tabr_assessment_criteria enable row level security;
alter table public.tabr_profiles enable row level security;
alter table public.tabr_equipment enable row level security;
alter table public.tabr_repertoire enable row level security;
alter table public.tabr_skill_mastery enable row level security;
alter table public.tabr_assessments enable row level security;
alter table public.tabr_practice_sessions enable row level security;
alter table public.tabr_practice_items enable row level security;
alter table public.tabr_curricula enable row level security;
alter table public.tabr_curriculum_items enable row level security;
alter table public.tabr_integrations enable row level security;
alter table public.tabr_integration_tokens enable row level security;
alter table public.tabr_sync_events enable row level security;

-- content: signed-in users read published content only
create policy tabr_skills_read on public.tabr_skills for select to authenticated using (status = 'published');
create policy tabr_prereq_read on public.tabr_skill_prerequisites for select to authenticated using (true);
create policy tabr_exercises_read on public.tabr_exercises for select to authenticated using (status = 'published');
create policy tabr_criteria_read on public.tabr_assessment_criteria for select to authenticated using (status = 'published');

-- personal data: owner full access
create policy tabr_profiles_own on public.tabr_profiles for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tabr_equipment_own on public.tabr_equipment for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tabr_repertoire_own on public.tabr_repertoire for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tabr_sessions_own on public.tabr_practice_sessions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tabr_items_own on public.tabr_practice_items for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and exists (
    select 1 from public.tabr_practice_sessions s where s.id = session_id and s.user_id = (select auth.uid())));

-- mastery + assessments: owner reads; server writes (progression must come from demonstrated proficiency)
create policy tabr_mastery_read on public.tabr_skill_mastery for select to authenticated using ((select auth.uid()) = user_id);
create policy tabr_assessments_read on public.tabr_assessments for select to authenticated using ((select auth.uid()) = user_id);

-- curriculum: owner reads; server writes
create policy tabr_curricula_read on public.tabr_curricula for select to authenticated using ((select auth.uid()) = user_id);
create policy tabr_citems_read on public.tabr_curriculum_items for select to authenticated using ((select auth.uid()) = user_id);

-- integrations: owner reads status; server writes. tokens + sync events: no policies (service role only)
create policy tabr_integrations_read on public.tabr_integrations for select to authenticated using ((select auth.uid()) = user_id);

-- auto-create tabr profile row on first sign-in is done by the app (upsert), not an auth trigger,
-- so other apps sharing this auth pool are untouched.
