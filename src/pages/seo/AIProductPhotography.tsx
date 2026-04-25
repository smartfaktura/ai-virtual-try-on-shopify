import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PhotographyHero } from '@/components/seo/photography/PhotographyHero';
import { PhotographyCategoryChooser } from '@/components/seo/photography/PhotographyCategoryChooser';
import { PhotographyVisualSystem } from '@/components/seo/photography/PhotographyVisualSystem';
import { HomeModels } from '@/components/home/HomeModels';
import { PhotographyHowItWorks } from '@/components/seo/photography/PhotographyHowItWorks';
import { PhotographySceneExamples } from '@/components/seo/photography/PhotographySceneExamples';
import { PhotographyUseCases } from '@/components/seo/photography/PhotographyUseCases';
import { PhotographyComparison } from '@/components/seo/photography/PhotographyComparison';
import { PhotographyFAQ } from '@/components/seo/photography/PhotographyFAQ';
import { PhotographyFinalCTA } from '@/components/seo/photography/PhotographyFinalCTA';

const PAGE_URL = `${SITE_URL}/ai-product-photography`;

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'AI Product Photography', item: PAGE_URL },
  ],
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VOVV.AI — AI Product Photography Generator',
  url: PAGE_URL,
  description:
    'Upload one product photo and create product page images, lifestyle visuals, ads, social content, and campaign-ready product photography with AI.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function AIProductPhotography() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title="AI Product Photography Generator for E-commerce Brands | VOVV.AI"
        description="Upload one product photo and create product page images, lifestyle visuals, ads, social content, and campaign-ready product photography with AI."
        canonical={PAGE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={softwareJsonLd} />

      <LandingNav />
      <main>
        <PhotographyHero />
        <PhotographyCategoryChooser />
        <PhotographyVisualSystem />
        <HomeModels />
        <PhotographyHowItWorks />
        <PhotographySceneExamples />
        <PhotographyUseCases />
        <PhotographyComparison />
        <PhotographyFAQ />
        <PhotographyFinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
