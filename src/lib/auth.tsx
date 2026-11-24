import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './supabase';

type AuthState = { session: Session | null; loading: boolean };

const AuthContext = createContext<AuthState>({ session: null, loading: true });

/**
 * Makes sure the signed-in user has a tabr profile row. Done here (not with a database
 * trigger) because the sign-in pool is shared with other apps in the same project.
 */
async function ensureProfile(session: Session) {
  const { error } = await supabase
    .from('tabr_profiles')
    .upsert({ user_id: session.user.id }, { onConflict: 'user_id', ignoreDuplicates: true });
  if (error) console.warn('tabr profile upsert failed', error.message);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: supabaseConfigured });

  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({ session: data.session, loading: false });
      if (data.session) ensureProfile(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, loading: false });
      if (session && event === 'SIGNED_IN') ensureProfile(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
