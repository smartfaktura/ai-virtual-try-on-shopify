import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';
const authHero = getLandingAssetUrl('auth/auth-hero.jpg');

export default function Auth() {
  const navigate = useNavigate();
  const { signUp, signIn, user, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email to confirm your account!');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate('/app', { replace: true });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">VOVV.AI</span>
            </button>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'signup'
                ? 'Start with 20 free credits — no credit card required'
                : 'Sign in to continue generating'}
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email.trim()) {
                        toast.error('Please enter your email first');
                        return;
                      }
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: window.location.origin + '/reset-password',
                      });
                      if (error) {
                        toast.error(error.message);
                      } else {
                        toast.success('Check your email for a password reset link');
                      }
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
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-full font-semibold text-base" disabled={loading}>
              {loading
                ? 'Loading…'
                : mode === 'signup'
                  ? 'Create Account'
                  : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-primary font-medium hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-primary font-medium hover:underline">
                  Sign up free
                </button>
              </>
            )}
          </div>

          {mode === 'signup' && (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span>20 free credits included with every new account</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side — Hero image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative">
        <img
          src={authHero}
          alt="AI-generated product photography showcase"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-white/90 text-sm font-medium">
            Generated with VOVV.AI
          </p>
        </div>
      </div>
    </div>
  );
}
