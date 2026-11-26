/** Row types for the tabr_ tables (Detail Pro project). Keep in sync with supabase/migrations. */
export type MasteryLevel = 'not_started' | 'exposure' | 'recognition' | 'demonstration' | 'application' | 'mastery';

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  not_started: 'Not started',
  exposure: 'Seen it',
  recognition: 'Recognize it',
  demonstration: 'Can play it',
  application: 'Use it in music',
  mastery: 'Second nature',
};

export type Profile = {
  user_id: string;
  display_name: string | null;
  experience_months: number | null;
  practice_days_per_week: number | null;
  practice_minutes_per_session: number | null;
  preferred_genres: string[];
  preferred_artists: string[];
  ambitions: string | null;
  handedness: 'right' | 'left';
  default_tuning: string;
  onboarding_completed_at: string | null;
  // Self-reported guitarist profile (see src/lib/guitarist.ts). Never treated as demonstrated ability.
  self_level: import('./guitarist').SelfLevel | null;
  self_assessment: Record<string, import('./guitarist').SelfRating>;
  favorite_songs: string[];
  known_riffs: string[];
  musical_identity: string | null;
  goals: string[];
  primary_goal: string | null;
  frustrations: string | null;
  previous_learning: string | null;
  performance_experience: string | null;
  listening_setup: import('./guitarist').ListeningSetup | null;
  learning_preferences: { prefers?: string[] };
  onboarding_step: number;
};

export type Equipment = {
  id: string;
  kind: string;
  name: string;
  details: Record<string, unknown>;
};

export type Skill = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  summary: string | null;
};

export type RepertoireStatus = 'want_to_learn' | 'learning' | 'can_play' | 'performance_ready';
export const REPERTOIRE_LABELS: Record<RepertoireStatus, string> = {
  want_to_learn: 'Want to Learn',
  learning: 'Learning',
  can_play: 'Can Play',
  performance_ready: 'Performance Ready',
};

export type RepertoireItem = {
  id: string;
  title: string;
  artist: string | null;
  status: RepertoireStatus;
  notes: string | null;
  updated_at: string;
};

export type PracticeSession = {
  id: string;
  started_at: string;
  ended_at: string | null;
  planned_minutes: number | null;
  actual_minutes: number | null;
  notes: string | null;
};
