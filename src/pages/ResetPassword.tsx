import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/brandedToast';
import { KeyRound, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 1. Check sessionStorage flag (set by AuthProvider on PASSWORD_RECOVERY)
    try {
      if (sessionStorage.getItem('password_recovery') === '1') {
        sessionStorage.removeItem('password_recovery');
        if (!cancelled) { setIsRecovery(true); setChecked(true); }
        return;
      }
    } catch {}

    // 2. Check URL hash (before Supabase strips it)
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      if (!cancelled) { setIsRecovery(true); setChecked(true); }
      return;
    }

    // 3. Listen for PASSWORD_RECOVERY event (may still fire if auth is processing)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && !cancelled) {
        sessionStorage.removeItem('password_recovery');
        setIsRecovery(true);
        setChecked(true);
      }
    });

    // 4. Fallback: if we have a valid session on /reset-password, the user
    //    arrived here via a recovery link and the event already fired.
    //    Give it a brief delay for the auth state to settle, then check.
    const fallbackTimer = setTimeout(async () => {
      if (cancelled) return;
      try {
        // Re-check sessionStorage (AuthProvider may have set it by now)
        if (sessionStorage.getItem('password_recovery') === '1') {
          sessionStorage.removeItem('password_recovery');
          if (!cancelled) { setIsRecovery(true); setChecked(true); }
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !cancelled) {
          // User has a valid session on /reset-password — show the form
          setIsRecovery(true);
        }
      } catch {}
      if (!cancelled) setChecked(true);
    }, 1500);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated!');
      navigate('/app', { replace: true });
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <KeyRound className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            {checked ? 'Recovery link expired' : 'Verifying recovery link…'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {checked
              ? 'This link may have expired or already been used. Request a new one from the sign-in page.'
              : "If you're not redirected, your link may have expired."}
          </p>
          <Button variant="outline" onClick={() => navigate('/auth')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11 rounded-full font-semibold" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
