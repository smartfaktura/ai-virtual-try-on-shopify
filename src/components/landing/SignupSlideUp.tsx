import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Phase = 'hidden' | 'visible' | 'success';

export function SignupSlideUp() {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const autoHideRef = useRef<ReturnType<typeof setTimeout>>();

  const shouldSkip = useCallback(() => {
    if (typeof window === 'undefined') return true;
    if (localStorage.getItem('has_account') === 'true') return true;
    if (localStorage.getItem('lead_captured') === 'true') return true;
    if (sessionStorage.getItem('signup_popup_dismissed') === 'true') return true;
    return false;
  }, []);

  useEffect(() => {
    if (shouldSkip()) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const pct = window.scrollY / scrollHeight;
      if (pct > 0.6) {
        setPhase('visible');
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldSkip]);

  // Auto-hide after 12s
  useEffect(() => {
    if (phase === 'visible') {
      autoHideRef.current = setTimeout(() => dismiss(), 12000);
      return () => clearTimeout(autoHideRef.current);
    }
  }, [phase]);

  const dismiss = useCallback(() => {
    setPhase('hidden');
    sessionStorage.setItem('signup_popup_dismissed', 'true');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('capture-lead', {
        body: { email: trimmed },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      localStorage.setItem('lead_captured', 'true');
      setPhase('success');
      setTimeout(() => setPhase('hidden'), 3000);
    } catch (err) {
      console.error('capture-lead error:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'hidden') return null;

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[340px] z-50 animate-in slide-in-from-bottom-4 fade-in duration-500`}
    >
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-primary/[0.03]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold tracking-tight text-primary">VOVV.AI</span>
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-4 pb-4 pt-3">
          {phase === 'success' ? (
            <div className="flex items-center gap-2 py-2">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">You're in!</p>
                <p className="text-xs text-muted-foreground">Check your inbox</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground leading-snug mb-0.5">
                Get 20 free credits
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                AI product photography — tips, new features & creative inspiration. No spam.
              </p>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={loading}
                  autoComplete="email"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Get Started'}
                </button>
              </form>

              {error && (
                <p className="text-xs text-destructive mt-1.5">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
