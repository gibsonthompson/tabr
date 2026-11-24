import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { MASTERY_LABELS, type MasteryLevel, type Skill } from '@/lib/db';
import { colors, space } from '@/lib/theme';
import { Body, Card, Empty, ErrorText, Label, Screen, Title } from '@/components/ui';

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
        if (s.error) setError(s.error.message);
        setSkills(s.data ?? []);
        setMastery(Object.fromEntries((m.data ?? []).map((r) => [r.skill_id, r.level as MasteryLevel])));
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
      <Title sub="Skills you can work on, each with its own exercises and checks.">Learn</Title>
      <ErrorText>{error}</ErrorText>
      {skills === null ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: space.xl }} />
      ) : skills.length === 0 ? (
        <Empty
          title="No lessons published yet"
          body="The skill library is being researched and written. Skills show up here as soon as they are published."
        />
      ) : (
        Object.entries(byDomain).map(([domain, list]) => (
          <View key={domain} style={{ marginBottom: space.lg }}>
            <Label>{domain}</Label>
            {list.map((s) => (
              <Card key={s.id}>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{s.name}</Text>
                {s.summary ? <Body muted>{s.summary}</Body> : null}
                <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '700', marginTop: space.sm }}>
                  {MASTERY_LABELS[mastery[s.id] ?? 'not_started']}
                </Text>
              </Card>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}
