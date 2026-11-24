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
  want_to_learn: 'Want to learn',
  learning: 'Learning',
  can_play: 'Can play',
  performance_ready: 'Performance ready',
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
