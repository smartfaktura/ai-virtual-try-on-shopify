import { PageLayout } from '@/components/landing/PageLayout';
import { FileText } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/constants';
import { TermsContent } from '@/components/legal/TermsContent';

export default function TermsOfService() {
  return (
    <PageLayout>
      <SEOHead title="Terms of Service — VOVV.AI" description="Read the VOVV.AI terms of service. Understand your rights and responsibilities when using our AI product photography platform." canonical={`${SITE_URL}/terms`} />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Terms of Service', path: '/terms' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'Terms of Service', description: 'Read the VOVV.AI terms of service. Understand your rights and responsibilities when using our platform.', path: '/terms' })} />
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
          </div>
          <TermsContent />
        </div>
      </section>
    </PageLayout>
  );
}
