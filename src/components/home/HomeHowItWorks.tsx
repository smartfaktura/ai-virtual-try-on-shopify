import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Search, Upload, ImageIcon } from 'lucide-react';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';

/* ── Reusable wireframe image placeholder ── */
function ImagePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center ${className}`}
    >
      <ImageIcon size={20} className="text-muted-foreground/40" strokeWidth={1.5} />
    </div>
  );
}

/* ── Step 1: Upload ── */
function StepUpload() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-6 flex items-center justify-center">
      <div className="relative w-[78%] aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-border/70 flex items-center justify-center">
        {/* Generic bottle silhouette */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-3 h-4 rounded-sm bg-foreground/15" />
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-foreground/10" />
        </div>
        {/* Upload badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white border border-border shadow-sm flex items-center justify-center">
          <Upload size={18} className="text-muted-foreground" strokeWidth={1.75} />
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
        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap">
          1000+ shots
        </span>
        <div className="flex-1 h-7 rounded-full bg-muted/60 border border-border/50 flex items-center px-3 gap-2">
          <Search size={12} className="text-muted-foreground/70" />
          <div className="h-1.5 w-16 rounded-full bg-border/70" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        <ImagePlaceholder />
        <ImagePlaceholder />
        <ImagePlaceholder />
        <ImagePlaceholder />
      </div>
    </div>
  );
}

/* ── Step 3: Generate ── */
function StepGenerate() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-5 sm:p-6 flex flex-col gap-3 justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-2.5"
        >
          <ImagePlaceholder className="w-14 h-14 shrink-0" />
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
