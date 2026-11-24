import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/lib/theme';

export function Screen({ children, scroll = true, edges }: { children: ReactNode; scroll?: boolean; edges?: ('top' | 'bottom')[] }) {
  return (
    <SafeAreaView style={styles.screen} edges={edges ?? ['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children, sub }: { children: string; sub?: string }) {
  return (
    <View style={{ marginBottom: space.lg }}>
      <Text style={styles.title} accessibilityRole="header">
        {children}
      </Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

export function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  return <Text style={[styles.body, muted && { color: colors.textMuted }, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  kind = 'primary',
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const bg = kind === 'primary' ? colors.gold : kind === 'danger' ? 'transparent' : colors.surfaceRaised;
  const fg = kind === 'primary' ? colors.bg : kind === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        kind === 'danger' && { borderWidth: 1, borderColor: colors.danger },
        kind === 'secondary' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, active && { backgroundColor: 'rgba(212,175,55,0.16)', borderColor: colors.borderStrong }]}>
      <Text style={[styles.chipText, active && { color: colors.gold }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Label>{label}</Label>
      <TextInput placeholderTextColor={colors.textFaint} style={styles.input} accessibilityLabel={label} {...props} />
    </View>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
      <Text style={[styles.body, { fontWeight: '700', marginBottom: space.xs }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textMuted, textAlign: 'center' }]}>{body}</Text>
    </Card>
  );
}

export function ErrorText({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <Text style={{ color: colors.danger, marginBottom: space.md }} accessibilityLiveRegion="polite">
      {children}
    </Text>
  );
}

/** Two-column grid. An odd last item spans the full row so no row has a lone half-width item. */
export function Grid2({ children }: { children: ReactNode[] }) {
  const items = children.filter(Boolean);
  return (
    <View style={styles.grid}>
      {items.map((child, i) => {
        const lastOdd = items.length % 2 === 1 && i === items.length - 1;
        return (
          <View key={i} style={lastOdd ? { width: '100%' } : { width: '48.5%' }}>
            {child}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl * 2 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: space.xs, lineHeight: 20 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: space.sm },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    marginBottom: space.md,
  },
  button: { borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: space.lg, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: space.sm,
    marginBottom: space.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    minHeight: 48,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md },
});
