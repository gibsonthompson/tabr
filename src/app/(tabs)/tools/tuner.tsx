import { useCallback, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { TUNINGS } from '@/lib/music/tunings';
import { centsBetween, nearestNote } from '@/lib/music/pitch';
import { usePitch } from '@/lib/music/usePitch';
import { colors, radius, space } from '@/lib/theme';
import { Body, Button, Chip, Label, Screen } from '@/components/ui';

const IN_TUNE = 5;
const CLOSE = 15;

const centsColor = (c: number) => (Math.abs(c) <= IN_TUNE ? colors.green : Math.abs(c) <= CLOSE ? colors.gold : colors.cherry);

function Gauge({ cents, active }: { cents: number | null; active: boolean }) {
  const angle = cents === null ? 0 : (Math.max(-50, Math.min(50, cents)) / 50) * 60;
  const rad = (angle * Math.PI) / 180;
  const color = cents === null ? colors.textFaint : centsColor(cents);
  const arc = (from: number, to: number) => {
    const p = (a: number) => {
      const r = ((a - 90) * Math.PI) / 180;
      return `${120 + 96 * Math.cos(r)},${130 + 96 * Math.sin(r)}`;
    };
    return `M ${p(from)} A 96 96 0 0 1 ${p(to)}`;
  };
  return (
    <Svg width="100%" height={150} viewBox="0 0 240 150" accessibilityLabel={cents === null ? 'Tuner gauge' : `${cents} cents`}>
      <Path d={arc(-60, 60)} stroke={colors.surfaceRaised} strokeWidth={10} fill="none" strokeLinecap="round" />
      <Path d={arc(-6, 6)} stroke={colors.green} strokeWidth={10} fill="none" opacity={0.55} />
      {[-50, -25, 0, 25, 50].map((c) => {
        const a = ((c / 50) * 60 - 90) * (Math.PI / 180);
        return (
          <Line key={c} x1={120 + 82 * Math.cos(a)} y1={130 + 82 * Math.sin(a)} x2={120 + 74 * Math.cos(a)} y2={130 + 74 * Math.sin(a)} stroke={colors.textFaint} strokeWidth={1.5} />
        );
      })}
      {active && (
        <Line x1={120} y1={130} x2={120 + 88 * Math.sin(rad)} y2={130 - 88 * Math.cos(rad)} stroke={color} strokeWidth={3} strokeLinecap="round" />
      )}
      <Circle cx={120} cy={130} r={6} fill={color} />
      <SvgText x={20} y={146} fill={colors.textFaint} fontSize={10}>
        FLAT
      </SvgText>
      <SvgText x={188} y={146} fill={colors.textFaint} fontSize={10}>
        SHARP
      </SvgText>
    </Svg>
  );
}

export default function Tuner() {
  const { state, hz, error, start, stop } = usePitch();
  const [tuningId, setTuningId] = useState('standard');
  const [locked, setLocked] = useState<number | null>(null);
  const tuning = TUNINGS.find((t) => t.id === tuningId)!;

  // Release the microphone when leaving the screen.
  useFocusEffect(
    useCallback(() => {
      return () => {
        stop();
      };
    }, [stop]),
  );

  const reading = useMemo(() => {
    if (hz === null) return null;
    let idx = locked;
    if (idx === null) {
      let best = Infinity;
      tuning.strings.forEach((s, i) => {
        const d = Math.abs(centsBetween(hz, s.hz));
        if (d < best) {
          best = d;
          idx = i;
        }
      });
    }
    const target = tuning.strings[idx!];
    return { stringIdx: idx!, target, cents: centsBetween(hz, target.hz), heard: nearestNote(hz) };
  }, [hz, locked, tuning]);

  const listening = state === 'listening';
  const cents = reading ? Math.max(-99, Math.min(99, reading.cents)) : null;
  const instruction =
    reading === null
      ? listening
        ? 'Pluck one string and let it ring.'
        : 'Tap Start and pluck a string.'
      : Math.abs(reading.cents) <= IN_TUNE
        ? 'In tune'
        : reading.cents < 0
          ? `Tighten: tune up ${Math.abs(reading.cents)} cents`
          : `Loosen: tune down ${reading.cents} cents`;

  return (
    <Screen edges={['bottom']}>
      <Label>Tuning</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.xs }}>
        {TUNINGS.map((t) => (
          <Chip
            key={t.id}
            label={t.name}
            active={t.id === tuningId}
            onPress={() => {
              setTuningId(t.id);
              setLocked(null);
            }}
          />
        ))}
      </ScrollView>
      <Body muted style={{ marginBottom: space.lg }}>
        {tuning.notesLowToHigh}. {tuning.desc}
      </Body>

      <Label>{locked === null ? 'Strings (auto detect)' : 'Strings (locked, tap again for auto)'}</Label>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.lg }}>
        {[...tuning.strings].reverse().map((s, ri) => {
          const i = tuning.strings.length - 1 - ri; // show 6th string first, like the headstock left to right
          const isTarget = reading?.stringIdx === i;
          const good = isTarget && Math.abs(reading!.cents) <= IN_TUNE;
          const isLocked = locked === i;
          return (
            <Pressable
              key={i}
              onPress={() => setLocked(isLocked ? null : i)}
              accessibilityRole="button"
              accessibilityLabel={`String ${6 - ri}, ${s.note}`}
              accessibilityState={{ selected: isLocked }}
              style={{
                width: '15.5%',
                alignItems: 'center',
                paddingVertical: space.sm,
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: good ? colors.green : isTarget || isLocked ? colors.gold : colors.border,
                backgroundColor: good ? 'rgba(143,188,68,0.15)' : isTarget || isLocked ? 'rgba(212,175,55,0.12)' : colors.surface,
              }}>
              <Text style={{ color: good ? colors.green : isTarget || isLocked ? colors.gold : colors.text, fontSize: 17, fontWeight: '800' }}>{s.name}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 9 }}>{6 - ri}</Text>
            </Pressable>
          );
        })}
      </View>

      <Gauge cents={cents} active={listening && cents !== null} />

      <View style={{ alignItems: 'center', minHeight: 110, marginTop: space.sm }}>
        {reading ? (
          <>
            <Text style={{ color: centsColor(reading.cents), fontSize: 52, fontWeight: '900' }}>
              {reading.heard.name}
              <Text style={{ fontSize: 22, opacity: 0.6 }}>{reading.heard.octave}</Text>
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {hz!.toFixed(1)} Hz, target {reading.target.note} ({reading.target.hz} Hz)
            </Text>
          </>
        ) : null}
        <Text
          style={{ color: reading ? centsColor(reading.cents) : colors.textMuted, fontSize: 16, fontWeight: '700', marginTop: space.sm }}
          accessibilityLiveRegion="polite">
          {instruction}
        </Text>
      </View>

      {state === 'denied' ? (
        <View style={{ marginTop: space.md }}>
          <Body muted style={{ marginBottom: space.md, textAlign: 'center' }}>
            Microphone access is off. Turn it on in Settings so the tuner can hear your guitar.
          </Body>
          <Button title="Open Settings" kind="secondary" onPress={() => Linking.openSettings()} />
        </View>
      ) : (
        <Button
          title={listening ? 'Stop' : 'Start Tuner'}
          kind={listening ? 'secondary' : 'primary'}
          loading={state === 'starting'}
          onPress={listening ? stop : start}
          style={{ marginTop: space.md }}
        />
      )}
      {error ? <Text style={{ color: colors.danger, marginTop: space.md, textAlign: 'center' }}>{error}</Text> : null}
      <Body muted style={{ marginTop: space.lg, textAlign: 'center', fontSize: 12 }}>
        Sound is analyzed on your phone and never recorded or uploaded.
      </Body>
    </Screen>
  );
}
