import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { HomeNav } from '@/components/home/HomeNav';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeTransformStrip } from '@/components/home/HomeTransformStrip';
import { HomeCreateCards } from '@/components/home/HomeCreateCards';
import { HomeCategoryExamples } from '@/components/home/HomeCategoryExamples';
import { HomeHowItWorks } from '@/components/home/HomeHowItWorks';
import { HomeWhySwitch } from '@/components/home/HomeWhySwitch';
import { HomeOnBrand } from '@/components/home/HomeOnBrand';
import { HomeQualityProof } from '@/components/home/HomeQualityProof';
import { HomePricingTeaser } from '@/components/home/HomePricingTeaser';
import { HomeFAQ } from '@/components/home/HomeFAQ';
import { HomeFinalCTA } from '@/components/home/HomeFinalCTA';
import { HomeFooter } from '@/components/home/HomeFooter';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'VOVV',
  url: `${SITE_URL}/home`,
  description:
    'Turn one product photo into ready-to-use product images, ads, and videos for ecommerce brands.',
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
        title="VOVV — AI Product Images & Videos for Ecommerce"
        description="Turn one product photo into ready-to-use product images, ads, and videos. Create ecommerce visuals in minutes without booking another shoot."
        canonical={`${SITE_URL}/home`}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={jsonLd} />

      <HomeNav />
      <HomeHero />
      <HomeTransformStrip />
      <HomeCreateCards />
      <HomeCategoryExamples />
      <HomeHowItWorks />
      <HomeWhySwitch />
      <HomeOnBrand />
      <HomeQualityProof />
      <HomePricingTeaser />
      <HomeFAQ />
      <HomeFinalCTA />
      <HomeFooter />
    </div>
  );
}
