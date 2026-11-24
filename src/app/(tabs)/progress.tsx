import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { PracticeSession } from '@/lib/db';
import { colors, space } from '@/lib/theme';
import { Body, Button, Card, Empty, ErrorText, Grid2, Label, Screen, Title } from '@/components/ui';

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfWeek(d: Date) {
  const s = new Date(d);
  const diff = (s.getDay() + 6) % 7; // Monday start
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - diff);
  return s;
}

function streakDays(sessions: PracticeSession[]) {
  const days = new Set(sessions.map((s) => dayKey(new Date(s.started_at))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // today not practiced yet doesn't break it
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ marginBottom: 0 }}>
      <Label>{label}</Label>
      <Text style={{ color: colors.gold, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </Card>
  );
}

export default function Progress() {
  const [sessions, setSessions] = useState<PracticeSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('tabr_practice_sessions')
        .select('id, started_at, ended_at, planned_minutes, actual_minutes, notes')
        .order('started_at', { ascending: false })
        .limit(500)
        .then(({ data, error }) => {
          if (error) setError(error.message);
          setSessions((data as PracticeSession[]) ?? []);
        });
    }, []),
  );

  const stats = useMemo(() => {
    const list = sessions ?? [];
    const weekStart = startOfWeek(new Date()).getTime();
    const thisWeek = list.filter((s) => new Date(s.started_at).getTime() >= weekStart);
    const minutes = (arr: PracticeSession[]) => arr.reduce((sum, s) => sum + (s.actual_minutes ?? 0), 0);
    return {
      weekMinutes: minutes(thisWeek),
      weekSessions: thisWeek.length,
      totalHours: minutes(list) / 60,
      streak: streakDays(list),
    };
  }, [sessions]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Title sub="Your practice so far.">Progress</Title>
        </View>
        <Button title="Account" kind="secondary" onPress={() => router.push('/account')} style={{ paddingVertical: 8, minHeight: 36 }} />
      </View>
      <ErrorText>{error}</ErrorText>

      {sessions === null ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: space.xl }} />
      ) : (
        <>
          <Grid2>
            <Stat label="Minutes This Week" value={String(stats.weekMinutes)} />
            <Stat label="Sessions This Week" value={String(stats.weekSessions)} />
            <Stat label="Hours All Time" value={stats.totalHours.toFixed(1)} />
            <Stat label="Day Streak" value={String(stats.streak)} />
          </Grid2>

          <View style={{ height: space.lg }} />
          <Label>Recent Sessions</Label>
          {sessions.length === 0 ? (
            <Empty title="No sessions yet" body="Start a practice timer on the Today tab. Each finished session is logged here." />
          ) : (
            sessions.slice(0, 20).map((s) => (
              <Card key={s.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
                    {new Date(s.started_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={{ color: colors.gold, fontWeight: '700', fontSize: 15 }}>{s.actual_minutes ?? 0} min</Text>
                </View>
                {s.notes ? <Body muted style={{ marginTop: space.xs }}>{s.notes}</Body> : null}
              </Card>
            ))
          )}

          <View style={{ height: space.md }} />
          <Card>
            <Label>Skill Mastery</Label>
            <Body muted>Mastery tracking turns on with the lesson library. It moves only when you show a skill, not when you finish a lesson.</Body>
          </Card>
        </>
      )}
    </Screen>
  );
}
