import { Check } from 'lucide-react';

export interface VerdictCard {
  /** e.g. "Choose VOVV.AI if you want" */
  title: string;
  /** Optional small caption shown above the title (e.g. brand name) */
  eyebrow?: string;
  items: string[];
  /** Visually highlight the VOVV card */
  accent?: boolean;
}

export interface QuickVerdictCardsProps {
  eyebrow?: string;
  headline?: string;
  intro?: string;
  cards: [VerdictCard, VerdictCard];
}

export function QuickVerdictCards({
  eyebrow = 'Quick verdict',
  headline = 'Which one fits your workflow',
  intro,
  cards,
}: QuickVerdictCardsProps) {
  return (
    <section className="py-16 lg:py-28 bg-background">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-14">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className={[
                'rounded-3xl p-7 lg:p-9 transition-all duration-300',
                card.accent
                  ? 'bg-[#1a1a2e] text-white shadow-md'
                  : 'bg-white border border-[#f0efed] shadow-sm',
              ].join(' ')}
            >
              {card.eyebrow && (
                <p
                  className={[
                    'text-[11px] font-semibold uppercase tracking-[0.18em] mb-3',
                    card.accent ? 'text-white/60' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {card.eyebrow}
                </p>
              )}
              <h3
                className={[
                  'text-lg lg:text-xl font-semibold tracking-tight mb-5',
                  card.accent ? 'text-white' : 'text-[#1a1a2e]',
                ].join(' ')}
              >
                {card.title}
              </h3>
              <ul className="space-y-3.5">
                {card.items.map((item) => (
                  <li
                    key={item}
                    className={[
                      'flex items-start gap-3 text-[15px] leading-relaxed',
                      card.accent ? 'text-white/85' : 'text-[#374151]',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full shrink-0',
                        card.accent
                          ? 'bg-white/15 text-white'
                          : 'bg-[#1a1a2e]/8 text-[#1a1a2e]',
                      ].join(' ')}
                      style={card.accent ? undefined : { backgroundColor: 'rgba(26,26,46,0.08)' }}
                    >
                      <Check size={12} strokeWidth={3} />
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
