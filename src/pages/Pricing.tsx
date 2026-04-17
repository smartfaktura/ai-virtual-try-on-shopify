import { useEffect } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { trackViewContent } from '@/lib/fbPixel';
import { gtagViewItem } from '@/lib/gtag';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/constants';
import { pricingPlans } from '@/data/mockData';

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'VOVV.AI Visual Studio',
  description: 'AI-powered product photography platform for e-commerce brands.',
  brand: { '@type': 'Brand', name: 'VOVV.AI' },
  offers: pricingPlans
    .filter((p) => !p.isEnterprise)
    .map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: String(p.monthlyPrice),
      priceCurrency: 'USD',
      url: `${SITE_URL}/pricing`,
      availability: 'https://schema.org/InStock',
    })),
};

export default function Pricing() {
  useEffect(() => { trackViewContent('Pricing', 'pricing_page'); gtagViewItem('Pricing', 'pricing_page'); }, []);
  return (
    <PageLayout>
      <SEOHead title="Pricing & Plans — VOVV.AI" description="Free credits to start. Scale with flexible plans from Starter to Enterprise. AI product photography pricing for every e-commerce brand." canonical={`${SITE_URL}/pricing`} />
      <JsonLd data={pricingJsonLd} />
      <LandingPricing />
    </PageLayout>
  );
}
