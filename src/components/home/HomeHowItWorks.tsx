import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Search, Upload, ImageIcon } from 'lucide-react';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';

/* ── Reusable wireframe image placeholder with subtle pulse ── */
function ImagePlaceholder({
  className = '',
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`relative rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Soft sweeping highlight */}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_3.5s_ease-in-out_infinite]"
        style={{ animationDelay: `${delay}ms` }}
      />
      <ImageIcon
        size={20}
        className="text-muted-foreground/50 relative z-10"
        strokeWidth={1.5}
      />
    </div>
  );
}

/* ── Step 1: Upload — bottle silhouette with pulsing upload badge ── */
function StepUpload() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-6 flex items-center justify-center">
      <div className="relative w-[78%] aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-border/70 flex items-center justify-center overflow-hidden">
        {/* Subtle bg shimmer */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_4s_ease-in-out_infinite]" />

        {/* Generic bottle silhouette — gentle float */}
        <div className="flex flex-col items-center gap-1.5 animate-[float_4s_ease-in-out_infinite] relative z-10">
          <div className="w-3 h-4 rounded-sm bg-foreground/15" />
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-foreground/10" />
        </div>

        {/* Upload badge — soft pulse ring */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <span className="absolute inset-0 rounded-full bg-foreground/20 animate-ping opacity-60" />
          <div className="relative w-11 h-11 rounded-full bg-white border border-border shadow-sm flex items-center justify-center">
            <Upload
              size={18}
              className="text-foreground/70 animate-[bounce-soft_2.4s_ease-in-out_infinite]"
              strokeWidth={1.75}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Choose shots — grid with one tile highlighted in rotation ── */
function StepChoose() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap">
          1000+ shots
        </span>
        <div className="flex-1 h-7 rounded-full bg-muted/60 border border-border/50 flex items-center px-3 gap-2 overflow-hidden">
          <Search size={12} className="text-muted-foreground/70 shrink-0" />
          <div className="h-1.5 rounded-full bg-border/70 animate-[search-grow_3.5s_ease-in-out_infinite]" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3 relative">
        <ImagePlaceholder delay={0} />
        <ImagePlaceholder delay={400} />
        <ImagePlaceholder delay={800} />
        <ImagePlaceholder delay={1200} />
        {/* Rotating selection ring */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-3">
          <div className="rounded-xl ring-2 ring-foreground/80 ring-offset-2 ring-offset-white opacity-0 animate-[select-1_4.8s_ease-in-out_infinite]" />
          <div className="rounded-xl ring-2 ring-foreground/80 ring-offset-2 ring-offset-white opacity-0 animate-[select-2_4.8s_ease-in-out_infinite]" />
          <div className="rounded-xl ring-2 ring-foreground/80 ring-offset-2 ring-offset-white opacity-0 animate-[select-3_4.8s_ease-in-out_infinite]" />
          <div className="rounded-xl ring-2 ring-foreground/80 ring-offset-2 ring-offset-white opacity-0 animate-[select-4_4.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Generate — rows fade + slide in on a loop ── */
function StepGenerate() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04] p-5 sm:p-6 flex flex-col gap-3 justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-2.5 opacity-0 animate-[row-in_4.8s_ease-out_infinite]"
          style={{ animationDelay: `${i * 500}ms` }}
        >
          <ImagePlaceholder className="w-14 h-14 shrink-0" delay={i * 600} />
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(200%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes search-grow {
          0%, 100% { width: 1.25rem; opacity: 0.5; }
          50% { width: 5rem; opacity: 1; }
        }
        @keyframes row-in {
          0% { opacity: 0; transform: translateY(8px); }
          15%, 80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes select-1 {
          0%, 100% { opacity: 0; }
          5%, 20% { opacity: 1; }
        }
        @keyframes select-2 {
          0%, 25%, 100% { opacity: 0; }
          30%, 45% { opacity: 1; }
        }
        @keyframes select-3 {
          0%, 50%, 100% { opacity: 0; }
          55%, 70% { opacity: 1; }
        }
        @keyframes select-4 {
          0%, 75%, 100% { opacity: 0; }
          80%, 95% { opacity: 1; }
        }
      `}</style>

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
