import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Search, Upload, ImageIcon } from 'lucide-react';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';

/* ── Reusable wireframe image placeholder ── */
function ImagePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center overflow-hidden ${className}`}
    >
      <ImageIcon
        size={20}
        className="text-muted-foreground/50"
        strokeWidth={1.5}
      />
    </div>
  );
}

/* ── Step 1: Upload — clean upload card ── */
function StepUpload() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-6 flex items-center justify-center">
      <div className="relative w-[82%] aspect-square rounded-2xl bg-muted/40 border-2 border-dashed border-border/70 flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-14 h-14 rounded-full bg-white border border-border shadow-sm flex items-center justify-center animate-[float_3s_ease-in-out_infinite]">
          <Upload
            size={22}
            className="text-foreground/70"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="h-2 w-3/4 rounded-full bg-border/70" />
          <div className="h-1.5 w-1/2 rounded-full bg-border/40" />
        </div>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white border border-border/60 px-2.5 py-1 rounded-full">
          PNG · JPG
        </span>
      </div>
    </div>
  );
}

/* ── Step 2: Choose shots — calm rotating highlight on one tile ── */
function StepChoose() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap">
          1000+ shots
        </span>
        <div className="flex-1 h-7 rounded-full bg-muted/60 border border-border/50 flex items-center px-3 gap-2 overflow-hidden">
          <Search size={12} className="text-muted-foreground/70 shrink-0" />
          <div className="h-1.5 w-16 rounded-full bg-border/60" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3 relative">
        <ImagePlaceholder />
        <ImagePlaceholder />
        <ImagePlaceholder />
        <ImagePlaceholder />
        {/* Rotating highlight — one tile at a time */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-3">
          <div className="rounded-xl ring-2 ring-foreground/70 bg-foreground/[0.04] opacity-0 animate-[hl-1_10s_ease-in-out_infinite]" />
          <div className="rounded-xl ring-2 ring-foreground/70 bg-foreground/[0.04] opacity-0 animate-[hl-2_10s_ease-in-out_infinite]" />
          <div className="rounded-xl ring-2 ring-foreground/70 bg-foreground/[0.04] opacity-0 animate-[hl-3_10s_ease-in-out_infinite]" />
          <div className="rounded-xl ring-2 ring-foreground/70 bg-foreground/[0.04] opacity-0 animate-[hl-4_10s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Generate — static rows that fade in once with the section ── */
function StepGenerate() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-5 sm:p-6 flex flex-col gap-3 justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-2.5 opacity-0 animate-[gen-row-in_0.6s_ease-out_forwards]"
          style={{ animationDelay: `${300 + i * 200}ms` }}
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
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes gen-row-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hl-1 {
          0%, 22%, 100% { opacity: 0; }
          3%, 19%       { opacity: 1; }
        }
        @keyframes hl-2 {
          0%, 25%, 47%, 100% { opacity: 0; }
          28%, 44%           { opacity: 1; }
        }
        @keyframes hl-3 {
          0%, 50%, 72%, 100% { opacity: 0; }
          53%, 69%           { opacity: 1; }
        }
        @keyframes hl-4 {
          0%, 75%, 97%, 100% { opacity: 0; }
          78%, 94%           { opacity: 1; }
        }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            How it works
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            From one product photo to a full shoot
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Three steps. No studio, no models, no setup.
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
            <Link to="/auth">Start Generating Free</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Free to start · No card required
          </p>
        </div>
      </div>
    </section>
  );
}
