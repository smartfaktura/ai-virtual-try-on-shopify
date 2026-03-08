import { useEffect } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { trackViewContent } from '@/lib/fbPixel';
import { gtagViewItem } from '@/lib/gtag';

export default function Pricing() {
  useEffect(() => { trackViewContent('Pricing', 'pricing_page'); gtagViewItem('Pricing', 'pricing_page'); }, []);
  return (
    <PageLayout>
      <LandingPricing />
    </PageLayout>
  );
}
