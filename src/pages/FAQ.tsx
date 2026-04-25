import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

import { FAQHero } from '@/components/faq/FAQHero';
import { FAQAccordion, FAQ_GROUPS } from '@/components/faq/FAQAccordion';
import { FAQContactStrip } from '@/components/faq/FAQContactStrip';


const PAGE_URL = `${SITE_URL}/faq`;

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: PAGE_URL },
  ],
};

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_GROUPS.flatMap((g) =>
    g.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
  ),
};

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title="Frequently Asked Questions — VOVV.AI"
        description="Pricing, credits, brand control, generation, ownership, and account questions about VOVV.AI — answered in one place."
        canonical={PAGE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqPageJsonLd} />

      <LandingNav />
      <main>
        <FAQHero />
        <FAQAccordion />
        <FAQContactStrip />
      </main>
      <LandingFooter />
    </div>
  );
}
