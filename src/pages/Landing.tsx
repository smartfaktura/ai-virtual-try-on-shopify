import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';

import { StudioTeamSection } from '@/components/landing/StudioTeamSection';

import { HowItWorks } from '@/components/landing/HowItWorks';
import { ProductCategoryShowcase } from '@/components/landing/ProductCategoryShowcase';
import { ModelShowcaseSection } from '@/components/landing/ModelShowcaseSection';
import { EnvironmentShowcaseSection } from '@/components/landing/EnvironmentShowcaseSection';
import { CreativeDropsSection } from '@/components/landing/CreativeDropsSection';

import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Landing() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <LandingNav />
      <main>
        <HeroSection />
        
        <StudioTeamSection />
        
        <HowItWorks />
        
        <ProductCategoryShowcase />
        <ModelShowcaseSection />
        <EnvironmentShowcaseSection />
        <CreativeDropsSection />
        
        <LandingPricing />
        <LandingFAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
