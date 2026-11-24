import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { Wordmark } from '@/components/brand';
import Fretboard from '@/components/Fretboard';
import { Body, Button, ErrorText, Field, Screen } from '@/components/ui';
import type { TabNote } from '@/lib/music/tabParser';

type Mode = 'sign-in' | 'sign-up';

// An open E7: the first chord most blues players learn.
const E7: TabNote[] = [
  { string: 0, fret: 0, finger: 0, type: 'note', technique: null, vibrato: false },
  { string: 1, fret: 0, finger: 0, type: 'note', technique: null, vibrato: false },
  { string: 2, fret: 1, finger: 1, type: 'note', technique: null, vibrato: false },
  { string: 3, fret: 0, finger: 0, type: 'note', technique: null, vibrato: false },
  { string: 4, fret: 2, finger: 2, type: 'note', technique: null, vibrato: false },
  { string: 5, fret: 0, finger: 0, type: 'note', technique: null, vibrato: false },
];

export default function SignIn() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const valid = /\S+@\S+\.\S+/.test(email.trim()) && password.length >= 8;

  async function submit() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const creds = { email: email.trim().toLowerCase(), password };
    if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword(creds);
      if (error) setError(error.message === 'Invalid login credentials' ? 'That email and password don\'t match an account.' : error.message);
    } else {
      const { data, error } = await supabase.auth.signUp(creds);
      if (error) setError(error.message);
      else if (!data.session) setNotice('Check your email to confirm your account, then sign in.');
    }
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ marginTop: space.lg }}>
          <Wordmark size={30} />
        </View>

        <Text
          style={{
            fontFamily: fonts.display,
            color: colors.text,
            fontSize: 42,
            lineHeight: 44,
            letterSpacing: -1.8,
            marginTop: space.xxl,
            marginBottom: space.md,
          }}>
          Learn the guitar you actually want to play.
        </Text>
        <Body muted>Practice that's planned around your songs, your style and how much time you have.</Body>

        <View style={{ marginVertical: space.xl, marginHorizontal: -4 }}>
          <Fretboard notes={E7} minFrets={5} />
        </View>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
          autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          placeholder="At least 8 characters"
        />

        <ErrorText>{error}</ErrorText>
        {notice ? <Body style={{ color: colors.surf, marginBottom: space.md }}>{notice}</Body> : null}

        <Button title={mode === 'sign-in' ? 'Sign In' : 'Create Account'} onPress={submit} loading={busy} disabled={!valid} />

        <Pressable
          onPress={() => {
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
            setError(null);
            setNotice(null);
          }}
          accessibilityRole="button"
          style={{ paddingVertical: space.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 15 }}>
            {mode === 'sign-in' ? 'New to tabr? ' : 'Already have an account? '}
            <Text style={{ color: colors.text, fontWeight: '700' }}>{mode === 'sign-in' ? 'Create an account' : 'Sign in'}</Text>
          </Text>
        </Pressable>
      </Screen>
    </KeyboardAvoidingView>
  );
}
