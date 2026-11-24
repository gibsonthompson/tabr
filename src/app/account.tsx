import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { confirmAction } from '@/lib/confirm';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Profile } from '@/lib/db';
import { success, warn } from '@/lib/haptics';
import { colors, fonts, space } from '@/lib/theme';
import { Body, Button, Columns, ErrorText, Field, Loading, Panel, Screen, SectionTitle, Segmented, Small, useWide } from '@/components/ui';

const DAYS = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ value: d, label: String(d) }));
const MINUTES = [10, 15, 20, 30, 45, 60].map((m) => ({ value: m, label: String(m) }));

const toList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

export default function Account() {
  const { session } = useAuth();
  const wide = useWide();
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [days, setDays] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [genres, setGenres] = useState('');
  const [artists, setArtists] = useState('');
  const [ambitions, setAmbitions] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from('tabr_profiles')
      .select('*')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(`Your profile didn't load: ${error.message}`);
        const p = data as Profile | null;
        setName(p?.display_name ?? '');
        setDays(p?.practice_days_per_week ?? null);
        setMinutes(p?.practice_minutes_per_session ?? null);
        setGenres((p?.preferred_genres ?? []).join(', '));
        setArtists((p?.preferred_artists ?? []).join(', '));
        setAmbitions(p?.ambitions ?? '');
        setLoaded(true);
      });
  }, []);

  async function save() {
    if (!session) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase.from('tabr_profiles').upsert({
      user_id: session.user.id,
      display_name: name.trim() || null,
      practice_days_per_week: days,
      practice_minutes_per_session: minutes,
      preferred_genres: toList(genres),
      preferred_artists: toList(artists),
      ambitions: ambitions.trim() || null,
    });
    setSaving(false);
    if (error) setError(`Your profile didn't save: ${error.message}`);
    else {
      success();
      setSaved(true);
    }
  }

  async function confirmDelete() {
    warn();
    const ok = await confirmAction(
      'Delete your account?',
      'This permanently deletes your profile, songs, practice history and progress. It cannot be undone.',
      'Delete Account',
    );
    if (ok) deleteAccount();
  }

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    const { error } = await supabase.functions.invoke('tabr-delete-account', { method: 'POST' });
    if (error) {
      setDeleting(false);
      setError(`Your account wasn't deleted: ${error.message}. Nothing was removed, so you can try again.`);
      return;
    }
    await supabase.auth.signOut();
  }

  if (!loaded) return <Loading />;

  return (
    <Screen edges={['bottom']}>
      <View style={{ marginBottom: space.lg }}>
        <Text style={{ fontFamily: fonts.display, color: colors.text, fontSize: wide ? 44 : 30, letterSpacing: -1 }}>{name || 'Your Profile'}</Text>
        <Small style={{ color: colors.textMuted }}>{session?.user.email ?? ''}</Small>
      </View>

      <Columns flex={[1, 1]} gap={space.huge}>
        <View>
          <Field label="Name" value={name} onChangeText={setName} placeholder="What should we call you?" />

          <SectionTitle>Practice Time</SectionTitle>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: space.sm }}>Days a week</Text>
          <Segmented options={DAYS} value={days} onChange={setDays} />
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600', marginTop: space.lg, marginBottom: space.sm }}>Minutes per session</Text>
          <Segmented options={MINUTES} value={minutes} onChange={setMinutes} />
        </View>

        <View>
          <SectionTitle flush={wide}>Your Music</SectionTitle>
          <Field label="Genres you love" value={genres} onChangeText={setGenres} placeholder="Blues, classic rock" hint="Separate with commas." />
          <Field label="Players you want to sound like" value={artists} onChangeText={setArtists} placeholder="Stevie Ray Vaughan, Angus Young" />
          <Field label="What do you want to be able to play?" value={ambitions} onChangeText={setAmbitions} placeholder="Solo over a 12-bar blues" multiline />
        </View>
      </Columns>

      <ErrorText>{error}</ErrorText>
      {saved ? <Body style={{ color: colors.green, marginBottom: space.md }}>Profile saved.</Body> : null}
      <Button title="Save Profile" onPress={save} loading={saving} style={wide ? { alignSelf: 'flex-start', minWidth: 240, marginTop: space.md } : undefined} />

      <SectionTitle>Account</SectionTitle>
      <Panel style={wide ? { flexDirection: 'row', gap: space.md, alignItems: 'center' } : { gap: space.sm }}>
        <Button title="Sign Out" kind="secondary" onPress={() => supabase.auth.signOut()} style={wide ? { minWidth: 180 } : undefined} />
        <Button title="Delete Account" kind="danger" onPress={confirmDelete} loading={deleting} style={wide ? { minWidth: 180 } : undefined} />
      </Panel>
    </Screen>
  );
}
