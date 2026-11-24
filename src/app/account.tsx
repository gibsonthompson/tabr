import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Profile } from '@/lib/db';
import { colors, space } from '@/lib/theme';
import { Body, Button, Card, Chip, ErrorText, Field, Label, Screen } from '@/components/ui';

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const MINUTE_OPTIONS = [10, 15, 20, 30, 45, 60];

const toList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

export default function Account() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
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
        if (error) setError(error.message);
        const p = data as Profile | null;
        setProfile(p);
        setName(p?.display_name ?? '');
        setDays(p?.practice_days_per_week ?? null);
        setMinutes(p?.practice_minutes_per_session ?? null);
        setGenres((p?.preferred_genres ?? []).join(', '));
        setArtists((p?.preferred_artists ?? []).join(', '));
        setAmbitions(p?.ambitions ?? '');
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
    if (error) setError(error.message);
    else setSaved(true);
  }

  function confirmDelete() {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your tabr profile, songs, practice history and progress. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: deleteAccount },
      ],
    );
  }

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    const { error } = await supabase.functions.invoke('tabr-delete-account', { method: 'POST' });
    if (error) {
      setDeleting(false);
      setError(`Couldn't delete your account: ${error.message}`);
      return;
    }
    await supabase.auth.signOut();
  }

  if (!profile && !error) {
    return <ActivityIndicator color={colors.gold} style={{ marginTop: space.xxl }} />;
  }

  return (
    <Screen edges={['bottom']}>
      <Card>
        <Label>Signed In As</Label>
        <Body>{session?.user.email ?? ''}</Body>
      </Card>

      <Card>
        <Field label="Name" value={name} onChangeText={setName} placeholder="What should we call you?" />

        <Label>Days a Week You Can Practice</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md }}>
          {DAY_OPTIONS.map((d) => (
            <Chip key={d} label={String(d)} active={days === d} onPress={() => setDays(d)} />
          ))}
        </View>

        <Label>Minutes per Session</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md }}>
          {MINUTE_OPTIONS.map((m) => (
            <Chip key={m} label={`${m}`} active={minutes === m} onPress={() => setMinutes(m)} />
          ))}
        </View>

        <Field label="Genres You Love" value={genres} onChangeText={setGenres} placeholder="Blues, classic rock" />
        <Field label="Artists You Want to Play Like" value={artists} onChangeText={setArtists} placeholder="Stevie Ray Vaughan, AC/DC" />
        <Field
          label="What Do You Want to Be Able to Play?"
          value={ambitions}
          onChangeText={setAmbitions}
          placeholder="Solo over a 12-bar blues"
          multiline
        />

        <ErrorText>{error}</ErrorText>
        {saved ? <Body style={{ color: colors.green, marginBottom: space.md }}>Saved.</Body> : null}
        <Button title="Save Profile" onPress={save} loading={saving} />
      </Card>

      <Button title="Sign Out" kind="secondary" onPress={() => supabase.auth.signOut()} style={{ marginBottom: space.md }} />
      <Button title="Delete Account" kind="danger" onPress={confirmDelete} loading={deleting} />
    </Screen>
  );
}
