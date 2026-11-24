// Browser preview only. iPhone and Android use the native tab bar in _layout.tsx.
import { Tabs } from 'expo-router';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '@/lib/theme';

type IconName = 'today' | 'learn' | 'tools' | 'songs' | 'progress';

function Icon({ name, color }: { name: IconName; color: string }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {name === 'today' && (
        <>
          <Circle cx={12} cy={12} r={4.5} {...p} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            return <Line key={a} x1={12 + 7.5 * Math.cos(r)} y1={12 + 7.5 * Math.sin(r)} x2={12 + 9.5 * Math.cos(r)} y2={12 + 9.5 * Math.sin(r)} {...p} />;
          })}
        </>
      )}
      {name === 'learn' && <Path d="M4 5.5c3-1 5.5-1 8 .8 2.5-1.8 5-1.8 8-.8V19c-3-1-5.5-1-8 .8-2.5-1.8-5-1.8-8-.8z M12 6.3V19.8" {...p} />}
      {name === 'tools' && <Path d="M4 16a8 8 0 0 1 16 0 M12 16l4-6" {...p} />}
      {name === 'songs' && <Path d="M9 18V6l10-2v12 M9 18a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 9 18zM19 16a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 19 16z" {...p} />}
      {name === 'progress' && (
        <>
          <Rect x={4} y={13} width={3.5} height={7} rx={1} {...p} />
          <Rect x={10.25} y={8} width={3.5} height={12} rx={1} {...p} />
          <Rect x={16.5} y={4} width={3.5} height={16} rx={1} {...p} />
        </>
      )}
    </Svg>
  );
}

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Today', icon: 'today' },
  { name: 'learn', title: 'Learn', icon: 'learn' },
  { name: 'tools', title: 'Tools', icon: 'tools' },
  { name: 'songs', title: 'Songs', icon: 'songs' },
  { name: 'progress', title: 'Progress', icon: 'progress' },
];

export default function TabsLayoutWeb() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.olympic,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color }) => <Icon name={t.icon} color={String(color)} /> }} />
      ))}
    </Tabs>
  );
}
