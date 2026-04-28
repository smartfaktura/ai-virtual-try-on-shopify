import { useEffect } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SignupSlideUp } from '@/components/landing/SignupSlideUp';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { gtagViewItem } from '@/lib/gtag';
import { gtmPricingPageView } from '@/lib/gtm';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/constants';
import { pricingPlans } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

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
  useEffect(() => {
    gtagViewItem('Pricing', 'pricing_page');
    gtmPricingPageView({ path: '/pricing' });
  }, []);
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title="Pricing & Plans — VOVV.AI" description="Free credits to start. Scale with flexible plans from Starter to Enterprise. AI product photography pricing for every e-commerce brand." canonical={`${SITE_URL}/pricing`} />
      <JsonLd data={pricingJsonLd} />
      <LandingNav />
      <main>
        <LandingPricing />
      </main>
      <LandingFooter />
      <SignupSlideUp />
    </div>
  );
}
