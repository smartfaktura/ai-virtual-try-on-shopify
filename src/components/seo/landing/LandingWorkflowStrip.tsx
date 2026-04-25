import { ArrowRight } from 'lucide-react';

export interface LandingWorkflowStripProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  leftTitle: string;
  leftSteps: string[];
  rightTitle: string;
  rightSteps: string[];
}

function StepRow({ steps, dark }: { steps: string[]; dark?: boolean }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`text-[12px] sm:text-[13px] font-medium px-3 py-1.5 rounded-full border ${
              dark ? 'bg-white/10 border-white/15 text-white/90' : 'bg-foreground/[0.04] border-[#e5e4e0] text-[#374151]'
            }`}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <ArrowRight size={14} className={dark ? 'text-white/40' : 'text-foreground/30'} />
          )}
        </li>
      ))}
    </ol>
  );
}

export function LandingWorkflowStrip({
  eyebrow = 'Workflow',
  headline,
  intro,
  leftTitle,
  leftSteps,
  rightTitle,
  rightSteps,
}: LandingWorkflowStripProps) {
  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            {headline}
          </h2>
          {intro && (
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{intro}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-9">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-4">
              {leftTitle}
            </p>
            <StepRow steps={leftSteps} />
          </div>
          <div className="bg-[#1a1a2e] rounded-3xl shadow-sm p-7 lg:p-9 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold mb-4">
              {rightTitle}
            </p>
            <StepRow steps={rightSteps} dark />
          </div>
        </div>
      </div>
    </section>
  );
}
