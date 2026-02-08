import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import authHero from '@/assets/auth/auth-hero.jpg';

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
                <span className="text-primary-foreground font-bold text-sm">fa</span>
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">framea.ai</span>
            </button>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'signup'
                ? 'Start with 5 free credits — no credit card required'
                : 'Sign in to continue generating'}
            </p>
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
              <Label htmlFor="password">Password</Label>
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
              <span>5 free credits included with every new account</span>
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
            Generated with framea.ai
          </p>
        </div>
      </div>
    </div>
  );
}
