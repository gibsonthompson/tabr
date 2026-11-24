import type { PracticeSession } from './db';

export function startOfWeek(d = new Date()) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); // Monday
  return s;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Minutes per day for the current Monday-Sunday week. */
export function weekMinutes(sessions: PracticeSession[], now = new Date()) {
  const start = startOfWeek(now);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = dayKey(day);
    const minutes = sessions
      .filter((s) => dayKey(new Date(s.started_at)) === key)
      .reduce((sum, s) => sum + (s.actual_minutes ?? 0), 0);
    return { date: day, minutes, isToday: key === dayKey(now), isFuture: day > now };
  });
}

export function streakDays(sessions: PracticeSession[], now = new Date()) {
  const days = new Set(sessions.map((s) => dayKey(new Date(s.started_at))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // not practicing yet today doesn't break it
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
