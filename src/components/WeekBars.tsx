import { Text, View } from 'react-native';
import { colors, fonts, radius, space } from '@/lib/theme';

type Day = { date: Date; minutes: number; isToday: boolean; isFuture: boolean };

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Minutes practiced each day this week. Bar height is relative to the goal (or the best day). */
export default function WeekBars({ days, goal }: { days: Day[]; goal: number | null }) {
  const top = Math.max(goal ?? 0, ...days.map((d) => d.minutes), 1);
  const H = 92;
  return (
    <View
      accessible
      accessibilityLabel={`This week: ${days.map((d) => `${d.date.toLocaleDateString(undefined, { weekday: 'long' })} ${d.minutes} minutes`).join(', ')}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: H + 20 }}>
        {days.map((d, i) => {
          const h = d.minutes > 0 ? Math.max(8, (d.minutes / top) * H) : 4;
          const met = goal ? d.minutes >= goal : d.minutes > 0;
          return (
            <View key={i} style={{ alignItems: 'center', width: '12%' }}>
              {d.minutes > 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: fonts.mono, marginBottom: 4 }}>{d.minutes}</Text>
              ) : null}
              <View
                style={{
                  width: '100%',
                  height: h,
                  borderRadius: radius.sm - 4,
                  backgroundColor: d.minutes === 0 ? colors.surfaceHigh : met ? colors.surf : colors.daphne,
                  opacity: d.isFuture ? 0.35 : 1,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm }}>
        {days.map((d, i) => (
          <View key={i} style={{ width: '12%', alignItems: 'center' }}>
            <Text style={{ color: d.isToday ? colors.text : colors.textFaint, fontSize: 13, fontWeight: d.isToday ? '800' : '600' }}>{LETTERS[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
