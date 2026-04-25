import { ArrowRight } from 'lucide-react';

export interface LandingDecisionMatrixProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
}

export function LandingDecisionMatrix({
  eyebrow = 'Decision framework',
  headline,
  intro,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
}: LandingDecisionMatrixProps) {
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
          {[
            { title: leftTitle, items: leftItems },
            { title: rightTitle, items: rightItems },
          ].map(({ title, items }) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-9"
            >
              <h3 className="text-[#1a1a2e] text-lg font-semibold mb-5 tracking-tight">{title}</h3>
              <ul className="space-y-3.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#374151] text-[15px]">
                    <span className="mt-1 text-[#1a1a2e]/60 shrink-0">
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
