import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CHORD_CATEGORIES, CHORDS, type ChordCategoryId, type ChordShape } from '@/lib/music/chords';
import { STANDARD_STRINGS, noteAt } from '@/lib/music/theory';
import type { TabNote } from '@/lib/music/tabParser';
import { select } from '@/lib/haptics';
import { colors, fingerColors, fingerNames, fonts, radius, space } from '@/lib/theme';
import Fretboard from '@/components/Fretboard';
import { BackHeader, Body, Grid2, Panel, Pill, Screen, SectionTitle, Small } from '@/components/ui';

function toNotes(chord: ChordShape): TabNote[] {
  return chord.frets.flatMap((fret, string) =>
    fret === null ? [] : [{ string, fret, finger: chord.fingers[string] ?? 0, type: 'note' as const, technique: null, vibrato: false }],
  );
}

/** x32010 style: 6th string first, the way chord charts write it. */
const notation = (c: ChordShape) => [...c.frets].reverse().map((f) => (f === null ? 'x' : String(f))).join('');

export default function Chords() {
  const [category, setCategory] = useState<ChordCategoryId>('blues');
  const list = useMemo(() => CHORDS.filter((c) => c.category === category), [category]);
  const [selectedName, setSelectedName] = useState(list[0].name);
  const chord = list.find((c) => c.name === selectedName) ?? list[0];
  const cat = CHORD_CATEGORIES.find((c) => c.id === category)!;
  const muted = chord.frets.flatMap((f, i) => (f === null ? [i] : []));

  return (
    <Screen edges={['top', 'bottom']}>
      <BackHeader title="Chords" onBack={() => router.back()} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {CHORD_CATEGORIES.map((c) => (
          <Pill
            key={c.id}
            label={c.name}
            active={c.id === category}
            onPress={() => {
              setCategory(c.id);
              setSelectedName(CHORDS.find((x) => x.category === c.id)!.name);
            }}
          />
        ))}
      </ScrollView>
      <Body muted style={{ marginTop: space.md }}>
        {cat.desc}
      </Body>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: space.xl }}>
        <Text style={{ fontFamily: fonts.display, color: colors.text, fontSize: 56, letterSpacing: -2.4, lineHeight: 60 }}>{chord.name}</Text>
        <Text style={{ fontFamily: fonts.monoBold, color: colors.textMuted, fontSize: 18, letterSpacing: 2 }}>{notation(chord)}</Text>
      </View>
      <Body muted>{chord.context}</Body>

      <View style={{ marginVertical: space.lg, marginHorizontal: -4 }}>
        <Fretboard notes={toNotes(chord)} mutedStrings={muted} minFrets={7} />
      </View>

      <Panel>
        <Body>{chord.desc}</Body>
        <View style={{ marginTop: space.lg, gap: space.sm }}>
          {chord.frets.map((fret, i) => {
            const finger = chord.fingers[i] ?? 0;
            const s = STANDARD_STRINGS[i];
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: fret === null ? 'transparent' : finger ? fingerColors[finger] : 'transparent',
                    borderWidth: fret === null || finger ? 0 : 2,
                    borderColor: colors.olympic,
                  }}>
                  <Text style={{ fontWeight: '800', fontSize: 12, color: fret === null ? colors.candy : finger ? colors.ink : colors.olympic }}>
                    {fret === null ? '✕' : finger || 'o'}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 16, width: 64 }}>
                  {s.num} {s.name}
                </Text>
                <Text style={{ color: fret === null ? colors.textFaint : colors.textMuted, fontSize: 15, flex: 1 }}>
                  {fret === null ? "Don't play" : fret === 0 ? `Open, ${noteAt(i, 0)}` : `Fret ${fret}, ${fingerNames[finger].toLowerCase()}, ${noteAt(i, fret)}`}
                </Text>
              </View>
            );
          })}
        </View>
        {chord.basedOn ? <Small style={{ marginTop: space.lg }}>{chord.basedOn}</Small> : null}
      </Panel>

      <SectionTitle>{`${cat.name}`}</SectionTitle>
      <Grid2 gap={space.sm}>
        {list.map((c) => {
          const active = c.name === chord.name;
          return (
            <Pressable
              key={c.name}
              onPress={() => {
                select();
                setSelectedName(c.name);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                padding: space.md + 2,
                borderRadius: radius.md,
                backgroundColor: active ? colors.olympic : colors.surface,
              }}>
              <Text style={{ fontFamily: fonts.heading, color: active ? colors.ink : colors.text, fontSize: 19 }} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={{ fontFamily: fonts.mono, color: active ? colors.ink : colors.textFaint, fontSize: 13, letterSpacing: 1.5, marginTop: 2 }}>{notation(c)}</Text>
            </Pressable>
          );
        })}
      </Grid2>
    </Screen>
  );
}
