import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors, fonts, radius } from '@/lib/theme';
import type { TuningString } from '@/lib/music/tunings';
import { select } from '@/lib/haptics';

type PegState = 'idle' | 'target' | 'good' | 'locked';

/**
 * A 3+3 headstock seen from the front. Left pegs (top to bottom): 6th, 5th, 4th string.
 * Right pegs (top to bottom): 1st, 2nd, 3rd. Tap a peg to lock the tuner to that string.
 */
export default function Headstock({
  strings,
  states,
  onPress,
}: {
  strings: TuningString[]; // index 0 = 1st string
  states: PegState[];
  onPress: (stringIdx: number) => void;
}) {
  const W = 300;
  const H = 250;
  const left = [5, 4, 3];
  const right = [0, 1, 2];
  const rowY = [48, 108, 168];

  const color = (s: PegState) => (s === 'good' ? colors.green : s === 'target' || s === 'locked' ? colors.cream : colors.surfaceHigh);
  const textColor = (s: PegState) => (s === 'idle' ? colors.text : colors.ink);

  const Peg = ({ idx, side, row }: { idx: number; side: 'l' | 'r'; row: number }) => {
    const st = states[idx];
    const s = strings[idx];
    return (
      <Pressable
        onPress={() => {
          select();
          onPress(idx);
        }}
        accessibilityRole="button"
        accessibilityLabel={`String ${idx + 1}, ${s.note}${st === 'locked' ? ', locked' : ''}`}
        accessibilityState={{ selected: st === 'locked' }}
        hitSlop={6}
        style={{
          position: 'absolute',
          top: rowY[row] - 27,
          [side === 'l' ? 'left' : 'right']: 0,
          width: 58,
          height: 54,
          borderRadius: radius.md,
          backgroundColor: color(st),
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: st === 'locked' ? 2 : 0,
          borderColor: colors.honey,
        }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: textColor(st), lineHeight: 24 }}>{s.name}</Text>
        <Text style={{ fontSize: 10, fontWeight: '700', color: st === 'idle' ? colors.textFaint : colors.ink, opacity: 0.8 }}>{idx + 1}</Text>
      </Pressable>
    );
  };

  // Headstock outline (open-book top), centered.
  const hx = W / 2;
  const outline = `M ${hx - 52} ${H} L ${hx - 62} 30 Q ${hx - 60} 6 ${hx - 34} 10 Q ${hx - 14} 14 ${hx} 4 Q ${hx + 14} 14 ${hx + 34} 10 Q ${hx + 60} 6 ${hx + 62} 30 L ${hx + 52} ${H} Z`;
  const postX = (side: 'l' | 'r') => (side === 'l' ? hx - 38 : hx + 38);
  const nutY = H - 8;
  const stringX = (i: number) => hx - 25 + (5 - i) * 10; // 6th string leftmost at the nut

  return (
    <View style={{ width: W, height: H, alignSelf: 'center' }}>
      <Svg width={W} height={H}>
        <Path d={outline} fill={colors.rosewood} stroke={colors.rosewoodEdge} strokeWidth={2} />
        {/* strings from nut to posts */}
        {left.map((idx, row) => (
          <Line key={`sl${idx}`} x1={stringX(idx)} y1={nutY} x2={postX('l')} y2={rowY[row]} stroke={states[idx] === 'idle' ? colors.woundString : colors.cream} strokeWidth={1 + (idx - 2) * 0.35} opacity={0.85} />
        ))}
        {right.map((idx, row) => (
          <Line key={`sr${idx}`} x1={stringX(idx)} y1={nutY} x2={postX('r')} y2={rowY[row]} stroke={states[idx] === 'idle' ? colors.plainString : colors.cream} strokeWidth={0.9 + idx * 0.35} opacity={0.85} />
        ))}
        {/* tuner posts */}
        {[0, 1, 2].map((row) => (
          <Circle key={`pl${row}`} cx={postX('l')} cy={rowY[row]} r={7} fill={colors.nickel} />
        ))}
        {[0, 1, 2].map((row) => (
          <Circle key={`pr${row}`} cx={postX('r')} cy={rowY[row]} r={7} fill={colors.nickel} />
        ))}
        {/* tuner shafts out to the pegs */}
        {[0, 1, 2].map((row) => (
          <Line key={`al${row}`} x1={postX('l') - 7} y1={rowY[row]} x2={62} y2={rowY[row]} stroke={colors.nickel} strokeWidth={4} opacity={0.5} />
        ))}
        {[0, 1, 2].map((row) => (
          <Line key={`ar${row}`} x1={postX('r') + 7} y1={rowY[row]} x2={W - 62} y2={rowY[row]} stroke={colors.nickel} strokeWidth={4} opacity={0.5} />
        ))}
        <Line x1={hx - 32} y1={nutY} x2={hx + 32} y2={nutY} stroke={colors.bone} strokeWidth={5} strokeLinecap="round" />
      </Svg>
      {left.map((idx, row) => (
        <Peg key={idx} idx={idx} side="l" row={row} />
      ))}
      {right.map((idx, row) => (
        <Peg key={idx} idx={idx} side="r" row={row} />
      ))}
    </View>
  );
}
