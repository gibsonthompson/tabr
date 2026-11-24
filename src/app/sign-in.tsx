import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';
import { Body, Button, ErrorText, Field, Screen } from '@/components/ui';

type Mode = 'sign-in' | 'sign-up';

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
      if (error) setError(error.message);
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
        <View style={{ marginTop: space.xxl * 1.5, marginBottom: space.xl }}>
          <Text style={{ color: colors.gold, fontSize: 44, fontWeight: '900', letterSpacing: -1 }}>tabr</Text>
          <Body muted>Your guitar practice, planned around you.</Body>
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
        {notice ? <Body style={{ color: colors.green, marginBottom: space.md }}>{notice}</Body> : null}

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
            {mode === 'sign-in' ? 'New here? ' : 'Already have an account? '}
            <Text style={{ color: colors.gold, fontWeight: '700' }}>{mode === 'sign-in' ? 'Create an account' : 'Sign in'}</Text>
          </Text>
        </Pressable>
      </Screen>
    </KeyboardAvoidingView>
  );
}
