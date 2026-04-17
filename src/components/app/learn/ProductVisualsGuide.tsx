import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { useLearnRead } from '@/hooks/useLearnRead';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { LEARN_TRACKS, type LearnGuide } from '@/data/learnContent';
import { mockModels } from '@/data/mockData';

const EXAMPLE_MODELS = (['model_029', 'model_031', 'model_018', 'model_033'] as const)
  .map((id) => {
    const m = mockModels.find((x) => x.modelId === id)!;
    return { name: m.name, url: m.previewUrl };
  });

const EXAMPLE_SCENES = [
  { name: 'On-Model Editorial', url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776233159228-ji84j3.jpg' },
  { name: 'Movement Shot', url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776241316033-5ym4h3.jpg' },
  { name: 'In-Hand Lifestyle', url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/in-hand-lifestyle-fragrance-1776013280517.jpg' },
  { name: 'Editorial Jackets', url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776242322741-h5942k.jpg' },
] as const;

interface Props {
  guide: LearnGuide;
}

const STEPS = [
  {
    n: '01',
    name: 'Product',
    what: 'Add a product or pick one from your library.',
    why: 'VOVV reads materials, color and category before generating.',
    visual: 'upload',
  },
  {
    n: '02',
    name: 'Shots',
    what: 'Browse 1000+ scenes by category and aesthetic.',
    why: 'Start with 2–3 to compare looks cleanly.',
    visual: 'thumbs',
  },
  {
    n: '03',
    name: 'Setup',
    what: 'Pick models, background colors, and fine-tune scene settings.',
    why: 'Adjust per-scene aspect ratios, props, and outfit details before you generate.',
    visual: 'chips',
  },
  {
    n: '04',
    name: 'Generate',
    what: 'Confirm credits, hit Generate.',
    why: 'Run batches across products and scenes — generate hundreds of studio-grade images in one pass.',
    visual: 'batch',
  },
] as const;

function StepVisual({ kind }: { kind: (typeof STEPS)[number]['visual'] }) {
  if (kind === 'upload') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-md border border-dashed border-border/70 bg-background/50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-sm bg-foreground/20" />
        </div>
      </div>
    );
  }
  if (kind === 'thumbs') {
    return (
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-9 h-12 rounded-md border border-border/60 bg-card/60 motion-safe:animate-fade-in"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
          />
        ))}
      </div>
    );
  }
  if (kind === 'chips') {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {['Model', 'Color', 'Scene'].map((label) => (
          <span
            key={label}
            className="px-2.5 py-1 rounded-full border border-border/60 bg-card/60 text-[11px] text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
    );
  }
  // batch
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-9 h-9">
        <div className="absolute inset-0 rounded-md border border-border/50 bg-card/40 translate-x-1.5 translate-y-1.5" />
        <div className="absolute inset-0 rounded-md border border-border/60 bg-card/60 translate-x-0.5 translate-y-0.5" />
        <div className="absolute inset-0 rounded-md border border-border/70 bg-card/80 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-foreground/70 tabular-nums">×100</span>
        </div>
      </div>
    </div>
  );
}

