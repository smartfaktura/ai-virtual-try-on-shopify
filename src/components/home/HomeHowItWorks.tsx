import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Search, Upload } from 'lucide-react';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import originalFragrance from '@/assets/home-hero-original-fragrance.jpg';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const STEP2_THUMBS = [
  PREVIEW('1776688965090-edaogg'),
  PREVIEW('1776689318257-yahkye'),
  PREVIEW('1776843776495-iyiigl'),
  PREVIEW('1776524131703-gvh4bb'),
];

const STEP3_THUMBS = [
  PREVIEW('1776524132929-q8upyp'),
  PREVIEW('1776574228066-oyklfz'),
  PREVIEW('1776524128011-dcnlpo'),
];

/* ── Step 1: Upload ── */
function StepUpload() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-6 flex items-center justify-center">
      <div className="relative w-[78%] aspect-square rounded-2xl bg-muted/40 border border-dashed border-border overflow-hidden">
        <img
          src={getOptimizedUrl(originalFragrance, { quality: 50 })}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/90 border border-border flex items-center justify-center shadow-sm">
            <Upload size={20} className="text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Choose shots ── */
function StepChoose() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground bg-muted px-2.5 py-1 rounded-full">
          1000+ shots
        </span>
        <div className="flex-1 h-7 rounded-full bg-muted/60 border border-border/50 flex items-center px-3 gap-2">
          <Search size={12} className="text-muted-foreground/70" />
          <div className="h-1.5 w-16 rounded-full bg-border/70" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        {STEP2_THUMBS.map((src, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden bg-muted/30 border border-border/40"
          >
            <img
              src={getOptimizedUrl(src, { quality: 45 })}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3: Generate ── */
function StepGenerate() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-5 sm:p-6 flex flex-col gap-3 justify-center">
      {STEP3_THUMBS.map((src, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-2.5"
        >
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted/30 shrink-0">
            <img
              src={getOptimizedUrl(src, { quality: 45 })}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-2 w-3/4 rounded-full bg-border/70" />
            <div className="h-1.5 w-1/2 rounded-full bg-border/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  { num: '1. Upload',       Visual: StepUpload },
  { num: '2. Choose shots', Visual: StepChoose },
  { num: '3. Generate',     Visual: StepGenerate },
];

export function HomeHowItWorks() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-background" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            How it works
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Create visuals in minutes
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Upload one product image, choose from 1000+ ready-made shots, and generate brand-ready visuals fast.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={ref}
          className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-6 lg:gap-4 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {STEPS.map((step, i) => (
            <div key={step.num} className="contents lg:contents">
              <div className="flex flex-col items-center gap-4 flex-1 max-w-sm mx-auto w-full">
                <h3 className="text-foreground text-base sm:text-lg font-semibold">
                  {step.num}
                </h3>
                <step.Visual />
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex items-center justify-center text-muted-foreground/60 shrink-0">
                  <ArrowDown size={22} className="lg:hidden" strokeWidth={1.5} />
                  <ArrowRight size={22} className="hidden lg:block" strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 mt-12 lg:mt-16">
          <Button asChild size="lg" className="rounded-full px-10 h-12 text-base">
            <Link to="/auth">Start generating</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            No studio. No models. No complex setup.
          </p>
        </div>
      </div>
    </section>
  );
}
