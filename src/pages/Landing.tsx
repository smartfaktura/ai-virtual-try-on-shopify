import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StudioTeamSection } from '@/components/landing/StudioTeamSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FreestyleShowcaseSection } from '@/components/landing/FreestyleShowcaseSection';
import { ProductCategoryShowcase } from '@/components/landing/ProductCategoryShowcase';
import { ModelShowcaseSection } from '@/components/landing/ModelShowcaseSection';
import { EnvironmentShowcaseSection } from '@/components/landing/EnvironmentShowcaseSection';
import { CreativeDropsSection } from '@/components/landing/CreativeDropsSection';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { useMemo } from 'react';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VOVV AI',
  url: 'https://vovvai.lovable.app',
  logo: 'https://vovvai.lovable.app/favicon.png',
  sameAs: [],
  description: 'AI-powered product photography and visual studio for e-commerce brands.',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VOVV AI',
  url: 'https://vovvai.lovable.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://vovvai.lovable.app/discover?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <SEOHead
        title="VOVV AI — AI Product Photography & Visual Studio for E-commerce"
        description="Upload one product photo, get 20 brand-ready visuals for ads, website, and campaigns automatically. Your automated visual studio."
        canonical="https://vovvai.lovable.app"
      />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <LandingNav />
      <main>
        <HeroSection />
        <StudioTeamSection />
        <HowItWorks />
        <FreestyleShowcaseSection />
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
