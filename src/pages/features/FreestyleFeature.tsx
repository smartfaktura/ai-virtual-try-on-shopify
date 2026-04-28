import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  Wand2,
  ImagePlus,
  Palette,
  Camera,
  SlidersHorizontal,
  Compass,
  ShieldOff,
  MessageSquareText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/constants';
import { FreestyleShowcaseSection } from '@/components/landing/FreestyleShowcaseSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Capability = {
  icon: typeof Sparkles;
  title: string;
  desc: string;
};

const capabilities: Capability[] = [
  {
    icon: MessageSquareText,
    title: 'Open prompts',
    desc: 'Direct your shoot in plain language. No prompt engineering, no rigid templates.',
  },
  {
    icon: Layers,
    title: 'Mix any inputs',
    desc: 'Combine your products, brand models and scene presets in a single image.',
  },
  {
    icon: ImagePlus,
    title: 'Edit existing images',
    desc: 'Restyle, extend or refine any photo — your own or one from the gallery.',
  },
  {
    icon: Sparkles,
    title: 'Style presets',
    desc: 'Tap a look — editorial, lifestyle, studio, streetwear — and apply it instantly.',
  },
  {
    icon: Palette,
    title: 'Brand-locked output',
    desc: 'Pin a brand profile so palette, mood and lighting carry across every render.',
  },
  {
    icon: Camera,
    title: 'Pro camera controls',
    desc: 'Aspect ratio, framing, camera style and quality — adjustable per shot.',
  },
  {
    icon: ShieldOff,
    title: 'Negatives',
    desc: 'Exclude the things you never want to see again. Once, then it sticks.',
  },
  {
    icon: Compass,
    title: 'Browse the gallery',
    desc: 'Remix from a curated library of community presets and starter looks.',
  },
  {
    icon: Wand2,
    title: 'Smart suggestions',
    desc: 'Personalized scenes and models surface based on the products you upload.',
  },
];

const flow = [
  { n: '01', title: 'Describe', desc: 'Type the shot you want — naturally, like you would brief a photographer.' },
  { n: '02', title: 'Add inputs', desc: 'Attach products, choose models, pick a scene or a style preset.' },
  { n: '03', title: 'Generate', desc: 'Get studio-quality renders in seconds. Iterate, refine, ship.' },
];

const versus = [
  {
    name: 'Freestyle Studio',
    when: 'When you want creative freedom',
    points: [
      'Open prompts and free-form direction',
      'One-off art direction and exploration',
      'Mix any inputs in any combination',
      'Edit and restyle existing images',
    ],
    primary: true,
  },
  {
    name: 'Visual Studio',
    when: 'When you need a full set, fast',
    points: [
      'Templated, batch-ready workflows',
      'Category-aware scenes for hundreds of products',
      'Same brand profile across every shot',
      'Built for shipping campaigns at scale',
    ],
    primary: false,
  },
];

const faqs = [
  {
    q: 'Do I need to write prompts?',
    a: 'No. You can — but you can also just pick a product, a model and a scene and hit Generate. Prompts are optional creative direction, not a requirement.',
  },
  {
    q: 'Can I edit a photo I already have?',
    a: 'Yes. Drop in any image and choose to edit, restyle or extend it. Freestyle treats your image as the starting point, not a constraint.',
  },
  {
    q: 'How does this differ from Visual Studio?',
    a: 'Visual Studio is templated and batch-friendly — perfect for shipping a 50-image catalog set. Freestyle is open-ended for one-off creative direction, exploration and editing.',
  },
  {
    q: 'Will my brand stay consistent?',
    a: 'Pin a brand profile and Freestyle locks palette, mood and lighting across every render. Negatives stick too, so you only have to teach the system once.',
  },
  {
    q: 'How much does it cost?',
    a: 'Start free with included credits. After that you pay per image generated — no monthly minimum, no seat fees.',
  },
];

export default function FreestyleFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="Freestyle Studio — Open AI Image Studio for Brands | VOVV.AI"
        description="Describe what you want, pick your inputs, and get studio-quality product images in seconds. Open-prompt creative studio for brands."
        canonical={`${SITE_URL}/features/freestyle`}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Freestyle Studio',
          applicationCategory: 'DesignApplication',
          operatingSystem: 'Web',
          description:
            'Open-prompt AI image studio for brands. Describe a shot, mix inputs, get studio-quality results in seconds.',
          url: `${SITE_URL}/features/freestyle`,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />

      {/* Hero — animated showcase reused from homepage */}
      <h1 className="sr-only">Freestyle Studio — Open AI Image Studio for E-commerce Brands</h1>
      <FreestyleShowcaseSection />

      {/* Capabilities grid */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-4">
              What you can do
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Everything a creative studio gives you. None of the friction.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Freestyle is the open canvas inside VOVV — built for art direction, exploration and one-of-a-kind shots.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="bg-card p-7 flex flex-col gap-4 min-h-[170px]"
              >
                <div className="w-9 h-9 rounded-xl border border-border flex items-center justify-center">
                  <c.icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">
                    {c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-4">
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              From idea to image in three taps.
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

      {/* Discover the gallery teaser */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-4">
            Browse the gallery
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Start from a look you love.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Open the public Freestyle gallery, pick any preset, and remix it as your own. No setup, no signup to look around.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 h-12 text-sm font-semibold border-foreground/15 hover:bg-foreground/5 gap-2"
            onClick={() => navigate('/freestyle')}
          >
            Open the gallery
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Freestyle vs Visual Studio */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-4">
              Which one to use
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Freestyle or Visual Studio?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {versus.map((v) => (
              <div
                key={v.name}
                className={`rounded-2xl border p-7 flex flex-col gap-5 ${
                  v.primary
                    ? 'border-foreground/15 bg-foreground/[0.02]'
                    : 'border-border bg-card'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono tracking-wider text-muted-foreground mb-2">
                    {v.when}
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {v.name}
                  </h3>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {v.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed">
                      <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={v.primary ? 'default' : 'outline'}
                  className="rounded-full h-11 text-sm font-semibold gap-2 self-start"
                  onClick={() =>
                    navigate(v.primary ? '/auth?redirect=/app/freestyle' : '/features/workflows')
                  }
                >
                  {v.primary ? 'Try Freestyle' : 'See Visual Studio'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-4">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Common questions.
            </h2>
          </div>

          <Accordion type="single" collapsible className="border-t border-border">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
            Get started
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
            Your studio. No limits.
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
            Start free. Generate your first shot in seconds.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/auth?redirect=/app/freestyle')}
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
            >
              Start free
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/freestyle')}
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              See examples
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
