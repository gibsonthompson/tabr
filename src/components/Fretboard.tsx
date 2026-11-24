import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Polygon, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fingerColors } from '@/lib/theme';
import { STANDARD_STRINGS, noteAt } from '@/lib/music/theory';
import { TECHNIQUE_INFO, type TabNote } from '@/lib/music/tabParser';

export type FretMark = { string: number; fret: number; label: string; color?: string };

type Props = {
  notes?: TabNote[];
  /** Strings that must not be played (chord shapes). Index 0 = 1st string. */
  mutedStrings?: number[];
  /** Free-form highlights (note finder, scales). */
  marks?: FretMark[];
  /** Minimum number of frets drawn. Grows to fit higher notes. */
  minFrets?: number;
  showNoteNames?: boolean;
  stringLabels?: string[];
};

const LABEL_W = 34;
const OPEN_W = 22;
const PAD_TOP = 20;
const PAD_BOTTOM = 26;
const INLAYS = [3, 5, 7, 9, 15, 17, 19];

/**
 * Player's-eye fretboard: looking down at the neck with the 6th string nearest you.
 * Perspective is drawn into the geometry (the far edge is narrower), not a CSS transform.
 */
export default function Fretboard({
  notes = [],
  mutedStrings = [],
  marks = [],
  minFrets = 12,
  showNoteNames = true,
  stringLabels,
}: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  const highest = Math.max(0, ...notes.map((n) => Math.max(n.fret, n.bendTo ?? 0)), ...marks.map((m) => m.fret));
  const frets = Math.min(20, Math.max(minFrets, highest + 1));
  const height = Math.max(190, Math.round(width * 0.5));
  const labels = stringLabels ?? STANDARD_STRINGS.map((s) => s.name);

  const nutX = LABEL_W + OPEN_W;
  const endX = width - 8;
  const top = PAD_TOP;
  const bottom = height - PAD_BOTTOM;
  const cx = (nutX + endX) / 2;

  // depth: 0 = far (1st string), 1 = near (6th string)
  const depth = (s: number) => s / 5;
  const scale = (d: number) => 0.84 + 0.16 * d;
  const rowY = (d: number) => top + (bottom - top) * (d * (0.78 + 0.22 * d));
  const flatX = (f: number) => {
    if (f <= 0) return nutX;
    const pos = (1 - Math.pow(2, -f / 12)) / (1 - Math.pow(2, -frets / 12));
    return nutX + pos * (endX - nutX);
  };
  const project = (x: number, d: number) => cx + (x - cx) * scale(d);
  const pt = (x: number, d: number) => `${project(x, d)},${rowY(d)}`;
  const fretCenter = (f: number) => (flatX(f - 1) + flatX(f)) / 2;

  const edgeTop = -0.09;
  const edgeBottom = 1.09;
  const board = [pt(nutX, edgeTop), pt(endX, edgeTop), pt(endX, edgeBottom), pt(nutX, edgeBottom)].join(' ');

  const describe = notes
    .map((n) =>
      n.fret < 0 ? `${STANDARD_STRINGS[n.string].num} string muted` : `${STANDARD_STRINGS[n.string].num} string ${n.fret === 0 ? 'open' : `fret ${n.fret}`}`,
    )
    .join(', ');

  return (
    <View onLayout={onLayout} accessible accessibilityRole="image" accessibilityLabel={describe ? `Fretboard: ${describe}` : 'Fretboard'}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.wood} />
              <Stop offset="0.5" stopColor={colors.woodLight} />
              <Stop offset="1" stopColor={colors.wood} />
            </LinearGradient>
          </Defs>

          <Polygon points={board} fill="url(#wood)" />

          {/* Inlays */}
          {INLAYS.filter((f) => f <= frets).map((f) => (
            <Circle key={`in${f}`} cx={project(fretCenter(f), 0.5)} cy={rowY(0.5)} r={4} fill="#7A5A48" opacity={0.7} />
          ))}
          {frets >= 12 &&
            [0.3, 0.7].map((d) => <Circle key={`in12${d}`} cx={project(fretCenter(12), d)} cy={rowY(d)} r={4} fill="#7A5A48" opacity={0.7} />)}

          {/* Fret wires */}
          {Array.from({ length: frets }, (_, i) => i + 1).map((f) => (
            <Line
              key={`fw${f}`}
              x1={project(flatX(f), edgeTop)}
              y1={rowY(edgeTop)}
              x2={project(flatX(f), edgeBottom)}
              y2={rowY(edgeBottom)}
              stroke={colors.fretWire}
              strokeWidth={1.6}
              opacity={0.75}
            />
          ))}

          {/* Nut */}
          <Line x1={project(nutX, edgeTop)} y1={rowY(edgeTop)} x2={project(nutX, edgeBottom)} y2={rowY(edgeBottom)} stroke={colors.cream} strokeWidth={5} />

          {/* Strings + labels */}
          {STANDARD_STRINGS.map((s, i) => {
            const d = depth(i);
            const active = notes.some((n) => n.string === i) || marks.some((m) => m.string === i);
            return (
              <G key={`s${i}`}>
                <Line
                  x1={project(nutX, d)}
                  y1={rowY(d)}
                  x2={project(endX, d)}
                  y2={rowY(d)}
                  stroke={i < 3 ? colors.string : colors.stringWound}
                  strokeWidth={(0.9 + i * 0.35) * scale(d)}
                  opacity={active ? 1 : 0.55}
                />
                <SvgText x={4} y={rowY(d) + 4} fill={active ? colors.text : colors.textFaint} fontSize={12} fontWeight="700">
                  {labels[i]}
                </SvgText>
                <SvgText x={16} y={rowY(d) + 4} fill={colors.textFaint} fontSize={8}>
                  {s.num}
                </SvgText>
              </G>
            );
          })}

          {/* Fret numbers */}
          {[1, 3, 5, 7, 9, 12, 15, 17, 19].filter((f) => f <= frets).map((f) => (
            <SvgText key={`fn${f}`} x={project(fretCenter(f), 1)} y={height - 6} fill={colors.textFaint} fontSize={10} textAnchor="middle">
              {f}
            </SvgText>
          ))}

          {/* Strings that must not be played */}
          {mutedStrings.map((i) => (
            <SvgText key={`mx${i}`} x={LABEL_W + OPEN_W / 2} y={rowY(depth(i)) + 5} fill={colors.danger} fontSize={14} fontWeight="700" textAnchor="middle">
              X
            </SvgText>
          ))}

          {/* Free-form marks */}
          {marks.map((m, i) => {
            const d = depth(m.string);
            const x = m.fret === 0 ? LABEL_W + OPEN_W / 2 : project(fretCenter(m.fret), d);
            const y = rowY(d);
            const r = 9 * scale(d);
            return (
              <G key={`mk${i}`}>
                <Circle cx={x} cy={y} r={r} fill={m.color ?? colors.gold} />
                <SvgText x={x} y={y + 3.5} fill={colors.bg} fontSize={9} fontWeight="700" textAnchor="middle">
                  {m.label}
                </SvgText>
              </G>
            );
          })}

          {/* Played notes */}
          {notes.map((n, i) => {
            const d = depth(n.string);
            const y = rowY(d);
            const r = 10 * scale(d);
            if (n.type === 'mute' || n.fret < 0) {
              return (
                <SvgText key={`n${i}`} x={LABEL_W + OPEN_W / 2} y={y + 5} fill={colors.textMuted} fontSize={14} fontWeight="700" textAnchor="middle">
                  X
                </SvgText>
              );
            }
            const x = n.fret === 0 ? LABEL_W + OPEN_W / 2 : project(fretCenter(n.fret), d);
            const color = fingerColors[n.finger ?? 1] === 'transparent' ? colors.gold : fingerColors[n.finger ?? 1];
            const name = noteAt(n.string, n.bendTo ?? n.fret);

            if (n.fret === 0) {
              return (
                <G key={`n${i}`}>
                  <Circle cx={x} cy={y} r={r * 0.75} fill="none" stroke={colors.gold} strokeWidth={2} />
                  {showNoteNames && (
                    <SvgText x={x} y={y - r - 2} fill={colors.gold} fontSize={8} fontWeight="700" textAnchor="middle">
                      {name}
                    </SvgText>
                  )}
                </G>
              );
            }
            if (n.type === 'harmonic') {
              const p = `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;
              return (
                <G key={`n${i}`}>
                  <Polygon points={p} fill="rgba(237,220,177,0.25)" stroke={colors.cream} strokeWidth={1.5} />
                  <SvgText x={x} y={y + 3.5} fill={colors.cream} fontSize={9} fontWeight="700" textAnchor="middle">
                    {n.fret}
                  </SvgText>
                </G>
              );
            }
            const ghost = n.type === 'ghost';
            const bendAmount = n.bendTo !== undefined ? bendLabel(n.bendTo - n.fret) : null;
            const tech = n.technique ? TECHNIQUE_INFO[n.technique] : null;
            return (
              <G key={`n${i}`} opacity={ghost ? 0.45 : 1}>
                <Circle cx={x} cy={y} r={r + 4} fill={color} opacity={0.18} />
                <Circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={ghost ? 'none' : color}
                  stroke={color}
                  strokeWidth={ghost ? 1.5 : 0}
                  strokeDasharray={ghost ? '3,2' : undefined}
                />
                <SvgText x={x} y={y + 4} fill={ghost ? color : colors.bg} fontSize={11} fontWeight="800" textAnchor="middle">
                  {n.finger && n.finger > 0 ? n.finger : n.fret}
                </SvgText>
                {showNoteNames && (
                  <SvgText x={x} y={y - r - 3} fill={color} fontSize={8} fontWeight="700" textAnchor="middle">
                    {name}
                  </SvgText>
                )}
                {(tech || bendAmount) && (
                  <SvgText x={x} y={y + r + 10} fill={color} fontSize={8} fontWeight="700" textAnchor="middle">
                    {bendAmount ? `bend ${bendAmount}` : tech?.short}
                  </SvgText>
                )}
                {n.vibrato && (
                  <SvgText x={x + r + 3} y={y + 4} fill={color} fontSize={11}>
                    ~
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
}

function bendLabel(semitones: number): string {
  if (semitones <= 0) return '';
  if (semitones === 1) return '1/2';
  if (semitones === 2) return 'full';
  if (semitones === 3) return '1 1/2';
  return `${semitones / 2}`;
}
