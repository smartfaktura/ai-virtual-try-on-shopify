import { PageLayout } from '@/components/landing/PageLayout';
import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const changeTypes = {
  new: { label: 'New', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  improved: { label: 'Improved', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  fixed: { label: 'Fixed', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};

const releases = [
  {
    version: 'v1.3.0',
    date: 'February 1, 2026',
    title: 'Freestyle Studio & Video Generation',
    changes: [
      { type: 'new' as const, text: 'Freestyle generation mode — describe any scene with a text prompt' },
      { type: 'new' as const, text: 'AI video generation from product images (5s and 10s clips)' },
      { type: 'new' as const, text: 'Mobile upload — scan a QR code to capture product photos from your phone' },
      { type: 'improved' as const, text: 'Model selector now shows 40+ diverse AI models with filtering by body type, ethnicity, and age' },
      { type: 'improved' as const, text: 'Gallery view with full-screen lightbox and download options' },
      { type: 'fixed' as const, text: 'Brand Profile color palette picker not saving custom colors' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'January 10, 2026',
    title: 'Creative Drops & Bulk Generation',
    changes: [
      { type: 'new' as const, text: 'Creative Drops — automated monthly content delivery with scheduling' },
      { type: 'new' as const, text: 'Bulk generation — process multiple products across workflows in one batch' },
      { type: 'new' as const, text: 'Credit pack purchasing with tiered pricing' },
      { type: 'improved' as const, text: 'Workflow cards now show animated previews on hover' },
      { type: 'improved' as const, text: 'Dashboard redesigned with quick actions and onboarding checklist' },
      { type: 'fixed' as const, text: 'CSV import failing on files with special characters in product names' },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'December 5, 2025',
    title: 'Brand Profiles & Virtual Try-On',
    changes: [
      { type: 'new' as const, text: 'Brand Profiles — save your visual identity for consistent generation' },
      { type: 'new' as const, text: 'Virtual Try-On workflow for clothing and accessories' },
      { type: 'new' as const, text: 'Pose library with 20+ curated poses across studio, lifestyle, editorial, and streetwear categories' },
      { type: 'improved' as const, text: 'Generation quality improved with negative prompt support' },
      { type: 'fixed' as const, text: 'Image aspect ratio not applying correctly in some templates' },
      { type: 'fixed' as const, text: 'Job status not updating in real-time on the Jobs page' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'October 15, 2025',
    title: 'Launch — VOVV.AI Visual Studio',
    changes: [
      { type: 'new' as const, text: 'Product upload with multi-image support and automatic categorization' },
      { type: 'new' as const, text: '12 pre-built workflows: Lifestyle, Studio, Flat Lay, Social Media, and more' },
      { type: 'new' as const, text: 'Template library with 15+ professionally designed scene templates' },
      { type: 'new' as const, text: 'Jobs library with search, filtering, and batch download' },
      { type: 'new' as const, text: 'Settings with plan management and notification preferences' },
      { type: 'new' as const, text: 'Secure authentication with email and password' },
    ],
  },
];

export default function Changelog() {
  return (
    <PageLayout>
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
            {releases.map((release) => (
              <div key={release.version} className="relative pl-8 border-l-2 border-border">
                {/* Dot */}
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
        </div>
      </section>
    </PageLayout>
  );
}
