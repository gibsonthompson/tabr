// Web layout. Desktop gets a left sidebar; narrow browser windows get a bottom tab bar.
// iPhone and Android use the native tab bar in _layout.tsx.
import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Tabs, router, usePathname, type Href } from 'expo-router';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { colors, fonts, radius, space } from '@/lib/theme';
import { Wordmark } from '@/components/brand';
import { useWide } from '@/components/ui';

type IconName = 'today' | 'learn' | 'tools' | 'songs' | 'progress';
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
type HoverState = { pressed: boolean; hovered?: boolean };

function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
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

const TABS: { name: string; href: Href; title: string; icon: IconName }[] = [
  { name: 'index', href: '/', title: 'Today', icon: 'today' },
  { name: 'learn', href: '/learn', title: 'Learn', icon: 'learn' },
  { name: 'tools', href: '/tools', title: 'Tools', icon: 'tools' },
  { name: 'songs', href: '/songs', title: 'Songs', icon: 'songs' },
  { name: 'progress', href: '/progress', title: 'Progress', icon: 'progress' },
];

const TOOL_LINKS: { href: Href; path: string; title: string }[] = [
  { href: '/tools/tuner', path: '/tools/tuner', title: 'Tuner' },
  { href: '/tools/chords', path: '/tools/chords', title: 'Chords' },
  { href: '/tools/tab-player', path: '/tools/tab-player', title: 'Tab Player' },
  { href: '/tools/notes', path: '/tools/notes', title: 'Note Finder' },
];

function NavItem({ title, icon, active, onPress }: { title: string; icon: IconName; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      style={(s) => {
        const { pressed, hovered } = s as HoverState;
        return {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          paddingVertical: 11,
          paddingHorizontal: space.md,
          borderRadius: radius.md,
          backgroundColor: active ? colors.surfaceHigh : hovered || pressed ? colors.surface : 'transparent',
        };
      }}>
      <Icon name={icon} color={active ? colors.honey : colors.textMuted} size={22} />
      <Text style={{ fontFamily: fonts.heading, fontSize: 16, color: active ? colors.text : colors.textMuted }}>{title}</Text>
    </Pressable>
  );
}

function SubItem({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      style={(s) => {
        const { hovered } = s as HoverState;
        return {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          paddingVertical: 7,
          paddingLeft: 46,
          paddingRight: space.md,
          borderRadius: radius.sm,
          backgroundColor: active ? colors.surface : hovered ? colors.surface : 'transparent',
        };
      }}>
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: active ? colors.honey : colors.textFaint }} />
      <Text style={{ fontSize: 14, fontWeight: '600', color: active ? colors.text : colors.textFaint }}>{title}</Text>
    </Pressable>
  );
}

function Sidebar({ state }: TabBarProps) {
  const pathname = usePathname();
  const { session } = useAuth();
  const [name, setName] = useState<string | null>(null);

  // Refresh on navigation so a name changed in Profile shows up here.
  useEffect(() => {
    supabase
      .from('tabr_profiles')
      .select('display_name')
      .maybeSingle()
      .then(({ data }) => setName((data as { display_name: string | null } | null)?.display_name ?? null));
  }, [pathname]);

  const activeName = state.routes[state.index]?.name;
  const email = session?.user.email ?? '';
  const letter = (name || email || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={{ width: 248, height: '100%', backgroundColor: '#180A09', borderRightWidth: 1, borderRightColor: colors.line }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: space.lg, paddingTop: space.xl }}>
        <Pressable
          onPress={() => router.navigate('/')}
          accessibilityRole="link"
          accessibilityLabel="tabr home"
          style={{ paddingHorizontal: space.sm, marginBottom: space.xxl }}>
          <Wordmark size={28} />
        </Pressable>

        <View style={{ gap: 2 }}>
          {TABS.map((t) => (
            <View key={t.name}>
              <NavItem
                title={t.title}
                icon={t.icon}
                active={activeName === t.name && (t.name !== 'tools' || pathname === '/tools')}
                onPress={() => router.navigate(t.href)}
              />
              {t.name === 'tools' ? (
                <View style={{ marginTop: 2, marginBottom: space.xs, gap: 1 }}>
                  {TOOL_LINKS.map((l) => (
                    <SubItem key={l.path} title={l.title} active={pathname === l.path} onPress={() => router.navigate(l.href)} />
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => router.push('/account')}
          accessibilityRole="link"
          accessibilityLabel="Profile and settings"
          style={(s) => {
            const { hovered } = s as HoverState;
            return {
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              padding: space.sm,
              marginTop: space.xl,
              borderRadius: radius.md,
              backgroundColor: hovered ? colors.surface : 'transparent',
            };
          }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.honey, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, color: colors.ink, fontSize: 17 }}>{letter}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 15 }} numberOfLines={1}>
              {name || 'Your Profile'}
            </Text>
            <Text style={{ color: colors.textFaint, fontSize: 12 }} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export default function TabsLayoutWeb() {
  const wide = useWide();
  return (
    <Tabs
      tabBar={wide ? (props) => <Sidebar {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? 'left' : 'bottom',
        tabBarActiveTintColor: colors.cream,
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
