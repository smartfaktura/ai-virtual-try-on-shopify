import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, Check, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Phase = 'hidden' | 'visible' | 'submitting' | 'success' | 'error';

export function SignupSlideUp() {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
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

  // Auto-hide after 15s
  useEffect(() => {
    if (phase === 'visible') {
      autoHideRef.current = setTimeout(() => dismiss(), 15000);
      return () => clearTimeout(autoHideRef.current);
    }
  }, [phase]);

  const dismiss = useCallback(() => {
    setPhase('hidden');
    sessionStorage.setItem('signup_popup_dismissed', 'true');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Enter a valid email');
      return;
    }

    setPhase('submitting');
    clearTimeout(autoHideRef.current);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('capture-lead', {
        body: { email: trimmed },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      localStorage.setItem('lead_captured', 'true');
      setPhase('success');
      setTimeout(() => setPhase('hidden'), 4000);
    } catch (err: any) {
      console.error('capture-lead error:', err);
      setErrorMsg(
        err?.message?.includes('Too many')
          ? 'Too many attempts. Please try again later.'
          : 'Something went wrong. Please try again.'
      );
      setPhase('error');
    }
  };

  if (phase === 'hidden') return null;

  const isIdle = phase === 'visible' || phase === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
      {/* Backdrop — only on desktop centered mode */}
      <div
        className="hidden sm:block fixed inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* Card */}
      <div
        className="relative w-full sm:max-w-[420px] pointer-events-auto animate-in slide-in-from-bottom-6 fade-in duration-500"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-primary/[0.04] border-b border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold tracking-tight text-primary">VOVV.AI</span>
            </div>
            <button
              onClick={dismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 pb-5 pt-4">
            {phase === 'success' ? (
              <div className="flex items-center gap-3 py-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">You're in!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Check your inbox for a welcome email.</p>
                </div>
              </div>
            ) : phase === 'submitting' ? (
              <div className="flex items-center gap-3 py-6 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Signing you up…</p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground leading-snug">
                      Get 20 free credits
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      AI product photography tips, new features & creative inspiration. No spam.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                      if (phase === 'error') setPhase('visible');
                    }}
                    placeholder="you@example.com"
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-shadow"
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Get Started Free
                  </button>
                </form>

                {errorMsg && (
                  <p className="text-xs text-destructive mt-2 text-center">{errorMsg}</p>
                )}

                <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
                  Unsubscribe anytime. We respect your inbox.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
