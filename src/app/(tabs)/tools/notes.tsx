import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { NOTE_NAMES, STANDARD_STRINGS, noteAt, type NoteName } from '@/lib/music/theory';
import { select } from '@/lib/haptics';
import { colors, fonts, radius, space } from '@/lib/theme';
import Fretboard, { type FretMark } from '@/components/Fretboard';
import { BackHeader, Body, Panel, Screen, SectionTitle, Small } from '@/components/ui';

const MAX_FRET = 15;

export default function NoteFinder() {
  const [note, setNote] = useState<NoteName>('A');

  const marks = useMemo<FretMark[]>(() => {
    const out: FretMark[] = [];
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= MAX_FRET; f++) {
        if (noteAt(s, f) === note) out.push({ string: s, fret: f, label: note, color: f === 0 || f === 12 ? colors.sunburst : colors.olympic });
      }
    }
    return out;
  }, [note]);

  return (
    <Screen edges={['top', 'bottom']}>
      <BackHeader title="Note Finder" sub="Every place a note lives on the neck." onBack={() => router.back()} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {NOTE_NAMES.map((n) => {
          const active = n === note;
          return (
            <Pressable
              key={n}
              onPress={() => {
                select();
                setNote(n);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                flexBasis: '14%',
                flexGrow: 1,
                height: 50,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.olympic : colors.surface,
              }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: active ? colors.ink : colors.text }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginVertical: space.xl, marginHorizontal: -4 }}>
        <Fretboard marks={marks} minFrets={MAX_FRET} showNoteNames={false} />
      </View>

      <Panel>
        {STANDARD_STRINGS.map((s, i) => {
          const frets = marks.filter((m) => m.string === i).map((m) => (m.fret === 0 ? 'open' : String(m.fret)));
          return (
            <View key={s.num} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: space.md }}>
              <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 16, width: 64 }}>
                {s.num} {s.name}
              </Text>
              <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 14, flex: 1 }}>{frets.join('  ')}</Text>
            </View>
          );
        })}
      </Panel>

      <SectionTitle>Why It Repeats</SectionTitle>
      <Body muted>
        Twelve frets is one full octave, so every note shows up again 12 frets higher.
        {marks.some((m) => m.fret === 0) ? ` ${note} is an open string, so amber marks it open and again at fret 12.` : ''}
      </Body>
      <Small style={{ marginTop: space.md }}>Shown in standard tuning.</Small>
    </Screen>
  );
}
