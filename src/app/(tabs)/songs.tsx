import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { REPERTOIRE_LABELS, type RepertoireItem, type RepertoireStatus } from '@/lib/db';
import { colors, space } from '@/lib/theme';
import { Button, Card, Chip, Empty, ErrorText, Field, Label, Screen, Title } from '@/components/ui';

const STATUSES = Object.keys(REPERTOIRE_LABELS) as RepertoireStatus[];

export default function Songs() {
  const { session } = useAuth();
  const [items, setItems] = useState<RepertoireItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [status, setStatus] = useState<RepertoireStatus>('learning');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('tabr_repertoire')
      .select('id, title, artist, status, notes, updated_at')
      .order('updated_at', { ascending: false });
    if (error) setError(error.message);
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
    const { error } = await supabase.from('tabr_repertoire').insert({
      user_id: session.user.id,
      title: title.trim(),
      artist: artist.trim() || null,
      status,
    });
    setSaving(false);
    if (error) return setError(error.message);
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
      setError(error.message);
      load();
    }
  }

  function remove(item: RepertoireItem) {
    Alert.alert('Remove this song?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('tabr_repertoire').delete().eq('id', item.id);
          if (error) setError(error.message);
          load();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Title sub="Songs you know, are learning, or want to learn.">Songs</Title>
      <ErrorText>{error}</ErrorText>

      {adding ? (
        <Card>
          <Field label="Song" value={title} onChangeText={setTitle} placeholder="Song title" autoFocus />
          <Field label="Artist" value={artist} onChangeText={setArtist} placeholder="Optional" />
          <Label>Status</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md }}>
            {STATUSES.map((s) => (
              <Chip key={s} label={REPERTOIRE_LABELS[s]} active={status === s} onPress={() => setStatus(s)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button title="Cancel" kind="secondary" onPress={() => setAdding(false)} style={{ flex: 1 }} />
            <Button title="Add Song" onPress={add} loading={saving} disabled={!title.trim()} style={{ flex: 2 }} />
          </View>
        </Card>
      ) : (
        <Button title="Add a Song" onPress={() => setAdding(true)} style={{ marginBottom: space.lg }} />
      )}

      {items === null ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: space.xl }} />
      ) : items.length === 0 && !adding ? (
        <Empty title="No songs yet" body="Add the songs you play or want to play. They will shape what you practice." />
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{item.title}</Text>
            {item.artist ? <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: space.sm }}>{item.artist}</Text> : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: space.xs }}>
              {STATUSES.map((s) => (
                <Chip key={s} label={REPERTOIRE_LABELS[s]} active={item.status === s} onPress={() => changeStatus(item, s)} />
              ))}
            </View>
            <Pressable onPress={() => remove(item)} accessibilityRole="button" style={{ alignSelf: 'flex-start', paddingVertical: space.xs }}>
              <Text style={{ color: colors.textFaint, fontSize: 13 }}>Remove</Text>
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}
