import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { colors, space } from '@/lib/theme';
import { Body, Button, Card, ErrorText, Field, Label, Screen, Title } from '@/components/ui';

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

function formatElapsed(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
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

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('tabr_profiles')
        .select('display_name, practice_minutes_per_session')
        .maybeSingle()
        .then(({ data }) => {
          setGoal(data?.practice_minutes_per_session ?? null);
          setName(data?.display_name ?? null);
        });
    }, []),
  );

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  function start() {
    const next = { startedAt: Date.now(), planned: goal };
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
    setActive(next);
    setNow(Date.now());
    setError(null);
  }

  function discard() {
    Alert.alert('Discard this session?', 'The time will not be saved.', [
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
      setError(`Couldn't save the session: ${error.message}`);
      return;
    }
    localStorage.removeItem(ACTIVE_KEY);
    setActive(null);
    setNotes('');
    Alert.alert('Session saved', `${minutes} minute${minutes === 1 ? '' : 's'} logged.`);
  }

  const elapsed = active ? now - active.startedAt : 0;
  const goalMs = active?.planned ? active.planned * 60000 : null;

  return (
    <Screen>
      <Title sub={name ? `Welcome back, ${name}.` : 'Welcome back.'}>Today</Title>

      <Card>
        <Label>Practice Session</Label>
        {active ? (
          <>
            <Text
              style={{ color: colors.gold, fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'], marginVertical: space.sm }}
              accessibilityLabel={`Elapsed ${formatElapsed(elapsed)}`}>
              {formatElapsed(elapsed)}
            </Text>
            {goalMs ? (
              <Body muted style={{ marginBottom: space.md }}>
                {elapsed >= goalMs ? 'Goal reached. Keep going or wrap up.' : `Goal: ${active.planned} minutes`}
              </Body>
            ) : null}
            <Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="What did you work on?" multiline />
            <ErrorText>{error}</ErrorText>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Button title="Discard" kind="secondary" onPress={discard} style={{ flex: 1 }} />
              <Button title="Finish & Save" onPress={finish} loading={saving} style={{ flex: 2 }} />
            </View>
          </>
        ) : (
          <>
            <Body muted style={{ marginBottom: space.md }}>
              {goal ? `Your goal is ${goal} minutes a session.` : 'Start a timer when you pick up the guitar. Finished sessions show up in Progress.'}
            </Body>
            <Button title="Start Practicing" onPress={start} />
          </>
        )}
      </Card>

      <Card>
        <Label>Your Daily Plan</Label>
        <Body muted>
          Personalized daily plans are not built yet. They will come from your skill profile once the lesson library is in place.
        </Body>
      </Card>

      <Card>
        <Label>Before You Play</Label>
        <Body muted style={{ marginBottom: space.md }}>
          Tune up first so everything you practice sounds right.
        </Body>
        <Button title="Open Tuner" kind="secondary" onPress={() => router.push('/tools/tuner')} />
      </Card>
    </Screen>
  );
}
