import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { TUNINGS } from '@/lib/music/tunings';
import { centsBetween, nearestNote } from '@/lib/music/pitch';
import { usePitch } from '@/lib/music/usePitch';
import { success } from '@/lib/haptics';
import { colors, fonts, space } from '@/lib/theme';
import Headstock from '@/components/Headstock';
import { BackHeader, Body, Button, Columns, Panel, Pill, Row, Screen, Small, useWide } from '@/components/ui';

const IN_TUNE = 5;
const CLOSE = 15;
const statusColor = (c: number) => (Math.abs(c) <= IN_TUNE ? colors.green : Math.abs(c) <= CLOSE ? colors.honey : colors.cherry);

/** A strobe-style strip: 21 ticks from -50 to +50 cents. */
function CentsMeter({ cents }: { cents: number | null }) {
  const ticks = Array.from({ length: 21 }, (_, i) => -50 + i * 5);
  const nearest = cents === null ? null : Math.round(Math.max(-50, Math.min(50, cents)) / 5) * 5;
  return (
    <View style={{ marginVertical: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 44 }}>
        {ticks.map((t) => {
          const center = t === 0;
          const lit = nearest !== null && (nearest === t || (Math.abs(nearest - t) === 5 && Math.abs(t) > 0 && Math.sign(t) === Math.sign(nearest)));
          const hot = nearest === t;
          return (
            <View
              key={t}
              style={{
                width: center ? 5 : 3,
                height: center ? 44 : t % 25 === 0 ? 30 : 20,
                borderRadius: 2,
                backgroundColor: hot && cents !== null ? statusColor(cents) : lit && cents !== null ? statusColor(cents) : center ? colors.textFaint : colors.surfaceHigh,
                opacity: lit && !hot ? 0.45 : 1,
              }}
            />
          );
        })}
      </View>
      <Row style={{ justifyContent: 'space-between', marginTop: space.sm }}>
        <Small>Flat</Small>
        <Small>Sharp</Small>
      </Row>
    </View>
  );
}

