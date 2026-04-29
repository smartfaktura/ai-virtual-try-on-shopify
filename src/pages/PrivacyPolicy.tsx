import { PageLayout } from '@/components/landing/PageLayout';
import { Shield } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/constants';
import { PrivacyContent } from '@/components/legal/PrivacyContent';

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <SEOHead title="Privacy Policy — VOVV.AI" description="Learn how VOVV.AI collects, uses, and protects your data. Read our full privacy policy." canonical={`${SITE_URL}/privacy`} />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Privacy Policy', path: '/privacy' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'Privacy Policy', description: 'Learn how VOVV.AI collects, uses, and protects your data.', path: '/privacy' })} />
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: April 2026</p>
          </div>
          <PrivacyContent />
        </div>
      </section>
    </PageLayout>
  );
}
