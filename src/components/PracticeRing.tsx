import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '@/lib/theme';

/** Progress toward the session goal, drawn like a dial. */
export default function PracticeRing({
  progress,
  big,
  caption,
  color = colors.honey,
  size = 248,
}: {
  progress: number; // 0..1+
  big: string;
  caption: string;
  color?: string;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceHigh} strokeWidth={stroke} fill="none" />
        {p > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={progress >= 1 ? colors.green : color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <Text
        style={{ fontFamily: fonts.display, color: colors.text, fontSize: size * 0.24, letterSpacing: -2, fontVariant: ['tabular-nums'] }}
        accessibilityLabel={`${big}, ${caption}`}>
        {big}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>{caption}</Text>
    </View>
  );
}
