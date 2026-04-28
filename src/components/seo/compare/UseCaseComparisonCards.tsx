import type { LucideIcon } from 'lucide-react';

export interface UseCaseCard {
  title: string;
  /** VOVV.AI angle (rendered with subtle accent) */
  vovv: string;
  /** Competitor angle */
  competitor: string;
  Icon?: LucideIcon;
}

export interface UseCaseComparisonCardsProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  /** Label for the competitor column inside each card (e.g. "Flair AI") */
  competitorLabel: string;
  cards: UseCaseCard[];
  background?: 'background' | 'soft';
}

export function UseCaseComparisonCards({
  eyebrow = 'Use cases',
  headline,
  intro,
  competitorLabel,
  cards,
  background = 'background',
}: UseCaseComparisonCardsProps) {
  const bg = background === 'soft' ? 'bg-[#f5f5f3]' : 'bg-background';

  return (
    <section className={`py-16 lg:py-32 ${bg}`}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            {headline}
          </h2>
          {intro && (
            <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
              {intro}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {cards.map(({ title, vovv, competitor, Icon }) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              {Icon && (
                <div className="w-10 h-10 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
              )}
              <h3 className="text-[#1a1a2e] text-lg font-semibold tracking-tight mb-4">
                {title}
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a1a2e] mb-1.5">
                    VOVV.AI
                  </p>
                  <p className="text-[#374151] text-[14.5px] leading-relaxed">{vovv}</p>
                </div>
                <div className="pt-4 border-t border-[#f0efed]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                    {competitorLabel}
                  </p>
                  <p className="text-[#475569] text-[14.5px] leading-relaxed">{competitor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
