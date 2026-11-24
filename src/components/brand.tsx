import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors, fingerColors, fonts } from '@/lib/theme';

/** The mark: four fingertips on a chord box, one per finger color. */
export function Mark({ size = 40 }: { size?: number }) {
  const s = size;
  const col = (i: number) => s * (0.16 + i * 0.227);
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {[0, 1, 2, 3].map((i) => (
        <Line key={`v${i}`} x1={col(i)} y1={s * 0.12} x2={col(i)} y2={s * 0.88} stroke={colors.textFaint} strokeWidth={s * 0.03} />
      ))}
      {[0.12, 0.5, 0.88].map((y) => (
        <Line key={`h${y}`} x1={col(0)} y1={s * y} x2={col(3)} y2={s * y} stroke={colors.textFaint} strokeWidth={s * 0.03} />
      ))}
      {[
        { c: 0, y: 0.31, f: 1 },
        { c: 1, y: 0.69, f: 2 },
        { c: 2, y: 0.69, f: 3 },
        { c: 3, y: 0.31, f: 4 },
      ].map((d) => (
        <Circle key={d.f} cx={col(d.c)} cy={s * d.y} r={s * 0.1} fill={fingerColors[d.f]} />
      ))}
    </Svg>
  );
}

export function Wordmark({ size = 34 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.3 }} accessibilityLabel="tabr">
      <Mark size={size * 1.1} />
      <Text style={{ fontFamily: fonts.display, fontSize: size, color: colors.text, letterSpacing: -size * 0.04, lineHeight: size * 1.1 }}>tabr</Text>
    </View>
  );
}

/* ---------- Small glyphs for tool tiles and controls ---------- */

export function TunerGlyph({ size = 44, color = colors.honey }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      <Path d="M6 30 A16 16 0 0 1 38 30" stroke={colors.textFaint} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Line x1={22} y1={30} x2={29} y2={15} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={22} cy={30} r={3.5} fill={color} />
    </Svg>
  );
}

export function ChordGlyph({ size = 44 }: { size?: number }) {
  const xs = [9, 17, 25, 33];
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {xs.map((x) => (
        <Line key={x} x1={x} y1={8} x2={x} y2={36} stroke={colors.textFaint} strokeWidth={2} />
      ))}
      {[8, 17, 26, 36].map((y) => (
        <Line key={y} x1={9} y1={y} x2={33} y2={y} stroke={colors.textFaint} strokeWidth={2} />
      ))}
      <Circle cx={17} cy={12.5} r={4} fill={fingerColors[1]} />
      <Circle cx={25} cy={21.5} r={4} fill={fingerColors[2]} />
      <Circle cx={33} cy={21.5} r={4} fill={fingerColors[3]} />
    </Svg>
  );
}

export function TabGlyph({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {[10, 17, 24, 31].map((y) => (
        <Line key={y} x1={5} y1={y} x2={39} y2={y} stroke={colors.textFaint} strokeWidth={2} />
      ))}
      <Rect x={11} y={13} width={8} height={8} rx={2} fill={colors.chrome} />
      <Rect x={24} y={20} width={8} height={8} rx={2} fill={colors.cherry} />
      <Line x1={5} y1={38} x2={21} y2={38} stroke={colors.honey} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

export function NotesGlyph({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {[9, 18, 27, 36].map((y) => (
        <Line key={y} x1={4} y1={y} x2={40} y2={y} stroke={colors.textFaint} strokeWidth={2} />
      ))}
      <Circle cx={10} cy={36} r={4} fill={colors.cream} />
      <Circle cx={24} cy={18} r={4} fill={colors.cream} />
      <Circle cx={34} cy={9} r={4} fill={colors.cream} />
    </Svg>
  );
}

export function TransportIcon({ kind, size = 26, color = colors.text }: { kind: 'play' | 'pause' | 'prev' | 'next' | 'restart'; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {kind === 'play' && <Path d="M7 4.5v15l12.5-7.5z" fill={color} />}
      {kind === 'pause' && (
        <>
          <Rect x={6} y={4.5} width={4.2} height={15} rx={1.2} fill={color} />
          <Rect x={13.8} y={4.5} width={4.2} height={15} rx={1.2} fill={color} />
        </>
      )}
      {kind === 'prev' && (
        <>
          <Rect x={5} y={5} width={2.6} height={14} rx={1} fill={color} />
          <Path d="M19 5v14L8.5 12z" fill={color} />
        </>
      )}
      {kind === 'next' && (
        <>
          <Rect x={16.4} y={5} width={2.6} height={14} rx={1} fill={color} />
          <Path d="M5 5v14l10.5-7z" fill={color} />
        </>
      )}
      {kind === 'restart' && <Path d="M12 5a7 7 0 1 1-6.6 4.7M5 4v5h5" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </Svg>
  );
}
