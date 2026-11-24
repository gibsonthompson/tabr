import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fingerColors, fonts } from '@/lib/theme';
import { STANDARD_STRINGS, noteAt } from '@/lib/music/theory';
import { TECHNIQUE_INFO, type TabNote } from '@/lib/music/tabParser';

export type FretMark = { string: number; fret: number; label: string; color?: string };

type Props = {
  notes?: TabNote[];
  /** Strings that must not be played (chord shapes). Index 0 = 1st string. */
  mutedStrings?: number[];
  /** Free-form highlights (note finder, scales). */
  marks?: FretMark[];
  /** Minimum frets drawn. Grows to fit higher notes. */
  minFrets?: number;
  showNoteNames?: boolean;
};

const LABEL_W = 26;
const OPEN_W = 24;
const PAD_TOP = 22;
// Space under the neck for its side edge and the fret numbers.
const BELOW_NECK = 30;
// Past this width the drawing scales up evenly instead of stretching, so dots and labels grow with the board.
const MAX_LOGICAL_W = 440;
const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19];

/**
 * The neck as the player sees it, looking down with the 6th string nearest.
 * Perspective is built into the geometry: the far edge is narrower and the strings fan slightly.
 */
export default function Fretboard({ notes = [], mutedStrings = [], marks = [], minFrets = 12, showNoteNames = true }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  const highest = Math.max(0, ...notes.map((n) => Math.max(n.fret, n.bendTo ?? 0)), ...marks.map((m) => m.fret));
  const frets = Math.min(20, Math.max(minFrets, highest + 1));
  const lw = Math.min(width, MAX_LOGICAL_W);
  // Phones get a taller board; wider boards use a flatter ratio so the neck doesn't dominate the page.
  const height = Math.max(200, Math.round(lw * (lw >= 400 ? 0.5 : 0.56)));
  const scaleUp = width / Math.max(1, lw);

  const nutX = LABEL_W + OPEN_W;
  const endX = lw - 4;
  const top = PAD_TOP;
  // The near edge sits past the 6th string (depth 1.1); keep it and the fret numbers inside the drawing.
  const bottom = top + (height - top - BELOW_NECK) / (1.1 * (0.8 + 0.2 * 1.1));
  const cx = (nutX + endX) / 2;

  // depth: 0 = far (1st string), 1 = near (6th string)
  const depth = (s: number) => s / 5;
  const scale = (d: number) => 0.86 + 0.14 * d;
  const rowY = (d: number) => top + (bottom - top) * (d * (0.8 + 0.2 * d));
  const flatX = (f: number) => {
    if (f <= 0) return nutX;
    const pos = (1 - Math.pow(2, -f / 12)) / (1 - Math.pow(2, -frets / 12));
    return nutX + pos * (endX - nutX);
  };
  const project = (x: number, d: number) => cx + (x - cx) * scale(d);
  const pt = (x: number, d: number) => `${project(x, d)},${rowY(d)}`;
  const fretMid = (f: number) => (flatX(f - 1) + flatX(f)) / 2;
  const openX = LABEL_W + OPEN_W / 2 - 3;

  const eTop = -0.1;
  const eBot = 1.1;
  const board = [pt(nutX, eTop), pt(endX, eTop), pt(endX, eBot), pt(nutX, eBot)].join(' ');
  const sideDepth = 7;
  const side = [pt(nutX, eBot), pt(endX, eBot), `${project(endX, eBot)},${rowY(eBot) + sideDepth}`, `${project(nutX, eBot)},${rowY(eBot) + sideDepth}`].join(' ');

  const describe = notes
    .map((n) => `${STANDARD_STRINGS[n.string].num} string ${n.fret < 0 ? 'muted' : n.fret === 0 ? 'open' : `fret ${n.fret}`}`)
    .join(', ');

  return (
    <View onLayout={onLayout} accessible accessibilityRole="image" accessibilityLabel={describe ? `Fretboard: ${describe}` : 'Fretboard'}>
      {width > 0 && (
        <Svg width={width} height={height * scaleUp} viewBox={`0 0 ${lw} ${height}`}>
          <Defs>
            <LinearGradient id="board" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3A2117" />
              <Stop offset="1" stopColor="#22130E" />
            </LinearGradient>
          </Defs>

          {/* Neck side, then playing surface */}
          <Polygon points={side} fill="#3B1D14" />
          <Polygon points={board} fill="url(#board)" />

          {/* Cream binding along both edges */}
          <Line x1={project(nutX, eTop)} y1={rowY(eTop)} x2={project(endX, eTop)} y2={rowY(eTop)} stroke={colors.rosewoodEdge} strokeWidth={2} opacity={0.9} />
          <Line x1={project(nutX, eBot)} y1={rowY(eBot)} x2={project(endX, eBot)} y2={rowY(eBot)} stroke={colors.rosewoodEdge} strokeWidth={2.5} />

          {/* Trapezoid pearl inlays */}
          {[...SINGLE_INLAYS, 12].filter((f, i, a) => f <= frets && a.indexOf(f) === i).map((f) => {
            const w = (flatX(f) - flatX(f - 1)) * 0.14;
            const m = fretMid(f);
            const pts = [pt(m - w * 0.75, 0.3), pt(m + w * 0.75, 0.3), pt(m + w, 0.7), pt(m - w, 0.7)].join(' ');
            return <Polygon key={`in${f}`} points={pts} fill={colors.pearl} opacity={0.42} />;
          })}

          {/* Nickel frets */}
          {Array.from({ length: frets }, (_, i) => i + 1).map((f) => (
            <G key={`fw${f}`}>
              <Line x1={project(flatX(f), eTop)} y1={rowY(eTop)} x2={project(flatX(f), eBot)} y2={rowY(eBot)} stroke={colors.nickel} strokeWidth={2.2} opacity={0.85} />
              <Line x1={project(flatX(f), eTop) - 0.8} y1={rowY(eTop)} x2={project(flatX(f), eBot) - 0.8} y2={rowY(eBot)} stroke="#FFFFFF" strokeWidth={0.6} opacity={0.35} />
            </G>
          ))}

          {/* Bone nut */}
          <Line x1={project(nutX, eTop)} y1={rowY(eTop)} x2={project(nutX, eBot)} y2={rowY(eBot) + sideDepth} stroke={colors.bone} strokeWidth={6} strokeLinecap="round" />

          {/* Strings: plain on top, wound (textured) below */}
          {STANDARD_STRINGS.map((s, i) => {
            const d = depth(i);
            const y = rowY(d);
            const wound = i >= 3;
            const w = (0.9 + i * 0.42) * scale(d);
            const active = notes.some((n) => n.string === i) || marks.some((m) => m.string === i);
            return (
              <G key={`s${i}`} opacity={active || (!notes.length && !marks.length) ? 1 : 0.6}>
                <Line x1={project(nutX, d)} y1={y} x2={project(endX, d) + 4} y2={y} stroke={wound ? colors.woundString : colors.plainString} strokeWidth={w} />
                {wound && (
                  <Line
                    x1={project(nutX, d)}
                    y1={y}
                    x2={project(endX, d) + 4}
                    y2={y}
                    stroke="#000000"
                    strokeOpacity={0.28}
                    strokeWidth={w}
                    strokeDasharray="1,1.6"
                  />
                )}
                <SvgText x={2} y={y + 4.5} fill={active ? colors.text : colors.textFaint} fontSize={13} fontFamily={fonts.heading}>
                  {s.name}
                </SvgText>
              </G>
            );
          })}

          {/* Fret numbers */}
          {[1, 3, 5, 7, 9, 12, 15, 17, 19].filter((f) => f <= frets).map((f) => (
            <SvgText key={`fn${f}`} x={project(fretMid(f), 1)} y={rowY(eBot) + sideDepth + 15} fill={colors.textMuted} fontSize={11} fontFamily={fonts.mono} textAnchor="middle">
              {f}
            </SvgText>
          ))}

          {/* Strings to leave silent */}
          {mutedStrings.map((i) => {
            const y = rowY(depth(i));
            const r = 4.5;
            return (
              <G key={`mx${i}`}>
                <Line x1={openX - r} y1={y - r} x2={openX + r} y2={y + r} stroke={colors.stop} strokeWidth={2.4} strokeLinecap="round" />
                <Line x1={openX - r} y1={y + r} x2={openX + r} y2={y - r} stroke={colors.stop} strokeWidth={2.4} strokeLinecap="round" />
              </G>
            );
          })}

          {/* Highlights */}
          {marks.map((m, i) => {
            const d = depth(m.string);
            const x = m.fret === 0 ? openX : project(fretMid(m.fret), d);
            const y = rowY(d);
            const r = 10.5 * scale(d);
            return (
              <G key={`mk${i}`}>
                <Circle cx={x} cy={y} r={r + 2} fill={colors.rosewood} />
                <Circle cx={x} cy={y} r={r} fill={m.color ?? colors.cream} />
                <SvgText x={x} y={y + 4} fill={colors.ink} fontSize={10.5} fontFamily={fonts.display} textAnchor="middle">
                  {m.label}
                </SvgText>
              </G>
            );
          })}

          {/* Notes to play */}
          {notes.map((n, i) => {
            const d = depth(n.string);
            const y = rowY(d);
            const r = 11.5 * scale(d);
            if (n.type === 'mute' || n.fret < 0) {
              const k = 4.5;
              return (
                <G key={`n${i}`}>
                  <Line x1={openX - k} y1={y - k} x2={openX + k} y2={y + k} stroke={colors.textMuted} strokeWidth={2.4} strokeLinecap="round" />
                  <Line x1={openX - k} y1={y + k} x2={openX + k} y2={y - k} stroke={colors.textMuted} strokeWidth={2.4} strokeLinecap="round" />
                </G>
              );
            }
            const name = noteAt(n.string, n.bendTo ?? n.fret);
            if (n.fret === 0) {
              return (
                <G key={`n${i}`}>
                  <Circle cx={openX} cy={y} r={r * 0.68} fill={colors.bg} stroke={colors.cream} strokeWidth={2.2} />
                </G>
              );
            }
            const x = project(fretMid(n.fret), d);
            const finger = n.finger && n.finger > 0 ? n.finger : 1;
            const color = fingerColors[finger];
            if (n.type === 'harmonic') {
              const p = `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;
              return (
                <G key={`n${i}`}>
                  <Polygon points={p} fill={colors.rosewood} stroke={colors.cream} strokeWidth={2} />
                  <SvgText x={x} y={y + 4} fill={colors.cream} fontSize={10.5} fontFamily={fonts.display} textAnchor="middle">
                    {n.fret}
                  </SvgText>
                </G>
              );
            }
            const ghost = n.type === 'ghost';
            const bend = n.bendTo !== undefined ? bendLabel(n.bendTo - n.fret) : null;
            const tech = n.technique && n.technique !== 'bend' ? TECHNIQUE_INFO[n.technique].short : null;
            return (
              <G key={`n${i}`} opacity={ghost ? 0.55 : 1}>
                <Circle cx={x} cy={y} r={r + 2.2} fill={colors.rosewood} />
                <Circle cx={x} cy={y} r={r} fill={ghost ? colors.rosewood : color} stroke={color} strokeWidth={ghost ? 2 : 0} strokeDasharray={ghost ? '3,2.5' : undefined} />
                <SvgText x={x} y={y + 4.5} fill={ghost ? color : colors.ink} fontSize={13} fontFamily={fonts.display} textAnchor="middle">
                  {n.finger && n.finger > 0 ? n.finger : n.fret}
                </SvgText>
                {showNoteNames && (
                  <SvgText x={x} y={y - r - 4} fill={color} fontSize={9.5} fontFamily={fonts.monoBold} textAnchor="middle">
                    {name}
                  </SvgText>
                )}
                {bend && (
                  <G>
                    <Path d={`M${x + r + 3} ${y + 3} q 6 -2 7 -12`} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
                    <Path d={`M${x + r + 6.5} ${y - 9} l 3.5 -1.5 l 0.8 4`} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <SvgText x={x + r + 14} y={y - 10} fill={color} fontSize={9.5} fontFamily={fonts.monoBold}>
                      {bend}
                    </SvgText>
                  </G>
                )}
                {tech && (
                  <SvgText x={x} y={y + r + 12} fill={color} fontSize={9.5} fontFamily={fonts.monoBold} textAnchor="middle">
                    {tech}
                  </SvgText>
                )}
                {n.vibrato && (
                  <Path
                    d={`M${x + r + 3} ${y} q 2 -3 4 0 t 4 0 t 4 0`}
                    stroke={color}
                    strokeWidth={1.6}
                    fill="none"
                    strokeLinecap="round"
                  />
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
  if (semitones === 1) return '½';
  if (semitones === 2) return 'full';
  if (semitones === 3) return '1½';
  return `${semitones / 2}`;
}
