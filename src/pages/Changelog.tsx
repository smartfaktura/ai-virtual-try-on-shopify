import { useState } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const changeTypes = {
  new: { label: 'New', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  improved: { label: 'Improved', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  fixed: { label: 'Fixed', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};

const releases = [
  {
    version: 'v1.5.0',
    date: 'March 20, 2026',
    title: 'Layout Switcher, Help Center & Polish',
    changes: [
      { type: 'new' as const, text: 'Workflow layout switcher — toggle between rows, 2-column, and 3-column grid views' },
      { type: 'improved' as const, text: 'Help Center FAQ completely rewritten for clarity' },
      { type: 'fixed' as const, text: 'Team page layout issues on mobile devices' },
      { type: 'improved' as const, text: 'Favicon and metadata audit across all pages' },
    ],
  },
  {
    version: 'v1.4.0',
    date: 'March 10, 2026',
    title: 'Freestyle Studio Enhancements',
    changes: [
      { type: 'new' as const, text: 'Brand Profile chip selector in Freestyle — apply your brand identity to any prompt' },
      { type: 'new' as const, text: 'Style presets chip bar for quick creative direction' },
      { type: 'new' as const, text: 'Negative prompts chip for fine-tuned generation control' },
      { type: 'improved' as const, text: 'Workflow cards now show animated thumbnail previews on hover' },
      { type: 'improved' as const, text: 'Compact workflow card variant for denser layouts' },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'February 2026',
    title: 'Video Generation & Mobile Upload',
    changes: [
      { type: 'new' as const, text: 'AI video generation from product images (5s and 10s clips)' },
      { type: 'new' as const, text: 'Mobile upload — scan a QR code to capture product photos from your phone' },
      { type: 'improved' as const, text: 'Model selector now shows 40+ diverse AI models with filtering by body type, ethnicity, and age' },
      { type: 'improved' as const, text: 'Gallery view with full-screen lightbox and download options' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'January 2026',
    title: 'Content Calendar & Bulk Generation',
    changes: [
      { type: 'new' as const, text: 'Content Calendar — automated content delivery with scheduling' },
      { type: 'new' as const, text: 'Bulk generation — process multiple products across workflows in one batch' },
      { type: 'new' as const, text: 'Credit pack purchasing with tiered pricing' },
      { type: 'improved' as const, text: 'Dashboard redesigned with quick actions and onboarding checklist' },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'December 2025',
    title: 'Brand Profiles & Virtual Try-On',
    changes: [
      { type: 'new' as const, text: 'Brand Profiles — save your visual identity for consistent generation' },
      { type: 'new' as const, text: 'Virtual Try-On workflow for clothing and accessories' },
      { type: 'new' as const, text: 'Pose library with 20+ curated poses across studio, lifestyle, editorial, and streetwear categories' },
      { type: 'improved' as const, text: 'Generation quality improved with negative prompt support' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'October 2025',
    title: 'Launch',
    changes: [
      { type: 'new' as const, text: 'Product upload with multi-image support and automatic categorization' },
      { type: 'new' as const, text: '4 specialized workflows: Virtual Try-On, Product Listing, Selfie / UGC, and Flat Lay' },
      { type: 'new' as const, text: 'Template library with professionally designed scene templates' },
      { type: 'new' as const, text: 'Jobs library with search, filtering, and batch download' },
      { type: 'new' as const, text: 'Secure authentication with email and password' },
    ],
  },
  {
    version: 'v0.1.0',
    date: 'Summer 2025',
    title: 'Early Development',
    changes: [
      { type: 'new' as const, text: 'Core architecture and AI generation pipeline' },
      { type: 'new' as const, text: 'Initial design system and component library' },
      { type: 'new' as const, text: 'Prototype workflows and internal testing' },
    ],
  },
];

const DEFAULT_VISIBLE = 4;

export default function Changelog() {
  const [showAll, setShowAll] = useState(false);
  const visibleReleases = showAll ? releases : releases.slice(0, DEFAULT_VISIBLE);

  return (
    <PageLayout>
      <SEOHead title="Changelog — VOVV AI Product Updates" description="A timeline of everything we've shipped. Follow along as VOVV AI builds the future of AI product photography." canonical={`${SITE_URL}/changelog`} />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <History className="w-4 h-4" />
            Changelog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            What's New
          </h1>
          <p className="text-lg text-muted-foreground">
            A timeline of everything we've shipped. Follow along as we build the future of product photography.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {visibleReleases.map((release) => (
              <div key={release.version} className="relative pl-8 border-l-2 border-border">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                <div className="mb-4">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="text-sm font-mono font-bold text-foreground">{release.version}</span>
                    <span className="text-xs text-muted-foreground">{release.date}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{release.title}</h2>
                </div>

                <ul className="space-y-3">
                  {release.changes.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 rounded-full shrink-0 mt-0.5 ${changeTypes[change.type].className}`}
                      >
                        {changeTypes[change.type].label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {releases.length > DEFAULT_VISIBLE && (
            <div className="mt-12 text-center">
              <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
                {showAll ? (
                  <>Show less <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>View full history <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
