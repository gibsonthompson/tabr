import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { MASTERY_LABELS, type MasteryLevel, type Skill } from '@/lib/db';
import { colors, fonts, radius, space } from '@/lib/theme';
import { Body, ErrorText, Header, Loading, Panel, Screen, SectionTitle, Small } from '@/components/ui';

const LADDER: { level: MasteryLevel; color: string; what: string }[] = [
  { level: 'exposure', color: colors.surfaceHigh, what: "You've had it explained and heard it." },
  { level: 'recognition', color: colors.honey, what: 'You can spot it in a song or a tab.' },
  { level: 'demonstration', color: colors.cherry, what: 'You can play it cleanly on its own.' },
  { level: 'application', color: colors.chrome, what: 'You use it inside real music, in time.' },
  { level: 'mastery', color: colors.green, what: 'It happens without thinking, at full speed.' },
];

const LEVEL_INDEX: Record<MasteryLevel, number> = {
  not_started: 0,
  exposure: 1,
  recognition: 2,
  demonstration: 3,
  application: 4,
  mastery: 5,
};

function LevelBar({ level }: { level: MasteryLevel }) {
  const n = LEVEL_INDEX[level];
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {LADDER.map((l, i) => (
        <View key={l.level} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < n ? l.color : colors.surfaceHigh }} />
      ))}
    </View>
  );
}

export default function Learn() {
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryLevel>>({});
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      (async () => {
        const [s, m] = await Promise.all([
          supabase.from('tabr_skills').select('id, slug, name, domain, summary').order('domain').order('name'),
          supabase.from('tabr_skill_mastery').select('skill_id, level'),
        ]);
        if (!live) return;
        if (s.error) setError(`Lessons didn't load: ${s.error.message}`);
        setSkills((s.data as Skill[]) ?? []);
        setMastery(Object.fromEntries(((m.data as { skill_id: string; level: MasteryLevel }[]) ?? []).map((r) => [r.skill_id, r.level])));
      })();
      return () => {
        live = false;
      };
    }, []),
  );

  const byDomain = (skills ?? []).reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.domain] ??= []).push(s);
    return acc;
  }, {});

  return (
    <Screen>
      <Header title="Learn" />
      <ErrorText>{error}</ErrorText>

      {skills === null ? (
        <Loading />
      ) : skills.length === 0 ? (
        <>
          <Panel>
            <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 22, letterSpacing: -0.4, marginBottom: space.sm }}>
              Lessons are being written
            </Text>
            <Body muted>
              Every skill gets a researched explanation, original exercises and a way to check yourself.
            </Body>
          </Panel>

          <SectionTitle>How Progress Works</SectionTitle>
          <Body muted style={{ marginBottom: space.lg }}>
            Finishing a lesson doesn't move you up. Showing the skill does. Every skill climbs the same five steps.
          </Body>
          {LADDER.map((l, i) => (
            <View key={l.level} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.md, gap: space.md }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.md,
                  backgroundColor: l.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 20, color: i === 0 ? colors.text : colors.ink }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 17 }}>{MASTERY_LABELS[l.level]}</Text>
                <Small style={{ color: colors.textMuted }}>{l.what}</Small>
              </View>
            </View>
          ))}
        </>
      ) : (
        Object.entries(byDomain).map(([domain, list]) => (
          <View key={domain}>
            <SectionTitle>{domain.charAt(0).toUpperCase() + domain.slice(1)}</SectionTitle>
            {list.map((s) => (
              <Panel key={s.id} style={{ marginBottom: space.md }}>
                <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 18, marginBottom: 4 }}>{s.name}</Text>
                {s.summary ? <Body muted style={{ marginBottom: space.md }}>{s.summary}</Body> : null}
                <LevelBar level={mastery[s.id] ?? 'not_started'} />
                <Small style={{ marginTop: space.sm }}>{MASTERY_LABELS[mastery[s.id] ?? 'not_started']}</Small>
              </Panel>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}
