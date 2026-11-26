-- Guitarist profile: what onboarding learns about the student (brief, section 10).
-- Everything here is SELF-REPORTED. It guides the curriculum but never counts as demonstrated
-- ability; mastery only moves through evidence (see tabr_mastery_evidence).

alter table public.tabr_profiles
  add column if not exists self_level text
    check (self_level in ('new','beginner','advanced_beginner','intermediate','advanced')),
  -- { "<ability_key>": "cannot" | "unsure" | "can" }, keys defined in the app (src/lib/guitarist.ts)
  add column if not exists self_assessment jsonb not null default '{}',
  add column if not exists favorite_songs text[] not null default '{}',
  add column if not exists known_riffs text[] not null default '{}',
  add column if not exists musical_identity text,
  add column if not exists goals text[] not null default '{}',
  add column if not exists primary_goal text,
  add column if not exists frustrations text,
  add column if not exists previous_learning text,
  add column if not exists performance_experience text
    check (performance_experience in ('none','with_friends','jams','gigs')),
  add column if not exists listening_setup text
    check (listening_setup in ('amp_speaker','headphone_amp','interface','unplugged')),
  add column if not exists onboarding_step int not null default 0;

comment on column public.tabr_profiles.self_assessment is
  'Self-reported abilities keyed by ability id. Not evidence of mastery.';
comment on column public.tabr_profiles.learning_preferences is
  'Self-reported learning preferences: { "prefers": ["songs","exercises",...] }';
