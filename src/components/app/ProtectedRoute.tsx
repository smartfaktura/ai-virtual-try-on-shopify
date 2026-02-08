import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user) {
      setOnboardingChecked(true);
      return;
    }

    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setNeedsOnboarding(data?.onboarding_completed === false);
        setOnboardingChecked(true);
      });
  }, [user]);

  if (isLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center animate-pulse">
            <span className="text-primary-foreground font-bold text-sm">fa</span>
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
