import { useEffect } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { trackViewContent } from '@/lib/fbPixel';
import { gtagViewItem } from '@/lib/gtag';
import { SEOHead } from '@/components/SEOHead';

export default function Pricing() {
  useEffect(() => { trackViewContent('Pricing', 'pricing_page'); gtagViewItem('Pricing', 'pricing_page'); }, []);
  return (
    <PageLayout>
      <SEOHead title="Pricing & Plans — VOVV AI" description="Free credits to start. Scale with flexible plans from Starter to Enterprise. AI product photography pricing for every e-commerce brand." canonical="https://vovvai.lovable.app/pricing" />
      <LandingPricing />
    </PageLayout>
  );
}
