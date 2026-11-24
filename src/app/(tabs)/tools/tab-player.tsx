import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SAMPLE_CHORDS, SAMPLE_TECHNIQUES, TECHNIQUE_INFO, parseTab } from '@/lib/music/tabParser';
import { STANDARD_STRINGS, noteAt } from '@/lib/music/theory';
import { colors, fingerColors, radius, space } from '@/lib/theme';
import Fretboard from '@/components/Fretboard';
import { Body, Button, Card, Chip, Empty, Label, Screen } from '@/components/ui';

const SPEEDS = [
  { label: '0.5x', ms: 800 },
  { label: '1x', ms: 400 },
  { label: '2x', ms: 200 },
];

export default function TabPlayer() {
  const [text, setText] = useState(SAMPLE_CHORDS);
  const steps = useMemo(() => parseTab(text), [text]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing || !steps.length) return;
    // Wider gaps between numbers in the tab hold longer (4 dashes = one beat at this speed).
    const delay = speed * ((steps[index]?.durationWeight ?? 4) / 4);
    timer.current = setTimeout(() => {
      if (index >= steps.length - 1) setPlaying(false);
      else setIndex(index + 1);
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, index, speed, steps]);

  const step = steps[index];
  const techniques = [...new Set((step?.notes ?? []).flatMap((n) => [n.technique, n.type !== 'note' ? n.type : null]).filter(Boolean))] as (keyof typeof TECHNIQUE_INFO)[];

  return (
    <Screen edges={['bottom']}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip label="Chord sample" onPress={() => setText(SAMPLE_CHORDS)} active={text === SAMPLE_CHORDS} />
        <Chip label="Techniques sample" onPress={() => setText(SAMPLE_TECHNIQUES)} active={text === SAMPLE_TECHNIQUES} />
        <Chip label="Clear" onPress={() => setText('')} />
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder={'Paste a 6-line tab, for example:\ne|---0---2h4---|\nB|---1---3-----|'}
        placeholderTextColor={colors.textFaint}
        accessibilityLabel="Tab text"
        style={{
          fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
          fontSize: 12,
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: space.md,
          minHeight: 150,
          textAlignVertical: 'top',
          marginBottom: space.md,
        }}
      />

      {!steps.length ? (
        <Empty title="Nothing to play yet" body="Paste a tab with all six string lines (e B G D A E) to see it on the neck." />
      ) : (
        <>
          <Fretboard notes={step?.notes ?? []} />

          <Card style={{ marginTop: space.md }}>
            <Label>{`Step ${index + 1} of ${steps.length}`}</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
              {(step?.notes ?? []).map((n, i) => (
                <Text key={i} style={{ color: n.finger ? fingerColors[n.finger] : colors.gold, fontWeight: '700', fontSize: 14 }}>
                  {STANDARD_STRINGS[n.string].num} {n.type === 'mute' ? 'muted' : n.fret === 0 ? 'open' : `fret ${n.fret}`}
                  {n.fret >= 0 && n.type !== 'mute' ? ` (${noteAt(n.string, n.bendTo ?? n.fret)})` : ''}
                </Text>
              ))}
            </View>
            {techniques.map((t) => (
              <Body key={t} muted style={{ marginTop: space.sm }}>
                <Text style={{ color: colors.gold, fontWeight: '700' }}>{TECHNIQUE_INFO[t].label}: </Text>
                {TECHNIQUE_INFO[t].desc}
              </Body>
            ))}
          </Card>

          <Pressable
            accessibilityRole="adjustable"
            accessibilityLabel="Position in tab"
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            onPress={(e) => {
              if (barWidth > 0) setIndex(Math.min(steps.length - 1, Math.max(0, Math.floor((e.nativeEvent.locationX / barWidth) * steps.length))));
            }}
            style={{ height: 24, justifyContent: 'center', marginBottom: space.md }}>
            <View style={{ height: 4, backgroundColor: colors.surfaceRaised, borderRadius: 2 }}>
              <View style={{ height: 4, width: `${((index + 1) / steps.length) * 100}%`, backgroundColor: colors.gold, borderRadius: 2 }} />
            </View>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.md }}>
            <Button title="Back" kind="secondary" onPress={() => setIndex(Math.max(0, index - 1))} style={{ flex: 1 }} />
            <Button
              title={playing ? 'Pause' : 'Play'}
              onPress={() => {
                if (!playing && index >= steps.length - 1) setIndex(0);
                setPlaying(!playing);
              }}
              style={{ flex: 1.4 }}
            />
            <Button title="Next" kind="secondary" onPress={() => setIndex(Math.min(steps.length - 1, index + 1))} style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {SPEEDS.map((s) => (
              <Chip key={s.label} label={s.label} active={speed === s.ms} onPress={() => setSpeed(s.ms)} />
            ))}
          </View>
          <Body muted style={{ fontSize: 12 }}>
            Fingers shown are a suggestion (one finger per fret). Tabs with screenshots and audio playback come later.
          </Body>
        </>
      )}
    </Screen>
  );
}
