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
import { HomeFAQ } from '@/components/home/HomeFAQ';
import { HomeFinalCTA } from '@/components/home/HomeFinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'VOVV',
  url: `${SITE_URL}/home`,
  description:
    'Turn one product photo into ready-to-use product images, ads, and videos for e-commerce brands.',
  applicationCategory: 'DesignApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title="VOVV — AI Product Visuals & Videos for Ecommerce"
        description="Turn one product photo into ready-to-use product visuals, ads, and videos. Create e-commerce visuals in minutes without booking another shoot."
        canonical={`${SITE_URL}/home`}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={jsonLd} />

      <LandingNav />
      <HomeHero />
      <HomeTransformStrip />
      <HomeCreateCards />
      <HomeHowItWorks />
      <HomeWhySwitch />
      <HomeOnBrand />
      <HomeFAQ />
      <HomeFinalCTA />
      <LandingFooter />
    </div>
  );
}
