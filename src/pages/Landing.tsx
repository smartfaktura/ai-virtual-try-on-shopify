import { lazy, Suspense } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/constants';

// Lazy-load below-fold sections to reduce initial main-thread work
const StudioTeamSection = lazy(() => import('@/components/landing/StudioTeamSection').then(m => ({ default: m.StudioTeamSection })));
const HowItWorks = lazy(() => import('@/components/landing/HowItWorks').then(m => ({ default: m.HowItWorks })));
const FreestyleShowcaseSection = lazy(() => import('@/components/landing/FreestyleShowcaseSection').then(m => ({ default: m.FreestyleShowcaseSection })));
const ProductCategoryShowcase = lazy(() => import('@/components/landing/ProductCategoryShowcase').then(m => ({ default: m.ProductCategoryShowcase })));
const OneImageToVisualLibrarySection = lazy(() => import('@/components/landing/OneImageToVisualLibrarySection').then(m => ({ default: m.OneImageToVisualLibrarySection })));
const VideoShowcaseSection = lazy(() => import('@/components/landing/VideoShowcaseSection').then(m => ({ default: m.VideoShowcaseSection })));
const ModelShowcaseSection = lazy(() => import('@/components/landing/ModelShowcaseSection').then(m => ({ default: m.ModelShowcaseSection })));
const EnvironmentShowcaseSection = lazy(() => import('@/components/landing/EnvironmentShowcaseSection').then(m => ({ default: m.EnvironmentShowcaseSection })));

const LandingFAQ = lazy(() => import('@/components/landing/LandingFAQ').then(m => ({ default: m.LandingFAQ })));
const FinalCTA = lazy(() => import('@/components/landing/FinalCTA').then(m => ({ default: m.FinalCTA })));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter').then(m => ({ default: m.LandingFooter })));

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VOVV.AI',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  sameAs: [],
  description: 'AI-powered product photography and visual studio for e-commerce brands.',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VOVV.AI',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/discover?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <SEOHead
        title="VOVV.AI — AI Product Photography & Visual Studio for E-commerce"
        description="Upload one product photo, get 20 brand-ready visuals for ads, website, and campaigns automatically. Your automated visual studio."
        canonical={SITE_URL}
      />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <LandingNav />
      <main>
        <HeroSection />
        <Suspense fallback={null}><ProductCategoryShowcase /></Suspense>
        <Suspense fallback={null}><OneImageToVisualLibrarySection /></Suspense>
        <Suspense fallback={null}><StudioTeamSection /></Suspense>
        <Suspense fallback={null}><HowItWorks /></Suspense>
        <Suspense fallback={null}><FreestyleShowcaseSection /></Suspense>
        <Suspense fallback={null}><VideoShowcaseSection /></Suspense>
        <Suspense fallback={null}><ModelShowcaseSection /></Suspense>
        <Suspense fallback={null}><EnvironmentShowcaseSection /></Suspense>
        <Suspense fallback={null}><LandingFAQ /></Suspense>
        <Suspense fallback={null}><FinalCTA /></Suspense>
      </main>
      <Suspense fallback={null}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}
