import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { confirmAction } from '@/lib/confirm';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { REPERTOIRE_LABELS, type RepertoireItem, type RepertoireStatus } from '@/lib/db';
import { select } from '@/lib/haptics';
import { colors, fonts, radius, space } from '@/lib/theme';
import { Body, Button, Columns, ErrorText, Field, Header, Loading, Panel, Pill, Row, Screen, SectionTitle, Small, useWide } from '@/components/ui';

const ORDER: RepertoireStatus[] = ['learning', 'want_to_learn', 'can_play', 'performance_ready'];
const STATUS_COLOR: Record<RepertoireStatus, string> = {
  want_to_learn: colors.honey,
  learning: colors.chrome,
  can_play: colors.cherry,
  performance_ready: colors.green,
};

type RowProps = {
  item: RepertoireItem;
  first: boolean;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: RepertoireStatus) => void;
  onRemove: () => void;
};

function SongRow({ item, first, expanded, onToggle, onStatus, onRemove }: RowProps) {
  return (
    <View style={{ borderTopWidth: first ? 0 : 1, borderTopColor: colors.line }}>
      <Pressable
        onPress={() => {
          select();
          onToggle();
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={(st) => {
          const { pressed, hovered } = st as { pressed: boolean; hovered?: boolean };
          return {
            flexDirection: 'row',
            alignItems: 'center',
            padding: space.lg,
            gap: space.md,
            backgroundColor: pressed || hovered ? colors.surfaceHigh : 'transparent',
          };
        }}>
        <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: STATUS_COLOR[item.status] }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 18 }} numberOfLines={1}>
            {item.title}
          </Text>
          {item.artist ? <Small style={{ color: colors.textMuted }}>{item.artist}</Small> : null}
        </View>
        <Text style={{ color: colors.textFaint, fontSize: 20 }}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded ? (
        <View style={{ paddingHorizontal: space.lg, paddingBottom: space.lg }}>
          <Row gap={space.sm} wrap>
            {ORDER.map((s) => (
              <Pill key={s} label={REPERTOIRE_LABELS[s]} active={item.status === s} color={STATUS_COLOR[s]} onPress={() => onStatus(s)} />
            ))}
          </Row>
          <Pressable onPress={onRemove} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginTop: space.md, paddingVertical: 4 }}>
            <Text style={{ color: colors.stop, fontSize: 15, fontWeight: '600' }}>Remove song</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function Songs() {
  const { session } = useAuth();
  const wide = useWide();
  const [items, setItems] = useState<RepertoireItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [status, setStatus] = useState<RepertoireStatus>('learning');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('tabr_repertoire')
      .select('id, title, artist, status, notes, updated_at')
      .order('updated_at', { ascending: false });
    if (error) setError(`Your songs didn't load: ${error.message}`);
    setItems((data as RepertoireItem[]) ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function add() {
    if (!session || !title.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('tabr_repertoire').insert({ user_id: session.user.id, title: title.trim(), artist: artist.trim() || null, status });
    setSaving(false);
    if (error) return setError(`That song didn't save: ${error.message}`);
    setTitle('');
    setArtist('');
    setStatus('learning');
    setAdding(false);
    load();
  }

  async function changeStatus(item: RepertoireItem, next: RepertoireStatus) {
    setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, status: next } : i)) ?? null);
    const { error } = await supabase.from('tabr_repertoire').update({ status: next }).eq('id', item.id);
    if (error) {
      setError(`Status didn't save: ${error.message}`);
      load();
    }
  }

  async function remove(item: RepertoireItem) {
    if (!(await confirmAction(`Remove ${item.title}?`, 'It will be taken off your song list.', 'Remove'))) return;
    setOpen(null);
    const { error } = await supabase.from('tabr_repertoire').delete().eq('id', item.id);
    if (error) setError(`It wasn't removed: ${error.message}`);
    load();
  }

  const groups = ORDER.map((s) => ({ status: s, list: (items ?? []).filter((i) => i.status === s) })).filter((g) => g.list.length);

  return (
    <Screen>
      <Header
        title="Songs"
        right={!adding ? <Button title="Add Song" size="sm" onPress={() => setAdding(true)} style={{ marginBottom: 6 }} /> : undefined}
      />
      <ErrorText>{error}</ErrorText>

      {adding ? (
        <Panel style={{ marginBottom: space.lg }}>
          <Columns flex={[1, 1]} gap={space.lg}>
            <Field label="Song" value={title} onChangeText={setTitle} placeholder="Pride and Joy" autoFocus />
            <Field label="Artist" value={artist} onChangeText={setArtist} placeholder="Stevie Ray Vaughan" />
          </Columns>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: space.sm }}>{"Where you're at"}</Text>
          <Row gap={space.sm} wrap style={{ marginBottom: space.lg }}>
            {ORDER.map((s) => (
              <Pill key={s} label={REPERTOIRE_LABELS[s]} active={status === s} color={STATUS_COLOR[s]} onPress={() => setStatus(s)} />
            ))}
          </Row>
          <Row gap={space.sm} style={wide ? { justifyContent: 'flex-end' } : undefined}>
            <Button title="Cancel" kind="secondary" onPress={() => setAdding(false)} style={wide ? { minWidth: 140 } : { flex: 1 }} />
            <Button title="Add Song" onPress={add} loading={saving} disabled={!title.trim()} style={wide ? { minWidth: 200 } : { flex: 1.6 }} />
          </Row>
        </Panel>
      ) : null}

      {items === null ? (
        <Loading />
      ) : items.length === 0 && !adding ? (
        <Panel>
          <Text style={{ fontFamily: fonts.heading, color: colors.text, fontSize: 22, letterSpacing: -0.4, marginBottom: space.sm }}>Start your song list</Text>
          <Body muted style={{ marginBottom: space.lg }}>
            {"Add the songs you can play and the ones you're chasing. Your list will shape what you practice."}
          </Body>
          <Button title="Add Your First Song" onPress={() => setAdding(true)} />
        </Panel>
      ) : wide ? (
        <View style={{ flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' }}>
          {ORDER.map((status) => {
            const list = (items ?? []).filter((i) => i.status === status);
            return (
              <View key={status} style={{ flex: 1, minWidth: 0 }}>
                <SectionTitle flush right={<Small>{list.length}</Small>}>
                  {REPERTOIRE_LABELS[status]}
                </SectionTitle>
                <View style={{ height: 3, borderRadius: 2, backgroundColor: STATUS_COLOR[status], marginBottom: space.md, opacity: 0.8 }} />
                {list.length ? (
                  <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
                    {list.map((item, i) => (
                      <SongRow
                        key={item.id}
                        item={item}
                        first={i === 0}
                        expanded={open === item.id}
                        onToggle={() => setOpen(open === item.id ? null : item.id)}
                        onStatus={(s) => changeStatus(item, s)}
                        onRemove={() => remove(item)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.surfaceHigh, borderRadius: radius.lg, padding: space.lg }}>
                    <Small>Nothing here yet.</Small>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        groups.map((g) => (
          <View key={g.status}>
            <SectionTitle right={<Small>{g.list.length}</Small>}>{REPERTOIRE_LABELS[g.status]}</SectionTitle>
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
              {g.list.map((item, i) => (
                <SongRow
                  key={item.id}
                  item={item}
                  first={i === 0}
                  expanded={open === item.id}
                  onToggle={() => setOpen(open === item.id ? null : item.id)}
                  onStatus={(s) => changeStatus(item, s)}
                  onRemove={() => remove(item)}
                />
              ))}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}
