import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { PracticeSession } from '@/lib/db';
import { startOfWeek, streakDays, weekMinutes } from '@/lib/practice';
import { colors, fonts, radius, space } from '@/lib/theme';
import WeekBars from '@/components/WeekBars';
import { Body, ErrorText, Header, Loading, Panel, Screen, SectionTitle, Small } from '@/components/ui';

function Avatar({ letter }: { letter: string }) {
  return (
    <Pressable
      onPress={() => router.push('/account')}
      accessibilityRole="button"
      accessibilityLabel="Profile and settings"
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.daphne,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        opacity: pressed ? 0.8 : 1,
      })}>
      <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 19 }}>{letter}</Text>
    </Pressable>
  );
}

export default function Progress() {
  const { session } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[] | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        supabase
          .from('tabr_practice_sessions')
          .select('id, started_at, ended_at, planned_minutes, actual_minutes, notes')
          .order('started_at', { ascending: false })
          .limit(1000),
        supabase.from('tabr_profiles').select('display_name, practice_minutes_per_session').maybeSingle(),
      ]).then(([s, p]) => {
        if (s.error) setError(`Your practice history didn't load: ${s.error.message}`);
        setSessions((s.data as PracticeSession[]) ?? []);
        setGoal(p.data?.practice_minutes_per_session ?? null);
        setName(p.data?.display_name ?? null);
      });
    }, []),
  );

  const stats = useMemo(() => {
    const list = sessions ?? [];
    const weekStart = startOfWeek().getTime();
    const thisWeek = list.filter((s) => new Date(s.started_at).getTime() >= weekStart);
    const sum = (arr: PracticeSession[]) => arr.reduce((t, s) => t + (s.actual_minutes ?? 0), 0);
    return {
      days: weekMinutes(list),
      weekMinutes: sum(thisWeek),
      weekSessions: thisWeek.length,
      totalHours: sum(list) / 60,
      total: list.length,
      streak: streakDays(list),
    };
  }, [sessions]);

  const letter = (name ?? session?.user.email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <Screen>
      <Header title="Progress" right={<Avatar letter={letter} />} />
      <ErrorText>{error}</ErrorText>

      {sessions === null ? (
        <Loading />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.md }}>
            <Text style={{ fontFamily: fonts.display, color: stats.streak ? colors.sunburst : colors.surfaceHigh, fontSize: 104, lineHeight: 104, letterSpacing: -5 }}>
              {stats.streak}
            </Text>
            <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 22, lineHeight: 26, marginBottom: 14, flex: 1 }}>
              {stats.streak === 1 ? 'day in a row' : 'days in a row'}
            </Text>
          </View>
          <Body muted style={{ marginTop: space.sm }}>
            {stats.total === 0
              ? 'Finish a practice session on the Today tab and it starts counting here.'
              : `${stats.totalHours.toFixed(1)} hours over ${stats.total} ${stats.total === 1 ? 'session' : 'sessions'} so far.`}
          </Body>

          <SectionTitle right={<Small>{stats.weekSessions} {stats.weekSessions === 1 ? 'session' : 'sessions'}</Small>}>This Week</SectionTitle>
          <Panel>
            <WeekBars days={stats.days} goal={goal} />
            {goal ? <Small style={{ marginTop: space.md }}>Green days hit your {goal} minute goal.</Small> : null}
          </Panel>

          {sessions.length ? (
            <>
              <SectionTitle>Recent Sessions</SectionTitle>
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
                {sessions.slice(0, 15).map((s, i) => (
                  <View key={s.id} style={{ padding: space.lg, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 17 }}>
                        {new Date(s.started_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={{ fontFamily: fonts.monoBold, color: colors.daphne, fontSize: 15 }}>{s.actual_minutes ?? 0} min</Text>
                    </View>
                    {s.notes ? <Small style={{ color: colors.textMuted, marginTop: 4 }}>{s.notes}</Small> : null}
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <SectionTitle>Skills</SectionTitle>
          <Body muted>Skill progress shows up here once lessons are published. A skill only moves up when you show it, not when you finish a lesson.</Body>
        </>
      )}
    </Screen>
  );
}
