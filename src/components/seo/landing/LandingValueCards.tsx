import type { LucideIcon } from 'lucide-react';

export interface ValueCard {
  title: string;
  text?: string;
  Icon?: LucideIcon;
}

export interface LandingValueCardsProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  cards: ValueCard[];
  /** Background variant — alternating sections look best on the page. */
  background?: 'background' | 'soft';
  /** Columns at lg+. Defaults to 4. */
  columns?: 3 | 4;
  id?: string;
}

export function LandingValueCards({
  eyebrow,
  headline,
  intro,
  cards,
  background = 'background',
  columns = 4,
  id,
}: LandingValueCardsProps) {
  const bg = background === 'soft' ? 'bg-[#f5f5f3]' : 'bg-background';
  const grid = columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';
  return (
    <section id={id} className={`py-16 lg:py-32 ${bg}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              {eyebrow}
            </p>
          )}
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            {headline}
          </h2>
          {intro && (
            <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
              {intro}
            </p>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${grid} gap-4 lg:gap-5`}>
          {cards.map(({ title, text, Icon }) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {Icon && (
                <div className="w-10 h-10 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
              )}
              <h3 className="text-[#1a1a2e] text-base font-semibold mb-1.5 tracking-tight">{title}</h3>
              {text && <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
