import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { PracticeSession } from '@/lib/db';
import { greeting, startOfWeek, weekMinutes } from '@/lib/practice';
import { success } from '@/lib/haptics';
import { colors, fonts, radius, space } from '@/lib/theme';
import PracticeRing from '@/components/PracticeRing';
import WeekBars from '@/components/WeekBars';
import { ChordGlyph, TunerGlyph } from '@/components/brand';
import { Body, Button, ErrorText, Field, Header, Panel, Row, Screen, SectionTitle, Small } from '@/components/ui';

const ACTIVE_KEY = 'tabr.activePractice';
type Active = { startedAt: number; planned: number | null };

function readActive(): Active | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as Active) : null;
  } catch {
    return null;
  }
}

function clock(ms: number) {
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

function QuickTool({ title, sub, glyph, onPress }: { title: string; sub: string; glyph: ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: space.lg,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}>
      {glyph}
      <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 19, marginTop: space.md }}>{title}</Text>
      <Small>{sub}</Small>
    </Pressable>
  );
}

export default function Today() {
  const { session } = useAuth();
  const [active, setActive] = useState<Active | null>(() => readActive());
  const [now, setNow] = useState(Date.now());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [week, setWeek] = useState<PracticeSession[]>([]);

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([
      supabase.from('tabr_profiles').select('display_name, practice_minutes_per_session').maybeSingle(),
      supabase
        .from('tabr_practice_sessions')
        .select('id, started_at, ended_at, planned_minutes, actual_minutes, notes')
        .gte('started_at', startOfWeek().toISOString())
        .order('started_at', { ascending: false }),
    ]);
    setGoal(p.data?.practice_minutes_per_session ?? null);
    setName(p.data?.display_name ?? null);
    setWeek((s.data as PracticeSession[]) ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  const days = useMemo(() => weekMinutes(week), [week]);
  const todayMinutes = days.find((d) => d.isToday)?.minutes ?? 0;
  const weekTotal = days.reduce((s, d) => s + d.minutes, 0);

  function start() {
    const next = { startedAt: Date.now(), planned: goal };
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
    setActive(next);
    setNow(Date.now());
    setError(null);
  }

  function discard() {
    Alert.alert('Discard this session?', "This time won't be saved.", [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          localStorage.removeItem(ACTIVE_KEY);
          setActive(null);
          setNotes('');
        },
      },
    ]);
  }

  async function finish() {
    if (!active || !session) return;
    setSaving(true);
    setError(null);
    const ended = Date.now();
    const minutes = Math.max(1, Math.round((ended - active.startedAt) / 60000));
    const { error } = await supabase.from('tabr_practice_sessions').insert({
      user_id: session.user.id,
      started_at: new Date(active.startedAt).toISOString(),
      ended_at: new Date(ended).toISOString(),
      planned_minutes: active.planned,
      actual_minutes: minutes,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      setError(`The session didn't save: ${error.message}. Your timer is still running, so try again.`);
      return;
    }
    success();
    localStorage.removeItem(ACTIVE_KEY);
    setActive(null);
    setNotes('');
    load();
  }

  const elapsed = active ? now - active.startedAt : 0;
  const ringGoal = (active?.planned ?? goal ?? 20) * 60000;
  const dateLine = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Screen>
      <Header kicker={dateLine} title={name ? `${greeting()}, ${name}` : greeting()} />

      {active ? (
        <>
          <PracticeRing progress={elapsed / ringGoal} big={clock(elapsed)} caption={active.planned ? `of ${active.planned} min goal` : 'practicing'} />
          <View style={{ marginTop: space.xl }}>
            <Field label="What are you working on?" value={notes} onChangeText={setNotes} placeholder="Optional, saved with the session" multiline />
            <ErrorText>{error}</ErrorText>
            <Row gap={space.sm}>
              <Button title="Discard" kind="secondary" onPress={discard} style={{ flex: 1 }} />
              <Button title="Finish Session" onPress={finish} loading={saving} style={{ flex: 1.6 }} />
            </Row>
          </View>
        </>
      ) : (
        <>
          <PracticeRing
            progress={goal ? todayMinutes / goal : todayMinutes > 0 ? 1 : 0}
            big={String(todayMinutes)}
            caption={goal ? `of ${goal} minutes today` : 'minutes today'}
          />
          <Button title={todayMinutes > 0 ? 'Practice Again' : 'Start Practicing'} onPress={start} style={{ marginTop: space.xl }} />
          {!goal ? (
            <Pressable onPress={() => router.push('/account')} style={{ alignSelf: 'center', paddingVertical: space.md }}>
              <Small style={{ color: colors.textMuted }}>Set a daily goal in your profile</Small>
            </Pressable>
          ) : null}
        </>
      )}

      <SectionTitle right={<Small>{weekTotal} min</Small>}>This Week</SectionTitle>
      <Panel>
        <WeekBars days={days} goal={goal} />
      </Panel>

      <SectionTitle>Warm Up</SectionTitle>
      <Row gap={space.md} style={{ alignItems: 'stretch' }}>
        <QuickTool title="Tune Up" sub="Standard and alternate tunings" glyph={<TunerGlyph size={40} />} onPress={() => router.push('/tools/tuner')} />
        <QuickTool title="Chords" sub="Blues, rock and open shapes" glyph={<ChordGlyph size={40} />} onPress={() => router.push('/tools/chords')} />
      </Row>

      <Body faint style={{ marginTop: space.xl, fontSize: 14 }}>
        Your daily lesson plan will show up here once the lesson library is published.
      </Body>
    </Screen>
  );
}
