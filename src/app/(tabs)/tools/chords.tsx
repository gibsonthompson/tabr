import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHORD_CATEGORIES, CHORDS, type ChordCategoryId, type ChordShape } from '@/lib/music/chords';
import { STANDARD_STRINGS, noteAt } from '@/lib/music/theory';
import type { TabNote } from '@/lib/music/tabParser';
import { colors, fingerColors, fingerNames, radius, space } from '@/lib/theme';
import Fretboard from '@/components/Fretboard';
import { Body, Card, Chip, Grid2, Label, Screen } from '@/components/ui';

function toNotes(chord: ChordShape): TabNote[] {
  return chord.frets.flatMap((fret, string) =>
    fret === null ? [] : [{ string, fret, finger: chord.fingers[string] ?? 0, type: 'note' as const, technique: null, vibrato: false }],
  );
}

export default function Chords() {
  const [category, setCategory] = useState<ChordCategoryId>('blues');
  const list = useMemo(() => CHORDS.filter((c) => c.category === category), [category]);
  const [selectedName, setSelectedName] = useState(list[0].name);
  const chord = list.find((c) => c.name === selectedName) ?? list[0];
  const cat = CHORD_CATEGORIES.find((c) => c.id === category)!;
  const muted = chord.frets.flatMap((f, i) => (f === null ? [i] : []));

  return (
    <Screen edges={['bottom']}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CHORD_CATEGORIES.map((c) => (
          <Chip
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
      <Body muted style={{ marginBottom: space.md }}>
        {cat.desc}
      </Body>

      <Text style={{ color: colors.gold, fontSize: 28, fontWeight: '900', textAlign: 'center' }}>{chord.name}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', marginBottom: space.sm }}>{chord.context}</Text>
      <Fretboard notes={toNotes(chord)} mutedStrings={muted} minFrets={7} />
      {muted.length ? (
        <Text style={{ color: colors.danger, fontSize: 13, textAlign: 'center', marginTop: space.xs }}>
          Don't strum: {muted.map((s) => `${STANDARD_STRINGS[s].name} (${STANDARD_STRINGS[s].num})`).join(', ')}
        </Text>
      ) : null}

      <Card style={{ marginTop: space.md }}>
        <Body>{chord.desc}</Body>
        {chord.basedOn ? <Body muted style={{ marginTop: space.xs, fontStyle: 'italic' }}>{chord.basedOn}</Body> : null}
        <View style={{ marginTop: space.md }}>
          {chord.frets.map((fret, i) => {
            if (fret === null) return null;
            const finger = chord.fingers[i] ?? 0;
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    marginRight: space.sm,
                    backgroundColor: finger ? fingerColors[finger] : 'transparent',
                    borderWidth: finger ? 0 : 2,
                    borderColor: colors.gold,
                  }}
                />
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {STANDARD_STRINGS[i].num} string ({STANDARD_STRINGS[i].name}): {fret === 0 ? 'open' : `fret ${fret}, ${fingerNames[finger].toLowerCase()} finger`}{' '}
                  <Text style={{ color: colors.textMuted }}>= {noteAt(i, fret)}</Text>
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Label>{`${cat.name} (${list.length})`}</Label>
      <Grid2>
        {list.map((c) => {
          const active = c.name === chord.name;
          return (
            <Pressable
              key={c.name}
              onPress={() => setSelectedName(c.name)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                padding: space.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: active ? colors.gold : colors.border,
                backgroundColor: active ? 'rgba(212,175,55,0.12)' : colors.surface,
              }}>
              <Text style={{ color: colors.gold, fontSize: 16, fontWeight: '800' }}>{c.name}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 11, letterSpacing: 1, fontVariant: ['tabular-nums'] }}>
                {[...c.frets].reverse().map((f) => (f === null ? 'x' : f)).join(' ')}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }} numberOfLines={1}>
                {c.context}
              </Text>
            </Pressable>
          );
        })}
      </Grid2>
    </Screen>
  );
}
