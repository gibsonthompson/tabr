import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SAMPLE_CHORDS, SAMPLE_TECHNIQUES, TECHNIQUE_INFO, parseTab } from '@/lib/music/tabParser';
import { STANDARD_STRINGS, noteAt } from '@/lib/music/theory';
import { tap } from '@/lib/haptics';
import { colors, fingerColors, fonts, radius, space } from '@/lib/theme';
import Fretboard from '@/components/Fretboard';
import { TransportIcon } from '@/components/brand';
import { BackHeader, Body, Columns, Panel, Pill, Row, Screen, SectionTitle, Segmented, Small, useWide } from '@/components/ui';

const SPEEDS = [
  { value: 800, label: 'Slow' },
  { value: 400, label: 'Normal' },
  { value: 200, label: 'Fast' },
];

function RoundButton({ kind, onPress, big, label }: { kind: 'play' | 'pause' | 'prev' | 'next' | 'restart'; onPress: () => void; big?: boolean; label: string }) {
  const size = big ? 76 : 54;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: big ? colors.cream : colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}>
      <TransportIcon kind={kind} size={big ? 32 : 22} color={big ? colors.ink : colors.text} />
    </Pressable>
  );
}

export default function TabPlayer() {
  const wide = useWide();
  const [text, setText] = useState(SAMPLE_CHORDS);
  const steps = useMemo(() => parseTab(text), [text]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [barWidth, setBarWidth] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing || !steps.length) return;
    // Wider gaps in the tab hold longer: 4 dashes is one beat at the chosen speed.
    const delay = speed * ((steps[index]?.durationWeight ?? 4) / 4);
    timer.current = setTimeout(() => {
      if (index >= steps.length - 1) setPlaying(false);
      else setIndex(index + 1);
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, index, speed, steps]);

  // New tab text starts playback over from the first step.
  function changeText(next: string) {
    setText(next);
    setIndex(0);
    setPlaying(false);
  }

  const step = steps[index];
  const techniques = [
    ...new Set((step?.notes ?? []).flatMap((n) => [n.technique, n.type !== 'note' ? n.type : null]).filter(Boolean)),
  ] as (keyof typeof TECHNIQUE_INFO)[];

  const player = (
    <>
      <View style={{ marginHorizontal: -4 }}>
        <Fretboard notes={step?.notes ?? []} />
      </View>

      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel={`Step ${index + 1} of ${steps.length}`}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        onPress={(e) => {
          if (barWidth > 0) setIndex(Math.min(steps.length - 1, Math.max(0, Math.floor((e.nativeEvent.locationX / barWidth) * steps.length))));
        }}
        style={{ height: 28, justifyContent: 'center', marginTop: space.md }}>
        <View style={{ height: 6, backgroundColor: colors.surface, borderRadius: 3, flexDirection: 'row', gap: 2, overflow: 'hidden' }}>
          {steps.map((_, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: i <= index ? colors.honey : colors.surfaceHigh }} />
          ))}
        </View>
      </Pressable>
      <Row style={{ justifyContent: 'space-between' }}>
        <Small>
          Step {index + 1} of {steps.length}
        </Small>
        <Small>{wide ? 'Click the bar to jump' : 'Tap the bar to jump'}</Small>
      </Row>

      <Row gap={space.lg} style={{ justifyContent: 'center', marginVertical: space.xl }}>
        <RoundButton kind="restart" label="Start over" onPress={() => { setIndex(0); setPlaying(false); }} />
        <RoundButton kind="prev" label="Previous step" onPress={() => setIndex(Math.max(0, index - 1))} />
        <RoundButton
          kind={playing ? 'pause' : 'play'}
          big
          label={playing ? 'Pause' : 'Play'}
          onPress={() => {
            if (!playing && index >= steps.length - 1) setIndex(0);
            setPlaying(!playing);
          }}
        />
        <RoundButton kind="next" label="Next step" onPress={() => setIndex(Math.min(steps.length - 1, index + 1))} />
      </Row>

      <Segmented options={SPEEDS} value={speed} onChange={setSpeed} />
    </>
  );

  const stepPanel = (
    <Panel style={{ marginTop: wide ? 0 : space.lg }}>
      {wide ? <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 18, marginBottom: space.md }}>Step {index + 1}</Text> : null}
      <View style={{ gap: space.sm }}>
        {(step?.notes ?? [])
          .slice()
          .sort((a, b) => b.string - a.string)
          .map((n, i) => (
            <Row key={i} gap={space.md}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: n.finger ? fingerColors[n.finger] : colors.cream }} />
              <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 16, width: 64 }}>
                {STANDARD_STRINGS[n.string].num} {STANDARD_STRINGS[n.string].name}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 15, flex: 1 }}>
                {n.type === 'mute'
                  ? 'Muted hit'
                  : n.fret === 0
                    ? `Open, ${noteAt(n.string, 0)}`
                    : `Fret ${n.fret}${n.bendTo !== undefined ? `, bend to sound like ${n.bendTo}` : ''}, ${noteAt(n.string, n.bendTo ?? n.fret)}`}
              </Text>
            </Row>
          ))}
      </View>
      {techniques.map((t) => (
        <Body key={t} muted style={{ marginTop: space.md }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{TECHNIQUE_INFO[t].label}. </Text>
          {TECHNIQUE_INFO[t].desc}
        </Body>
      ))}
    </Panel>
  );

  const empty = (
    <Panel>
      <Body>Paste a tab {wide ? 'on the right' : 'below'} to see it on the neck.</Body>
      <Small style={{ marginTop: space.xs }}>It needs all six string lines, from e at the top to E at the bottom.</Small>
    </Panel>
  );

  const editor = (
    <>
      <SectionTitle flush={wide && !steps.length} right={<Small>Try a sample or paste your own</Small>}>
        Your Tab
      </SectionTitle>
      <Row gap={space.sm} wrap style={{ marginBottom: space.md }}>
        <Pill label="Chords" onPress={() => changeText(SAMPLE_CHORDS)} active={text === SAMPLE_CHORDS} />
        <Pill label="Techniques" onPress={() => changeText(SAMPLE_TECHNIQUES)} active={text === SAMPLE_TECHNIQUES} />
        <Pill label="Clear" onPress={() => changeText('')} />
      </Row>
      <TextInput
        value={text}
        onChangeText={changeText}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder={'e|---0---2h4---|\nB|---1---3-----|\nG|---0---2-----|\nD|---2---0-----|\nA|---3---------|\nE|-------------|'}
        placeholderTextColor={colors.textFaint}
        accessibilityLabel="Tab text"
        style={{
          fontFamily: Platform.select({ web: 'monospace', default: fonts.mono }),
          fontSize: 12.5,
          lineHeight: 19,
          color: colors.text,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: space.lg,
          minHeight: wide ? 190 : 150,
          textAlignVertical: 'top',
        }}
      />
      <Small style={{ marginTop: space.md }}>
        Reads h, p, slides, bends, releases, mutes, vibrato, taps, harmonics and ghost notes. Fingers shown are a suggestion: one finger per fret.
      </Small>
    </>
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <BackHeader title="Tab Player" onBack={() => router.back()} />

      {wide ? (
        <Columns flex={[1.5, 1]}>
          <View>{steps.length ? player : empty}</View>
          <View>
            {steps.length ? stepPanel : null}
            {editor}
          </View>
        </Columns>
      ) : (
        <>
          {steps.length ? (
            <>
              {player}
              {stepPanel}
            </>
          ) : (
            empty
          )}
          {editor}
        </>
      )}
    </Screen>
  );
}
