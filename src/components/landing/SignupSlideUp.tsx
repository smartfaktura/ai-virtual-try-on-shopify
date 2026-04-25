import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Check, Loader2, Mail, ArrowRight } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
      {/* Backdrop — desktop only */}
      <div
        className="hidden sm:block fixed inset-0 bg-foreground/20 backdrop-blur-[2px] pointer-events-auto animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-full sm:max-w-[460px] pointer-events-auto animate-in slide-in-from-bottom-6 fade-in duration-500">
        <div className="relative bg-card border border-border/60 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-foreground/10 overflow-hidden">
          {/* Floating close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-7 pt-8 pb-7 sm:pb-8">
            {phase === 'success' ? (
              <div className="flex flex-col items-center text-center py-4 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">You're in!</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Check your inbox for a welcome email.</p>
                </div>
              </div>
            ) : phase === 'submitting' ? (
              <div className="flex items-center gap-3 py-10 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Signing you up…</p>
              </div>
            ) : (
              <>
                {/* Eyebrow */}
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                  VOVV.AI
                </p>

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-xl font-bold tracking-tight text-foreground leading-snug">
                      Get 20 free credits
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mt-1.5">
                      AI product photography tips, new features & creative inspiration. No spam.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                      if (phase === 'error') setPhase('visible');
                    }}
                    placeholder="you@example.com"
                    className="w-full h-12 rounded-full border border-input bg-background px-5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-shadow"
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    className="w-full h-12 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {errorMsg && (
                  <p className="text-xs text-destructive mt-3 text-center">{errorMsg}</p>
                )}

                <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
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
