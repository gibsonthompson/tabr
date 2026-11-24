import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.gold,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tuner" options={{ title: 'Tuner' }} />
      <Stack.Screen name="chords" options={{ title: 'Chords' }} />
      <Stack.Screen name="tab-player" options={{ title: 'Tab Player' }} />
      <Stack.Screen name="notes" options={{ title: 'Note Finder' }} />
    </Stack>
  );
}
