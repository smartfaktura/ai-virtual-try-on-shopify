import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';

import { StudioTeamSection } from '@/components/landing/StudioTeamSection';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ModelShowcaseSection } from '@/components/landing/ModelShowcaseSection';
import { EnvironmentShowcaseSection } from '@/components/landing/EnvironmentShowcaseSection';
import { CreativeDropsSection } from '@/components/landing/CreativeDropsSection';

import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <LandingNav />
      <main>
        <HeroSection />
        
        <StudioTeamSection />
        <FeatureGrid />
        <HowItWorks />
        
        <ModelShowcaseSection />
        <EnvironmentShowcaseSection />
        <CreativeDropsSection />
        <IntegrationSection />
        <LandingPricing />
        <LandingFAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
