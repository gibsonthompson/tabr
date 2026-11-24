import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { NOTE_NAMES, STANDARD_STRINGS, noteAt, type NoteName } from '@/lib/music/theory';
import { colors, space } from '@/lib/theme';
import Fretboard, { type FretMark } from '@/components/Fretboard';
import { Body, Card, Chip, Label, Screen } from '@/components/ui';

const MAX_FRET = 15;

export default function NoteFinder() {
  const [note, setNote] = useState<NoteName>('A');

  const marks = useMemo<FretMark[]>(() => {
    const out: FretMark[] = [];
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= MAX_FRET; f++) {
        if (noteAt(s, f) === note) out.push({ string: s, fret: f, label: note, color: f === 0 ? colors.cream : colors.gold });
      }
    }
    return out;
  }, [note]);

  const perString = STANDARD_STRINGS.map((s, i) => ({
    s,
    frets: marks.filter((m) => m.string === i).map((m) => (m.fret === 0 ? 'open' : m.fret)),
  }));

  return (
    <Screen edges={['bottom']}>
      <Label>Pick a Note</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md }}>
        {NOTE_NAMES.map((n) => (
          <Chip key={n} label={n} active={n === note} onPress={() => setNote(n)} />
        ))}
      </View>

      <Fretboard marks={marks} minFrets={MAX_FRET} showNoteNames={false} />

      <Card style={{ marginTop: space.md }}>
        <Label>{`Every ${note} up to fret ${MAX_FRET}`}</Label>
        {perString.map(({ s, frets }) => (
          <Body key={s.num} style={{ color: colors.text }}>
            {s.num} string ({s.name}): {frets.join(', ')}
          </Body>
        ))}
        <Body muted style={{ marginTop: space.sm, fontSize: 13 }}>
          The pattern repeats 12 frets higher, so the 12th fret is the open string an octave up.
        </Body>
      </Card>
    </Screen>
  );
}
