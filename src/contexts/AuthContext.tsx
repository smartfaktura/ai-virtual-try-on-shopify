import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { gtagSignUp } from '@/lib/gtag';
import { gtmSignUp } from '@/lib/gtm';

interface SignUpResult {
  data: { user: User | null } | null;
  error: Error | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) {
        localStorage.setItem('has_account', 'true');

        // Fire sign_up only for first-time Google OAuth users.
        // Persistent dedup in gtmSignUp (gtm:signup:{user_id}) guarantees one fire ever.
        if (_event === 'SIGNED_IN') {
          const u = session.user;
          const provider = u.app_metadata?.provider;
          const providers: string[] = u.app_metadata?.providers || [];
          const isGoogle = provider === 'google' || providers.includes('google');
          if (isGoogle && u.created_at) {
            const createdAt = new Date(u.created_at).getTime();
            const lastSignIn = u.last_sign_in_at
              ? new Date(u.last_sign_in_at).getTime()
              : createdAt;
            const ageMs = Date.now() - createdAt;
            const isFirstSignIn = Math.abs(lastSignIn - createdAt) < 60_000;
            const isFresh = ageMs < 2 * 60_000;
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.debug('[GTM] google sign_up check', {
                provider,
                providers,
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at,
                ageMs,
                isFirstSignIn,
                isFresh,
              });
            }
            if (isFirstSignIn && isFresh) {
              gtmSignUp(u.id, 'google');
            }
          }
        }
      }
    });

    // THEN check for existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('AuthProvider: getSession failed', err);
        setIsLoading(false);
      });

    // Safety timeout — never stay loading for more than 10s
    const timeout = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) console.warn('AuthProvider: safety timeout triggered');
        return false;
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/app',
        data: { display_name: displayName || email.split('@')[0] },
      },
    });
    if (!error && data?.user) {
      gtagSignUp('email');
      gtmSignUp(data.user.id, 'email');
    }
    return { data: data ? { user: data.user as User | null } : null, error: error as Error | null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