function ExamplesSection({ onExplore }: { onExplore: () => void }) {
  const { ref, visible } = useScrollReveal(0.15);
  return (
    <section ref={ref} className="mb-14">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
        A taste of what's inside
      </h2>
      <div className="rounded-xl border border-border/50 bg-card/30 p-6 space-y-7">
        {/* Models */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 mb-3">
            Models you can pick
          </p>
          <div className="flex items-end gap-3 flex-wrap">
            {EXAMPLE_MODELS.map((m, i) => (
              <div
                key={m.name}
                className={`flex flex-col items-center gap-1.5 transition-all duration-500 ease-out motion-reduce:transition-none ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
                }`}
                style={{ transitionDelay: visible ? `${i * 70}ms` : '0ms' }}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted/30 border border-border/50">
                  <ShimmerImage
                    src={getOptimizedUrl(m.url, { quality: 65 })}
                    alt={m.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{m.name}</span>
              </div>
            ))}
            <button
              onClick={onExplore}
              className="ml-1 px-3 h-8 rounded-full border border-border/60 bg-card/40 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              + many more
            </button>
          </div>
        </div>

        {/* Scenes */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 mb-3">
            Editorial scenes — 1000+ available
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXAMPLE_SCENES.map((s, i) => (
              <div
                key={s.name}
                className={`transition-all duration-500 ease-out motion-reduce:transition-none ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
                }`}
                style={{ transitionDelay: visible ? `${(i + EXAMPLE_MODELS.length) * 70}ms` : '0ms' }}
              >
                <div className="rounded-lg overflow-hidden bg-muted/30 border border-border/50" style={{ aspectRatio: '3/4' }}>
                  <ShimmerImage
                    src={getOptimizedUrl(s.url, { quality: 65 })}
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 truncate">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const { ref, visible } = useScrollReveal(0.2);
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-border/50 bg-card/30 p-5 md:p-6 transition-all duration-500 ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ transitionDelay: visible ? `${index * 60}ms` : '0ms' }}
    >
      <div className="flex items-start gap-5">
        <div className="text-[12px] font-semibold tabular-nums text-muted-foreground/70 tracking-wider pt-0.5 w-7 flex-shrink-0">
          {step.n}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground">{step.name}</h3>
          <p className="text-[14px] text-foreground/85 leading-relaxed mt-1.5">{step.what}</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed mt-1">{step.why}</p>
        </div>
        <div className="hidden sm:flex flex-shrink-0 items-center pt-0.5">
          <StepVisual kind={step.visual} />
        </div>
      </div>
    </div>
  );
}

export function ProductVisualsGuide({ guide }: Props) {
  const navigate = useNavigate();
  const { markRead } = useLearnRead();

  useEffect(() => {
    markRead(guide.section, guide.slug);
  }, [guide.section, guide.slug, markRead]);

  const trackLabel =
    LEARN_TRACKS.find((t) => t.id === guide.tracks[0])?.label ?? 'Guide';

  return (
    <div className="max-w-3xl mx-auto pt-2 pb-24 animate-in fade-in duration-300">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/learn')}
        className="gap-1.5 mb-8 text-muted-foreground hover:text-foreground px-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Learn
      </Button>

      <div className="max-w-2xl">
        {/* Hero */}
        <header className="pb-10 mb-12 border-b border-border/50">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">
            {trackLabel}
            <span className="mx-2 text-muted-foreground/40">·</span>
            <span className="tabular-nums">{guide.readMin} min read</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground motion-safe:animate-fade-in">
            {guide.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mt-3 max-w-[58ch]">
            {guide.tagline}
          </p>

          {/* Animated mini-stepper */}
          <div className="mt-8 relative">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 sm:gap-3">
                  <span
                    className="px-3 py-1.5 rounded-full border border-border/60 bg-card/40 text-[12px] font-medium text-foreground/80 motion-safe:animate-fade-in motion-safe:opacity-0"
                    style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}
                  >
                    <span className="text-muted-foreground tabular-nums mr-1.5">{s.n}</span>
                    {s.name}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      className="hidden sm:block h-px w-4 bg-border/70 origin-left motion-safe:animate-[progress-grow_1.2s_ease-out_forwards] motion-reduce:scale-x-100"
                      style={{ animationDelay: `${i * 120 + 80}ms` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* When to use */}
        {guide.vsAlternatives && guide.vsAlternatives.length > 0 && (
          <section className="mb-14">
            <div className="space-y-3">
              {guide.vsAlternatives.map((alt, i) => (
                <div key={i} className="flex items-baseline gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground w-16 flex-shrink-0">
                    {alt.label}
                  </span>
                  <span className="text-[14px] text-foreground/90 leading-relaxed">
                    {alt.useThisWhen}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* The 4 steps — centerpiece */}
        <section className="mb-14">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-5">
            How it works
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <StepCard key={step.n} step={step} index={i} />
            ))}
          </div>
        </section>

        {/* Examples — models + scenes taste */}
        <ExamplesSection onExplore={() => navigate('/app/generate/product-images')} />

        {/* Best for / Need — compact 2-col */}
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                Best for
              </h2>
              <ul className="space-y-2">
                {guide.bestFor.slice(0, 3).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[14px] text-foreground/90 leading-relaxed"
                  >
                    <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                What you'll need
              </h2>
              <ul className="space-y-2">
                {guide.whatYouNeed.slice(0, 2).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[14px] text-foreground/90 leading-relaxed"
                  >
                    <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Tips — compact Do/Avoid */}
        <section className="mb-14">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
            Tips
          </h2>
          <div className="rounded-xl border border-border/50 bg-card/30 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 mb-3">
                  Do
                </p>
                <ul className="space-y-2.5">
                  {guide.tips.filter((t) => t.type === 'do').slice(0, 2).map((tip, i) => (
                    <li
                      key={i}
                      className="text-[14px] text-foreground/90 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground/50 flex-shrink-0" />
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                  Avoid
                </p>
                <ul className="space-y-2.5">
                  {guide.tips.filter((t) => t.type === 'dont').slice(0, 2).map((tip, i) => (
                    <li
                      key={i}
                      className="text-[14px] text-muted-foreground leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="mt-[9px] w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <div className="rounded-xl border border-border/50 bg-card/30 p-6">
            <p className="text-[13px] font-medium text-foreground/80 mb-4">Ready to try it?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate(guide.cta.route)}
                className="gap-2 rounded-full font-medium"
              >
                {guide.cta.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
              {guide.secondaryCta && (
                <Button
                  variant="outline"
                  onClick={() => navigate(guide.secondaryCta!.route)}
                  className="gap-2 rounded-full font-medium"
                >
                  {guide.secondaryCta.label}
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
