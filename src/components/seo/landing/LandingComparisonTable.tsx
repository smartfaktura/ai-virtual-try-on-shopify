import { Check, X } from 'lucide-react';

export interface LandingComparisonTableProps {
  eyebrow?: string;
  headline: string;
  leftTitle: string;
  leftSubtitle: string;
  leftItems: string[];
  rightTitle: string;
  rightSubtitle: string;
  rightItems: string[];
  background?: 'background' | 'soft';
}

export function LandingComparisonTable({
  eyebrow = 'Comparison',
  headline,
  leftTitle,
  leftSubtitle,
  leftItems,
  rightTitle,
  rightSubtitle,
  rightItems,
  background = 'soft',
}: LandingComparisonTableProps) {
  const bg = background === 'soft' ? 'bg-[#f5f5f3]' : 'bg-background';
  return (
    <section className={`py-16 lg:py-32 ${bg}`}>
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-9">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
              {leftTitle}
            </p>
            <h3 className="text-[#1a1a2e] text-xl font-semibold mb-6">{leftSubtitle}</h3>
            <ul className="space-y-3">
              {leftItems.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[#374151] text-[15px]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-foreground/5 text-foreground/40 flex items-center justify-center shrink-0">
                    <X size={12} strokeWidth={2.5} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1a1a2e] rounded-3xl shadow-sm p-7 lg:p-9 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold mb-2">
              {rightTitle}
            </p>
            <h3 className="text-white text-xl font-semibold mb-6">{rightSubtitle}</h3>
            <ul className="space-y-3">
              {rightItems.map((t) => (
                <li key={t} className="flex items-start gap-3 text-white/90 text-[15px]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
