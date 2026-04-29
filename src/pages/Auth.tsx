import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { TermsContent } from '@/components/legal/TermsContent';
import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { toast } from '@/lib/brandedToast';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, ArrowLeft, MailCheck, Mail, AlertCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { AuthHeroGallery } from '@/components/app/AuthHeroGallery';
import { BrandLoaderProgressGlyph } from '@/components/ui/brand-loader-progress-glyph';
import { mapAuthError } from '@/lib/authErrors';

export default function Auth() {
  const navigate = useNavigate();
  const { signUp, signIn, user, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(() => localStorage.getItem('has_account') === 'true' ? 'login' : 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);

  const COOLDOWN_SECONDS = 60;
  const cooldownKey = (email: string) => `vovv_reset_sent_at:${email.trim().toLowerCase()}`;

  const startResetCooldown = (email: string, fromTimestamp?: number) => {
    const sentAt = fromTimestamp ?? Date.now();
    try { sessionStorage.setItem(cooldownKey(email), String(sentAt)); } catch {}
    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    setResetCooldown(Math.max(0, COOLDOWN_SECONDS - elapsed));
  };

  // Tick cooldown
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const t = setInterval(() => setResetCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [resetCooldown]);

  // Restore cooldown when re-opening success panel for this email
  useEffect(() => {
    if (!resetSent || !resetEmail) return;
    try {
      const raw = sessionStorage.getItem(cooldownKey(resetEmail));
      if (raw) {
        const sentAt = parseInt(raw, 10);
        if (!Number.isNaN(sentAt)) {
          const remaining = COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000);
          if (remaining > 0) setResetCooldown(remaining);
        }
      }
    } catch {}
  }, [resetSent, resetEmail]);

  const sendResetEmail = async (email: string): Promise<boolean> => {
    setResetLoading(true);
    setResetError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setResetLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        setResetError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setResetError('Could not send reset link. Please try again.');
      }
      return false;
    }
    return true;
  };
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; terms?: string }>({});
  const [signupComplete, setSignupComplete] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (!signupComplete && !magicLinkSent) return;
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [signupComplete, magicLinkSent]);

  if (isLoading) {
    return <BrandLoaderProgressGlyph fullScreen />;
  }

  if (user) return null;

  const validate = () => {
    const errs: { email?: string; password?: string; confirmPassword?: string; terms?: string } = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (mode === 'signup') {
      if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
      else if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match';
      if (!termsAccepted) errs.terms = 'You must accept the Terms of Service and Privacy Policy';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    setFormError(null);

    if (mode === 'signup') {
      const { data, error } = await signUp(email, password, displayName);
      if (error) {
        const mapped = mapAuthError(error, 'signup');
        setFormError(mapped.message);
        if (mapped.switchToLogin) {
          setMode('login');
          // Clear password fields so the user enters their existing-account password
          setPassword('');
          setConfirmPassword('');
        } else if (mapped.rateLimited) {
          setSignupComplete(true);
        }
      } else if (!data?.user?.identities?.length) {
        setFormError('An account with this email already exists. Sign in below — if you forgot your password, use Reset.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else if (data?.user && !data.user.confirmed_at) {
        // Save marketing preference after profile is auto-created
        if (data.user.id) {
          supabase.from('profiles').update({ marketing_emails_opted_in: marketingOptIn }).eq('user_id', data.user.id).then(() => {});
          // Sync to Resend audience (fire-and-forget)
          supabase.functions.invoke('sync-resend-contact', {
            body: {
              email,
              user_id: data.user.id,
              first_name: displayName || email.split('@')[0],
              opted_in: marketingOptIn,
              properties: {
                plan: 'free',
                credits_balance: 20,
                has_generated: false,
                signup_date: new Date().toISOString(),
              },
            },
          }).catch(() => {});
        }
        // Signup already sends a confirmation email — do NOT resend here
        setSignupComplete(true);
      } else {
        if (data?.user?.id) {
          supabase.from('profiles').update({ marketing_emails_opted_in: marketingOptIn }).eq('user_id', data.user.id).then(() => {});
          supabase.functions.invoke('sync-resend-contact', {
            body: {
              email,
              user_id: data.user.id,
              first_name: displayName || email.split('@')[0],
              opted_in: marketingOptIn,
              properties: {
                plan: 'free',
                credits_balance: 20,
                has_generated: false,
                signup_date: new Date().toISOString(),
              },
            },
          }).catch(() => {});
        }
        setSignupComplete(true);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        const mapped = mapAuthError(error, 'login');
        setFormError(mapped.message);
      } else {
        navigate('/app', { replace: true });
      }
    }

    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Enter your email to get a sign-in link' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }
    setErrors({});
    setMagicLinkLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/app' },
    });
    setMagicLinkLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        setFormError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setFormError('Could not send sign-in link. Please try again.');
      }
    } else {
      setFormError(null);
      setMagicLinkSent(true);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    if (code.length !== 6) return;
    setOtpLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });
    setOtpLoading(false);
    if (error) {
      toast.error('Invalid or expired code. Please try again.');
      setOtpCode('');
    } else {
      toast.success('Email confirmed! Redirecting...');
      navigate('/app', { replace: true });
    }
  };

  const handleResendSignup = async () => {
    setResendLoading(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setResendLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        toast.info('Email already sent. Check your inbox and spam folder, or wait a few minutes.');
      } else {
      toast.error('Could not resend email. Please try again.');
      }
    } else {
      toast.success('New code sent! Check your inbox.');
    }
    setResendTimer(60);
  };

  const handleResendMagicLink = async () => {
    setResendLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/app' },
    });
    setResendLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        toast.info('Email already sent. Check your inbox and spam folder, or wait a few minutes.');
      } else {
        toast.error('Could not resend link. Please try again.');
      }
    } else {
      setResendTimer(60);
      toast.success('New link sent! Check your inbox.');
    }
  };

  // Shared "check your inbox" screen for both signup confirmation and magic link
  const renderCheckInbox = (options: {
    title: string;
    description: string;
    showOtp: boolean;
    onBack: () => void;
    onResend?: () => void;
  }) => (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <MailCheck className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{options.title}</h1>
        <p className="text-muted-foreground">
          {options.description} <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {options.showOtp && (
        <div className="w-full max-w-sm space-y-5">
          <p className="text-sm text-muted-foreground">
           Enter the 6-digit code from your email, or click the link to activate your account.
          </p>
          <div className="flex justify-center">
             <InputOTP
               maxLength={6}
               value={otpCode}
               onChange={(val) => {
                 setOtpCode(val);
                 if (val.length === 6) handleVerifyOtp(val);
               }}
               disabled={otpLoading}
             >
               <InputOTPGroup className="gap-1 sm:gap-2">
                 <InputOTPSlot index={0} />
                 <InputOTPSlot index={1} />
                 <InputOTPSlot index={2} />
               </InputOTPGroup>
               <div className="flex items-center px-1 sm:px-2">
                 <span className="text-lg sm:text-xl text-muted-foreground">-</span>
               </div>
               <InputOTPGroup className="gap-1 sm:gap-2">
                 <InputOTPSlot index={3} />
                 <InputOTPSlot index={4} />
                 <InputOTPSlot index={5} />
               </InputOTPGroup>
             </InputOTP>
          </div>
          {otpLoading && (
            <p className="text-sm text-muted-foreground">Verifying...</p>
          )}
        </div>
      )}

      {!options.showOtp && (
        <p className="text-sm text-muted-foreground max-w-sm">
          Click the link in your email to sign in. Check your spam folder if you don't see it.
        </p>
      )}

      {/* Resend button with countdown */}
      <div className="text-sm text-muted-foreground">
        {resendTimer > 0 ? (
          <p>Didn't receive it? Resend in {resendTimer}s</p>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            onClick={options.onResend}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend email'}
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        className="rounded-full mt-2"
        onClick={options.onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to sign in
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background overflow-x-clip">
      <SEOHead title="Sign In - VOVV.AI" description="Sign in or create your VOVV.AI account to start generating AI product photography." noindex />
      {/* Left side - Form */}
      <div className="flex-1 min-w-0 w-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center mb-8 hover:opacity-70 transition-opacity"
              aria-label="VOVV.AI — back to home"
            >
              <span className="font-bold text-2xl sm:text-[28px] tracking-tight text-foreground">
                VOVV.AI
              </span>
            </button>

            {!signupComplete && !magicLinkSent && (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {mode === 'signup'
                    ? 'Start with 20 free credits - no credit card required'
                    : 'Sign in to continue generating'}
                </p>
              </>
            )}
          </div>

          {signupComplete ? (
            renderCheckInbox({
              title: 'Check your inbox',
              description: 'We sent a confirmation code to',
              showOtp: true,
              onBack: () => {
                setSignupComplete(false);
                setMode('login');
                setPassword('');
                setConfirmPassword('');
                setOtpCode('');
              },
              onResend: handleResendSignup,
            })
          ) : magicLinkSent ? (
            renderCheckInbox({
              title: 'Check your email',
              description: 'We sent a sign-in link to',
              showOtp: false,
              onBack: () => {
                setMagicLinkSent(false);
              },
              onResend: handleResendMagicLink,
            })
          ) : (
            <>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google Sign-In */}
            <button
              type="button"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin + '/app',
                });
                if (result?.error) {
                  toast.error('Google sign-in failed. Please try again.');
                }
              }}
              className="w-full h-11 rounded-full border border-input bg-background hover:bg-accent flex items-center justify-center gap-3 text-sm font-medium transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Apple Sign-In */}
            <button
              type="button"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("apple", {
                  redirect_uri: window.location.origin + '/app',
                });
                if (result?.error) {
                  toast.error('Apple sign-in failed. Please try again.');
                }
              }}
              className="w-full h-11 rounded-full bg-black text-white hover:bg-black/90 flex items-center justify-center gap-3 text-sm font-medium transition-colors"
            >
              <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.545 15.467c-.29.672-.633 1.29-1.032 1.856-.543.773-.988 1.308-1.332 1.605-.532.488-1.102.738-1.712.754-.438 0-.966-.125-1.582-.38-.618-.254-1.186-.379-1.707-.379-.543 0-1.125.125-1.746.38-.623.254-1.125.387-1.508.399-.586.024-1.168-.234-1.746-.773-.373-.324-.84-.879-1.398-1.664-.598-.84-1.09-1.816-1.476-2.93C.14 13.028 0 11.764 0 10.543c0-1.398.301-2.602.906-3.609.476-.809 1.11-1.446 1.903-1.914.793-.469 1.649-.707 2.57-.72.465 0 1.075.145 1.836.426.758.282 1.246.426 1.46.426.16 0 .703-.168 1.622-.504.87-.312 1.602-.441 2.2-.39 1.627.13 2.851.77 3.668 1.921-1.453.883-2.172 2.12-2.156 3.707.015 1.238.461 2.27 1.336 3.09.398.375.84.664 1.332.867-.106.313-.22.613-.34.903zM11.91.422c0 .97-.355 1.875-1.062 2.71-.855 1-.89 1.574-1.883 1.637-.012-.102-.02-.21-.02-.324 0-.93.406-1.926 1.126-2.74.36-.414.82-.758 1.375-1.032.555-.27 1.078-.418 1.57-.445.016.066.024.133.024.2z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); setFormError(null); }}
                className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetSent(false);
                      setShowResetDialog(true);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); setFormError(null); }}
                className={`h-11 ${errors.password ? 'border-destructive' : ''}`}
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            </div>

            {mode === 'signup' && (
              <>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                  className={`h-11 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccept"
                  checked={termsAccepted}
                  onCheckedChange={(v) => { setTermsAccepted(!!v); setErrors(prev => ({ ...prev, terms: undefined })); }}
                  className="mt-0.5"
                />
                <label htmlFor="termsAccept" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}
                    className="underline text-foreground hover:text-primary"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setPrivacyOpen(true); }}
                    className="underline text-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketingOptIn"
                  checked={marketingOptIn}
                  onCheckedChange={(v) => setMarketingOptIn(!!v)}
                  className="mt-0.5"
                />
                <label htmlFor="marketingOptIn" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                  Send me news, tips & special offers via email
                </label>
              </div>
              </>
            )}

            {formError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 rounded-full font-semibold text-base" disabled={loading}>
              {loading
                ? 'Loading...'
                : mode === 'signup'
                  ? 'Create Account'
                  : 'Sign In'}
            </Button>
          </form>

          {/* Magic Link option (login mode only) */}
          {mode === 'login' && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={magicLinkLoading}
                className="w-full h-11 rounded-full border border-input bg-background hover:bg-accent flex items-center justify-center gap-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                {magicLinkLoading ? 'Sending...' : 'Sign in with email link'}
              </button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setFormError(null); }} className="text-primary font-medium hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setFormError(null); }} className="text-primary font-medium hover:underline">
                  Sign up free
                </button>
              </>
            )}
          </div>
          </>
          )}

        </div>
      </div>

      {/* Right side - Rotating gallery (hidden on mobile) */}
      <AuthHeroGallery />
      {/* Forgot Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={(open) => { setShowResetDialog(open); if (!open) { setResetSent(false); setResetError(null); } }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-xl">{resetSent ? 'Check your inbox' : 'Reset your password'}</DialogTitle>
            <DialogDescription>
              {resetSent
                ? <>We sent a reset link to <span className="text-foreground font-medium">{resetEmail}</span></>
                : "Enter your email and we'll send you a reset link"}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  It can take a minute to arrive. Check your{' '}
                  <span className="text-foreground font-medium">Spam</span> or{' '}
                  <span className="text-foreground font-medium">Promotions</span> folder —
                  the email comes from <span className="text-foreground font-medium">noreply@notify.vovv.ai</span>.
                </p>
              </div>
              {resetError && (
                <div className="w-full flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {resetError}
                </div>
              )}
              <Button
                className="w-full h-11 rounded-full shadow-sm hover:shadow-md transition-shadow"
                disabled={resetLoading || resetCooldown > 0}
                onClick={async () => {
                  if (resetCooldown > 0 || resetLoading) return;
                  const ok = await sendResetEmail(resetEmail);
                  if (ok) startResetCooldown(resetEmail);
                }}
              >
                {resetLoading
                  ? 'Sending…'
                  : resetCooldown > 0
                    ? `Resend in ${resetCooldown}s`
                    : 'Resend email'}
              </Button>
              <button
                type="button"
                onClick={() => { setResetSent(false); setResetError(null); }}
                className="text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!resetEmail.trim()) return;
                const ok = await sendResetEmail(resetEmail);
                if (ok) {
                  setResetSent(true);
                  startResetCooldown(resetEmail);
                }
              }}
              className="space-y-5"
            >
              {resetError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {resetError}
                </div>
              )}
              <Input
                id="reset-email"
                type="email"
                placeholder="Email address"
                value={resetEmail}
                onChange={(e) => { setResetEmail(e.target.value); setResetError(null); }}
                required
                className="rounded-full bg-muted/50 border-0 h-11 px-5"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Reset emails arrive from <span className="text-foreground font-medium">noreply@notify.vovv.ai</span>.
                They sometimes land in Spam or Promotions.
              </p>
              <Button type="submit" className="w-full h-11 rounded-full shadow-sm hover:shadow-md transition-shadow" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send reset link'}
              </Button>
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mx-auto py-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Terms of Service modal — keeps user on the signup page */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Last updated: March 2026</DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto pr-1 -mr-1">
            <TermsContent />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTermsOpen(false)} className="rounded-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy modal — keeps user on the signup page */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>Last updated: March 2026</DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto pr-1 -mr-1">
            <PrivacyContent />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPrivacyOpen(false)} className="rounded-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
