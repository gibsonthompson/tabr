import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { colors, fonts, radius, space } from '@/lib/theme';
import { ChordGlyph, NotesGlyph, TabGlyph, TunerGlyph } from '@/components/brand';
import { Grid2, Header, Screen, Small, useWide } from '@/components/ui';

const TOOLS: { href: Href; name: string; desc: string; glyph: ReactNode }[] = [
  { href: '/tools/tuner', name: 'Tuner', desc: 'Standard plus six alternate tunings', glyph: <TunerGlyph size={52} /> },
  { href: '/tools/chords', name: 'Chords', desc: 'Blues, rock, double stops and open shapes', glyph: <ChordGlyph size={52} /> },
  { href: '/tools/tab-player', name: 'Tab Player', desc: 'Paste a tab and step through it on the neck', glyph: <TabGlyph size={52} /> },
  { href: '/tools/notes', name: 'Note Finder', desc: 'Every spot a note lives on the neck', glyph: <NotesGlyph size={52} /> },
];

export default function Tools() {
  const wide = useWide();
  return (
    <Screen>
      <Header title="Tools" />
      <Grid2 wideCols={4} gap={wide ? space.lg : space.md}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.name}
            onPress={() => router.push(t.href)}
            accessibilityRole="button"
            accessibilityLabel={`${t.name}. ${t.desc}`}
            style={(st) => {
              const { pressed, hovered } = st as { pressed: boolean; hovered?: boolean };
              return {
              backgroundColor: hovered ? colors.surfaceHigh : colors.surface,
              borderRadius: radius.lg,
              padding: wide ? space.xl : space.lg,
              minHeight: wide ? 240 : 176,
              justifyContent: 'space-between',
              transform: [{ scale: pressed ? 0.98 : 1 }],
              };
            }}>
            <View>{t.glyph}</View>
            <View>
              <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: wide ? 24 : 21, letterSpacing: -0.4, marginBottom: 2 }}>{t.name}</Text>
              <Small>{t.desc}</Small>
            </View>
          </Pressable>
        ))}
      </Grid2>
    </Screen>
  );
}
