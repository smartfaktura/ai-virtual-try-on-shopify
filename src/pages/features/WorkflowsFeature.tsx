import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  Camera,
  Wand2,
  Compass,
  Film,
  ArrowUpCircle,
  CalendarClock,
  Palette,
  Home,
  UserSquare2,
  Shirt,
  Package,
  Paintbrush,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';

const wizardSteps = [
  { n: '01', label: 'Products', icon: Package },
  { n: '02', label: 'Shots', icon: Layers },
  { n: '03', label: 'Setup', icon: Paintbrush },
  { n: '04', label: 'Review', icon: ClipboardCheck },
  { n: '05', label: 'Generate', icon: Sparkles },
  { n: '06', label: 'Results', icon: CheckCircle2 },
];

const flagshipBullets = [
  'Upload one product. Generate dozens of category-aware scenes.',
  'AI-analyzed shots tuned to your category — apparel, fragrance, eyewear, jewelry & more.',
  'Cast brand models, lock outfits, control lighting and aspect ratios per shot.',
  'Pro 6-credit-per-image quality. No prompts. No retouching. Ready to ship.',
];

type Tool = {
  name: string;
  tagline: string;
  to: string;
  icon: typeof Sparkles;
  external?: boolean;
};

const tools: Tool[] = [
  { name: 'Brand Models', tagline: 'Cast your own AI models. Lock identity across every shoot.', to: '/app/models', icon: UserSquare2 },
  { name: 'Virtual Try-On', tagline: 'See garments on 40+ diverse AI models with realistic fit.', to: '/features/virtual-try-on', icon: Shirt },
  { name: 'Perspectives', tagline: 'One photo, every camera angle — instantly.', to: '/features/perspectives', icon: Compass },
  { name: 'Catalog Studio', tagline: 'Phase-aware ecommerce sets at scale. (BETA)', to: '/app/catalog', icon: Layers },
  { name: 'Freestyle', tagline: 'Open-prompt creative playground for art direction.', to: '/app/freestyle', icon: Wand2 },
  { name: 'Short Film', tagline: 'AI campaign director — script, shots and motion.', to: '/app/video/short-film', icon: Film },
  { name: 'Image Upscaling', tagline: '2K and 4K refinement with studio-grade clarity.', to: '/features/upscale', icon: ArrowUpCircle },
  { name: 'Creative Drops', tagline: 'Scheduled monthly content drops on autopilot.', to: '/features/creative-drops', icon: CalendarClock },
  { name: 'Brand Profiles', tagline: 'Lock palette, mood and lighting across every output.', to: '/features/brand-profiles', icon: Palette },
  { name: 'Real Estate Staging', tagline: 'Stage empty rooms in 12 design styles.', to: '/features/real-estate-staging', icon: Home },
];

const flow = [
  { n: '01', title: 'Bring your products', desc: 'Drop in packshots, phone photos or flat lays. Our AI extracts category, color and material in seconds.' },
  { n: '02', title: 'Direct the shoot', desc: 'Pick scenes, models, framings and brand profile. Every choice is a tap — no prompts, no guesswork.' },
  { n: '03', title: 'Ship campaigns', desc: 'Download the set, push to Shopify, or feed it straight into ads. From upload to assets in minutes.' },
];

const stats = [
  { kpi: '~2 min', label: 'From upload to first hero shot' },
  { kpi: '30+', label: 'Curated scenes across 14 categories' },
  { kpi: '6 credits', label: 'Pro-quality per image — no surprises' },
];

export default function WorkflowsFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="The VOVV Studio — One Workspace for Every Brand Visual"
        description="Product Images is the AI photo studio at the core of VOVV. Surrounded by Brand Models, Virtual Try-On, Catalog Studio, Short Film, Upscaling and more — every visual your brand needs in one place."
        canonical={`${SITE_URL}/features/workflows`}
      />

      {/* Hero */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-6">
            The Studio
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05] mb-6">
            One workspace.<br />
            Every visual your brand needs.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Product Images is the AI photo studio at the core of VOVV. Around it sits a focused toolkit — models, motion, upscaling, drops — so every campaign starts and ships in the same place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-sm font-semibold gap-2"
              onClick={() => navigate('/auth')}
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12 text-sm font-semibold border-foreground/15 hover:bg-foreground/5"
              onClick={() => navigate('/discover')}
            >
              See it in action
            </Button>
          </div>
        </div>
      </section>

      {/* Flagship Spotlight — Product Images */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-foreground text-background p-8 sm:p-12 lg:p-16 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16">
              <div className="flex-1 max-w-2xl">
                <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-background/60 mb-5">
                  The Hero Tool
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] mb-6">
                  Product Images —<br />your AI photo studio.
                </h2>
                <p className="text-base sm:text-lg text-background/70 leading-relaxed mb-8">
                  A single 6-step flow takes one product upload and returns a full editorial shoot. Category-aware, brand-consistent, and tuned for ecommerce, ads and lookbooks.
                </p>

                <ul className="space-y-3 mb-10">
                  {flagshipBullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-background/80">
                      <div className="mt-2 w-1 h-1 rounded-full bg-background/60 shrink-0" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-sm font-semibold gap-2 bg-background text-foreground hover:bg-background/90"
                  onClick={() => navigate('/app/generate/product-images')}
                >
                  Open the studio
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Step ladder */}
              <div className="lg:w-[42%] w-full">
                <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-background/50 mb-5">
                  The 6-step flow
                </div>
                <div className="space-y-2">
                  {wizardSteps.map((s) => (
                    <div
                      key={s.n}
                      className="flex items-center gap-4 rounded-2xl border border-background/10 bg-background/[0.03] px-5 py-4"
                    >
                      <div className="text-[11px] font-mono tracking-wider text-background/50 w-8">
                        {s.n}
                      </div>
                      <s.icon className="w-4 h-4 text-background/70 shrink-0" />
                      <div className="text-sm font-medium text-background">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio toolkit */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-4">
              The Toolkit
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Specialist tools, one studio.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whatever Product Images doesn't cover, a focused tool does — and they all share the same brand profile, models and library.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {tools.map((t) => (
              <button
                key={t.name}
                onClick={() => navigate(t.to)}
                className="group text-left bg-card hover:bg-muted/40 transition-colors p-7 flex flex-col gap-4 min-h-[180px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl border border-border flex items-center justify-center">
                    <t.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">
                    {t.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.tagline}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it fits together */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-4">
              How it fits together
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              From upload to campaign — without leaving the studio.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {flow.map((s) => (
              <div key={s.n}>
                <div className="text-[11px] font-mono tracking-wider text-muted-foreground mb-3">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 md:gap-6 text-center md:text-left">
            {stats.map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                  {s.kpi}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-5">
            Your studio is one upload away.
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Start free. Generate your first hero shot in minutes. Scale into a full visual library when you're ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-sm font-semibold gap-2"
              onClick={() => navigate('/auth')}
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12 text-sm font-semibold border-foreground/15 hover:bg-foreground/5"
              onClick={() => navigate('/pricing')}
            >
              See pricing
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
