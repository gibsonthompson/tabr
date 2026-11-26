-- Learning model upgrade (brief, sections 9, 11, 12, 14, 24).
--  * Mastery records HOW it was earned (verified / self-reported / AI-inferred), how confident
--    the system is, and when the skill is due for a retention check.
--  * Every meaningful change is backed by a timestamped evidence row.
--  * Skills distinguish required from merely recommended prerequisites and declare which
--    assessment dimensions apply (theory, technique, aural and creative skills differ).
--  * Lessons are assembled from reusable, configurable components.

create type public.tabr_evidence_source as enum ('verified','self_reported','ai_inferred');

-- ---------- Skills ----------
alter table public.tabr_skills
  add column if not exists difficulty smallint check (difficulty between 1 and 10),
  -- subset of: knowledge, technique, aural, application, creative
  add column if not exists assessment_dimensions text[] not null default '{}',
  add column if not exists mastery_criteria jsonb not null default '{}',
  add column if not exists remediation jsonb not null default '[]',
  -- default spacing for retention checks once a skill is demonstrated, in days
  add column if not exists review_intervals_days int[] not null default '{1,3,7,14,30,60}',
  add column if not exists genre_applications jsonb not null default '[]';

alter table public.tabr_skill_prerequisites
  add column if not exists kind text not null default 'required' check (kind in ('required','recommended'));

create table public.tabr_skill_relations (
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  related_id uuid not null references public.tabr_skills(id) on delete cascade,
  kind text not null default 'related' check (kind in ('related','complementary','applies_in')),
  primary key (skill_id, related_id, kind),
  check (skill_id <> related_id)
);

-- ---------- Mastery ----------
alter table public.tabr_skill_mastery
  add column if not exists evidence_source public.tabr_evidence_source,
  add column if not exists confidence numeric(3,2) check (confidence between 0 and 1),
  add column if not exists next_review_at timestamptz,
  add column if not exists review_interval_days int,
  add column if not exists successful_reviews int not null default 0,
  add column if not exists lapses int not null default 0,
  add column if not exists last_reviewed_at timestamptz;

create index if not exists tabr_mastery_review_due on public.tabr_skill_mastery (user_id, next_review_at);

create table public.tabr_mastery_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  source public.tabr_evidence_source not null,
  kind text not null check (kind in ('assessment','practice','retention_check','self_report','conversation','misconception')),
  level_before public.tabr_mastery_level,
  level_after public.tabr_mastery_level,
  dimension text check (dimension in ('knowledge','technique','aural','application','creative')),
  confidence numeric(3,2) check (confidence between 0 and 1),
  assessment_id uuid references public.tabr_assessments(id) on delete set null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index tabr_evidence_user_skill on public.tabr_mastery_evidence (user_id, skill_id, created_at desc);

-- ---------- Lessons ----------
create table public.tabr_lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  objective text not null,
  why_it_matters text,
  estimated_minutes int,
  status public.tabr_content_status not null default 'draft',
  content_version int not null default 1,
  sources jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tabr_lesson_skills (
  lesson_id uuid not null references public.tabr_lessons(id) on delete cascade,
  skill_id uuid not null references public.tabr_skills(id) on delete cascade,
  target_level public.tabr_mastery_level not null default 'demonstration',
  primary key (lesson_id, skill_id)
);

create table public.tabr_lesson_components (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.tabr_lessons(id) on delete cascade,
  position int not null,
  component text not null check (component in (
    'concept','fretboard','chord_diagram','scale_view','interval_view','audio_demo','listening',
    'quiz','note_identification','timed_practice','metronome','backing_track','tab',
    'guided_improvisation','rhythm','ear_training','ai_explanation','self_assessment',
    'performance_assessment','mastery_checkpoint')),
  title text,
  config jsonb not null default '{}',
  unique (lesson_id, position)
);

-- What happened inside a lesson for one student.
create table public.tabr_lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.tabr_lessons(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  component_results jsonb not null default '[]',
  content_version int not null
);

create trigger tabr_lessons_touch before update on public.tabr_lessons
  for each row execute function public.tabr_touch_updated_at();

-- ---------- Practice items: what each block of a session was for ----------
alter table public.tabr_practice_items
  add column if not exists block text,
  add column if not exists lesson_id uuid references public.tabr_lessons(id) on delete set null,
  add column if not exists completed boolean not null default true;

-- ---------- RLS ----------
alter table public.tabr_skill_relations enable row level security;
alter table public.tabr_mastery_evidence enable row level security;
alter table public.tabr_lessons enable row level security;
alter table public.tabr_lesson_skills enable row level security;
alter table public.tabr_lesson_components enable row level security;
alter table public.tabr_lesson_attempts enable row level security;

-- shared content: readable when published
create policy tabr_relations_read on public.tabr_skill_relations for select to authenticated using (true);
create policy tabr_lessons_read on public.tabr_lessons for select to authenticated using (status = 'published');
create policy tabr_lesson_skills_read on public.tabr_lesson_skills for select to authenticated
  using (exists (select 1 from public.tabr_lessons l where l.id = lesson_id and l.status = 'published'));
create policy tabr_components_read on public.tabr_lesson_components for select to authenticated
  using (exists (select 1 from public.tabr_lessons l where l.id = lesson_id and l.status = 'published'));

-- evidence: the student can read theirs; only the server writes verified/AI evidence.
-- Students may file self-reports only, never verified evidence about themselves.
create policy tabr_evidence_read on public.tabr_mastery_evidence for select to authenticated
  using ((select auth.uid()) = user_id);
create policy tabr_evidence_self_report on public.tabr_mastery_evidence for insert to authenticated
  with check ((select auth.uid()) = user_id and source = 'self_reported' and kind = 'self_report');

-- lesson attempts: owner reads and records progress; grading happens server-side into evidence
create policy tabr_attempts_own on public.tabr_lesson_attempts for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