export default function Tuner() {
  const { state, hz, error, start, stop } = usePitch();
  const wide = useWide();
  const [tuningId, setTuningId] = useState('standard');
  const [locked, setLocked] = useState<number | null>(null);
  const tuning = TUNINGS.find((t) => t.id === tuningId)!;

  useFocusEffect(
    useCallback(() => {
      return () => {
        stop();
      };
    }, [stop]),
  );

  const reading = useMemo(() => {
    if (hz === null) return null;
    let idx = locked ?? 0;
    if (locked === null) {
      let best = Infinity;
      tuning.strings.forEach((s, i) => {
        const d = Math.abs(centsBetween(hz, s.hz));
        if (d < best) {
          best = d;
          idx = i;
        }
      });
    }
    const target = tuning.strings[idx];
    return { idx, target, cents: centsBetween(hz, target.hz), heard: nearestNote(hz) };
  }, [hz, locked, tuning]);

  const inTune = !!reading && Math.abs(reading.cents) <= IN_TUNE;
  const wasInTune = useRef(false);
  useEffect(() => {
    if (inTune && !wasInTune.current) success();
    wasInTune.current = inTune;
  }, [inTune]);

  const listening = state === 'listening';
  const states = tuning.strings.map((_, i) => {
    if (reading?.idx === i) return inTune ? ('good' as const) : ('target' as const);
    if (locked === i) return 'locked' as const;
    return 'idle' as const;
  });

  const instruction = !listening
    ? 'Tap Start, then pluck a string'
    : !reading
      ? 'Pluck one string and let it ring'
      : inTune
        ? 'In tune'
        : reading.cents < 0
          ? 'Too low, tighten the string'
          : 'Too high, loosen the string';

  const pills = TUNINGS.map((t) => (
    <Pill
      key={t.id}
      label={t.name}
      active={t.id === tuningId}
      onPress={() => {
        setTuningId(t.id);
        setLocked(null);
      }}
    />
  ));

  const readout = (
    <>
      <View style={{ alignItems: 'center', marginTop: space.xl, height: wide ? 190 : 150, justifyContent: 'center' }}>
        {reading ? (
          <>
            <Text
              style={{ fontFamily: fonts.display, fontSize: wide ? 150 : 112, lineHeight: wide ? 156 : 118, letterSpacing: -4, color: statusColor(reading.cents) }}
              accessibilityLabel={`Hearing ${reading.heard.name}${reading.heard.octave}`}>
              {reading.heard.name}
            </Text>
            <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 13 }}>
              {`${hz!.toFixed(1)} Hz, ${reading.cents > 0 ? '+' : ''}${reading.cents} cents from ${reading.target.note}`}
            </Text>
          </>
        ) : (
          <Text
            style={{ fontFamily: fonts.display, fontSize: wide ? 52 : 40, letterSpacing: 2, color: listening ? colors.textMuted : colors.textFaint, textAlign: 'center' }}
            accessibilityLabel={`${tuning.name}: ${tuning.notesLowToHigh}`}>
            {tuning.notesLowToHigh}
          </Text>
        )}
      </View>

      <CentsMeter cents={reading ? reading.cents : null} />

      <Text
        style={{ fontFamily: fonts.heading, fontSize: 20, textAlign: 'center', color: reading ? statusColor(reading.cents) : colors.textFaint, marginBottom: space.xl }}
        accessibilityLiveRegion="polite">
        {instruction}
      </Text>
    </>
  );

  const headstock = (
    <>
      <Headstock strings={tuning.strings} states={states} onPress={(i) => setLocked(locked === i ? null : i)} />
      <Small style={{ textAlign: 'center', marginTop: space.md }}>
        {locked === null ? 'Detects the string automatically. Tap a peg to lock one.' : `Locked to string ${locked + 1}. Tap it again to go back to automatic.`}
      </Small>
    </>
  );

  const controls = (
    <>
      {state === 'denied' ? (
        <View style={{ marginTop: space.xl }}>
          <Body muted style={{ textAlign: 'center', marginBottom: space.md }}>
            {Platform.OS === 'web'
              ? 'Microphone access is blocked. Allow it from the icon in your browser\'s address bar, then press Try Again.'
              : 'Microphone access is off. Turn it on in Settings so the tuner can hear your guitar.'}
          </Body>
          {Platform.OS === 'web' ? (
            <Button title="Try Again" kind="secondary" onPress={start} />
          ) : (
            <Button title="Open Settings" kind="secondary" onPress={() => Linking.openSettings()} />
          )}
        </View>
      ) : (
        <Button
          title={listening ? 'Stop Tuner' : 'Start Tuner'}
          kind={listening ? 'secondary' : 'primary'}
          loading={state === 'starting'}
          onPress={listening ? stop : start}
          style={{ marginTop: wide ? 0 : space.xl }}
        />
      )}
      {error ? <Body style={{ color: colors.stop, textAlign: 'center', marginTop: space.md }}>{error}</Body> : null}
      <Small style={{ textAlign: 'center', marginTop: space.lg }}>Sound is analyzed on your device. Nothing is recorded.</Small>
    </>
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <BackHeader title="Tuner" sub={`${tuning.name}: ${tuning.notesLowToHigh}`} onBack={() => router.back()} />

      {wide ? (
        <Row gap={space.sm} wrap>
          {pills}
        </Row>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {pills}
        </ScrollView>
      )}

      {wide ? (
        <Columns flex={[1.3, 1]} style={{ marginTop: space.lg }}>
          <Panel style={{ padding: space.xl }}>
            {readout}
            {controls}
          </Panel>
          <Panel style={{ padding: space.xl, paddingVertical: space.xxl }}>{headstock}</Panel>
        </Columns>
      ) : (
        <>
          {readout}
          {headstock}
          {controls}
        </>
      )}
    </Screen>
  );
}
