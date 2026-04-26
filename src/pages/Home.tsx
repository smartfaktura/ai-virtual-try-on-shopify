import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeTransformStrip } from '@/components/home/HomeTransformStrip';
import { HomeCreateCards } from '@/components/home/HomeCreateCards';
import { HomeModels } from '@/components/home/HomeModels';

import { HomeHowItWorks } from '@/components/home/HomeHowItWorks';
import { HomeWhySwitch } from '@/components/home/HomeWhySwitch';

import { HomeOnBrand } from '@/components/home/HomeOnBrand';
import { HomeEnvironments } from '@/components/home/HomeEnvironments';
import { HomeFAQ, homeFaqs } from '@/components/home/HomeFAQ';
import { HomeFinalCTA } from '@/components/home/HomeFinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VOVV.AI',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  description: 'AI product visual platform for e-commerce brands.',
  sameAs: [
    'https://www.instagram.com/vovv.ai',
    'https://www.linkedin.com/company/vovv-ai',
    'https://x.com/vovv_ai',
  ],
};

const websiteLd = {
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

const softwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VOVV.AI',
  url: SITE_URL,
  description:
    'Turn one product photo into product page images, lifestyle visuals, ads, social content, and campaign-ready creative.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: homeFaqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] overflow-x-clip">
      <SEOHead
        title="VOVV.AI | AI Product Visuals for E-commerce Brands"
        description="Turn one product photo into product page images, lifestyle visuals, ads, and campaign-ready creative with VOVV.AI — built for e-commerce brands."
        canonical={SITE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />
      <JsonLd data={softwareLd} />
      <JsonLd data={faqLd} />

      <LandingNav />
      <HomeHero />
      <HomeTransformStrip />
      <HomeModels />
      <HomeCreateCards />
      <HomeHowItWorks />
      <HomeWhySwitch />
      
      <HomeOnBrand />
      <HomeEnvironments />
      <HomeFAQ />
      <HomeFinalCTA />
      <LandingFooter />
    </div>
  );
}
