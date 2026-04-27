import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BrandLoaderProgressGlyph } from '@/components/ui/brand-loader-progress-glyph';

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

    // Use cached result to skip DB query on subsequent navigations
    const cached = sessionStorage.getItem(`onboarding_ok_${user.id}`);
    if (cached === '1') {
      setNeedsOnboarding(false);
      setOnboardingChecked(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!cancelled) {
          const needs = data?.onboarding_completed === false;
          setNeedsOnboarding(needs);
          if (!needs) {
            sessionStorage.setItem(`onboarding_ok_${user.id}`, '1');
          }
        }
      } catch (err) {
        console.error('ProtectedRoute: profile check failed', err);
      } finally {
        if (!cancelled) {
          setOnboardingChecked(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  if (isLoading || !onboardingChecked) {
    return <BrandLoaderProgressGlyph fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
