import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

import { HowItWorksHero } from '@/components/howitworks/HowItWorksHero';
import { HomeHowItWorks } from '@/components/home/HomeHowItWorks';
import { HowItWorksDeepDive } from '@/components/howitworks/HowItWorksDeepDive';
import { HomeCreateCards } from '@/components/home/HomeCreateCards';
import { HomeTransformStrip } from '@/components/home/HomeTransformStrip';
import { HowItWorksTriple } from '@/components/howitworks/HowItWorksTriple';
import { HowItWorksFAQ } from '@/components/howitworks/HowItWorksFAQ';
import { HomeFinalCTA } from '@/components/home/HomeFinalCTA';

const PAGE_URL = `${SITE_URL}/how-it-works`;

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'How It Works', item: PAGE_URL },
  ],
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to create AI product photography with VOVV.AI',
  description:
    'Upload one product photo, choose a visual direction, and generate brand-ready product images, lifestyle scenes, ads, and campaign visuals.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Upload your product photo',
      text: 'Start with one clean image of your product. PNG, JPG, or WEBP.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Choose a visual direction',
      text: 'Pick from 1600+ scenes, 40+ AI models, and custom aspect ratios.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Generate brand-ready visuals',
      text: 'Get product page images, lifestyle scenes, ads, and campaign creative at 2K resolution.',
    },
  ],
};

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title="How VOVV.AI Works — From One Product Photo to a Full Visual System"
        description="See how VOVV.AI turns a single product photo into product page images, lifestyle visuals, ads, and campaign creative in minutes. No studio, no models, no setup."
        canonical={PAGE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={howToJsonLd} />

      <LandingNav />
      <main>
        <HowItWorksHero />
        <HomeHowItWorks />
        <HowItWorksDeepDive />
        <HomeCreateCards />
        <HomeTransformStrip />
        <HowItWorksTriple />
        <HowItWorksFAQ />
        <HomeFinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
