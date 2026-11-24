import { Pressable, Text } from 'react-native';
import { router, type Href } from 'expo-router';
import { colors, radius, space } from '@/lib/theme';
import { Grid2, Screen, Title } from '@/components/ui';

const TOOLS: { href: Href; name: string; desc: string }[] = [
  { href: '/tools/tuner', name: 'Tuner', desc: 'Standard and six alternate tunings' },
  { href: '/tools/chords', name: 'Chords', desc: 'Blues, rock and open chord shapes' },
  { href: '/tools/tab-player', name: 'Tab Player', desc: 'Paste a tab and watch it on the neck' },
  { href: '/tools/notes', name: 'Note Finder', desc: 'Every place a note lives on the neck' },
];

export default function Tools() {
  return (
    <Screen>
      <Title sub="Everything you need while you play.">Tools</Title>
      <Grid2>
        {TOOLS.map((t) => (
          <Pressable
            key={t.name}
            onPress={() => router.push(t.href)}
            accessibilityRole="button"
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: space.lg,
              minHeight: 120,
              opacity: pressed ? 0.8 : 1,
            })}>
            <Text style={{ color: colors.gold, fontSize: 18, fontWeight: '800', marginBottom: space.xs }}>{t.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{t.desc}</Text>
          </Pressable>
        ))}
      </Grid2>
    </Screen>
  );
}
