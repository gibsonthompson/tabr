import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, fonts, radius, space } from '@/lib/theme';
import { select, tap } from '@/lib/haptics';

/** Desktop breakpoint. At or above this width the app uses the sidebar and multi-column layouts. */
export const WIDE = 960;

export function useWide() {
  return useWindowDimensions().width >= WIDE;
}

export function Screen({
  children,
  scroll = true,
  edges,
  padded = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom')[];
  padded?: boolean;
}) {
  const wide = useWide();
  const content = [padded && styles.content, padded && wide && styles.contentWide];
  return (
    <SafeAreaView style={styles.screen} edges={edges ?? ['top']}>
      <Burst />
      {scroll ? (
        <ScrollView contentContainerStyle={content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[content, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/** Soft sunburst glow at the top of each screen: honey center fading through cherry into the dark edge. */
function Burst() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 560 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="tabr-burst" cx="50%" cy="-8%" rx="120%" ry="105%" fx="50%" fy="-8%">
            <Stop offset="0" stopColor={colors.burstCenter} stopOpacity={0.42} />
            <Stop offset="0.4" stopColor={colors.burstMid} stopOpacity={0.24} />
            <Stop offset="1" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#tabr-burst)" />
      </Svg>
    </View>
  );
}

/** Big screen title. Optional line above (date, greeting) and a right-side slot. */
export function Header({ title, kicker, right }: { title: string; kicker?: string; right?: ReactNode }) {
  const wide = useWide();
  return (
    <View style={[styles.header, wide && { marginBottom: space.xxl }]}>
      <View style={{ flex: 1 }}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header" numberOfLines={2}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

/** Title row for screens pushed onto a stack: back control above a big title. */
export function BackHeader({ title, sub, onBack }: { title: string; sub?: string; onBack: () => void }) {
  const wide = useWide();
  return (
    <View style={{ marginBottom: space.lg }}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', opacity: pressed ? 0.6 : 1, paddingVertical: 6, marginBottom: space.sm })}>
        <Svg width={10} height={16} viewBox="0 0 10 16">
          <Path d="M8 2 2 8l6 6" stroke={colors.textMuted} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '600', marginLeft: 6 }}>Tools</Text>
      </Pressable>
      <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
        {title}
      </Text>
      {sub ? <Text style={[styles.kicker, { marginTop: 4 }]}>{sub}</Text> : null}
    </View>
  );
}

/** Section heading. `flush` drops the top margin, for the first heading in a column. */
export function SectionTitle({ children, right, flush }: { children: string; right?: ReactNode; flush?: boolean }) {
  return (
    <View style={[styles.sectionRow, flush && { marginTop: 0 }]}>
      <Text style={styles.section} accessibilityRole="header">
        {children}
      </Text>
      {right}
    </View>
  );
}

export function Body({ children, muted, faint, style }: { children: ReactNode; muted?: boolean; faint?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, muted && { color: colors.textMuted }, faint && { color: colors.textFaint }, style]}>{children}</Text>;
}

export function Small({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.small, style]}>{children}</Text>;
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

type ButtonKind = 'primary' | 'secondary' | 'quiet' | 'danger';

export function Button({
  title,
  onPress,
  kind = 'primary',
  loading,
  disabled,
  style,
  size = 'lg',
}: {
  title: string;
  onPress: () => void;
  kind?: ButtonKind;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'lg' | 'sm';
}) {
  const bg = { primary: colors.cream, secondary: colors.surfaceHigh, quiet: 'transparent', danger: 'transparent' }[kind];
  const fg = { primary: colors.ink, secondary: colors.text, quiet: colors.textMuted, danger: colors.stop }[kind];
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor: bg, opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonText, size === 'sm' && { fontSize: 15 }, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

/** Pill choice. Use inside a Row or ScrollView. */
export function Pill({ label, active, onPress, color }: { label: string; active?: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={() => {
        select();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.pill,
        active && { backgroundColor: color ?? colors.cream },
        pressed && !active && { backgroundColor: colors.surfaceHigh },
      ]}>
      <Text style={[styles.pillText, active && { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** Equal-width segmented control. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => {
              select();
              onChange(o.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[styles.segment, active && { backgroundColor: colors.cream }]}>
            <Text style={[styles.segmentText, active && { color: colors.ink }]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: space.lg }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        accessibilityLabel={label}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, focused && styles.inputFocused, props.multiline && { minHeight: 96, textAlignVertical: 'top' }, props.style]}
      />
      {hint ? <Small style={{ marginTop: space.xs }}>{hint}</Small> : null}
    </View>
  );
}

export function ErrorText({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <Text style={styles.error} accessibilityLiveRegion="polite">
      {children}
    </Text>
  );
}

export function Loading() {
  return <ActivityIndicator color={colors.textMuted} style={{ marginTop: space.huge }} />;
}

/**
 * Balanced grid: `cols` per row on phones, `wideCols` on desktop.
 * Items in a short last row stretch to fill it, so nothing sits alone with empty space beside it.
 */
export function Grid({ children, cols = 2, wideCols, gap = space.md }: { children: ReactNode[]; cols?: number; wideCols?: number; gap?: number }) {
  const wide = useWide();
  const n = wide ? (wideCols ?? cols) : cols;
  const items = children.filter(Boolean);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {items.map((child, i) => (
        <View key={i} style={{ flexBasis: `${100 / n - 4}%`, flexGrow: 1, minWidth: 0 }}>
          {child}
        </View>
      ))}
    </View>
  );
}

/** Two columns. An odd last item spans the full row. */
export function Grid2({ children, gap = space.md, wideCols }: { children: ReactNode[]; gap?: number; wideCols?: number }) {
  return (
    <Grid cols={2} wideCols={wideCols} gap={gap}>
      {children}
    </Grid>
  );
}

/**
 * Side by side on desktop, stacked on phones.
 * `flex` sets each column's relative width, e.g. [3, 2].
 */
export function Columns({ children, flex = [], gap = space.xxl, style }: { children: ReactNode[]; flex?: number[]; gap?: number; style?: StyleProp<ViewStyle> }) {
  const wide = useWide();
  const items = children.filter(Boolean);
  if (!wide) {
    return (
      <View style={style}>
        {items.map((c, i) => (
          <View key={i}>{c}</View>
        ))}
      </View>
    );
  }
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', gap }, style]}>
      {items.map((c, i) => (
        <View key={i} style={{ flex: flex[i] ?? 1, minWidth: 0 }}>
          {c}
        </View>
      ))}
    </View>
  );
}

export function Row({ children, gap = space.sm, wrap, style }: { children: ReactNode; gap?: number; wrap?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>;
}

export const textStyles = StyleSheet.create({
  display: { fontFamily: fonts.display, color: colors.text, letterSpacing: -1.5 },
  heading: { fontFamily: fonts.heading, color: colors.text, letterSpacing: -0.4 },
  mono: { fontFamily: fonts.mono, color: colors.text },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.xl - 4, paddingTop: space.md, paddingBottom: space.huge * 2 },
  contentWide: { paddingHorizontal: space.huge, paddingTop: space.huge - 8, width: '100%', maxWidth: 1280, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: space.xl, gap: space.md },
  kicker: { color: colors.textMuted, fontSize: 15, marginBottom: 2 },
  title: { fontFamily: fonts.display, color: colors.text, fontSize: 40, lineHeight: 44, letterSpacing: -1.6 },
  titleWide: { fontSize: 54, lineHeight: 58, letterSpacing: -2.2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.md },
  section: { fontFamily: fonts.heading, color: colors.text, fontSize: 20, letterSpacing: -0.4 },
  body: { color: colors.text, fontSize: 16, lineHeight: 23 },
  small: { color: colors.textFaint, fontSize: 13, lineHeight: 18 },
  panel: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg + 2 },
  button: { borderRadius: radius.pill, paddingVertical: 16, paddingHorizontal: space.xl, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonSm: { paddingVertical: 9, paddingHorizontal: space.lg, minHeight: 38 },
  buttonText: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  pill: {
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 15,
    minHeight: 38,
    justifyContent: 'center',
  },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  segmented: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4 },
  segment: { flex: 1, borderRadius: radius.pill, paddingVertical: 9, alignItems: 'center', justifyContent: 'center', minHeight: 38 },
  segmentText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  fieldLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: space.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 17,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputFocused: { borderColor: colors.honey },
  error: { color: colors.stop, fontSize: 15, marginBottom: space.md, lineHeight: 21 },
});
