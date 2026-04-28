export interface CompetitorStrengthsSectionProps {
  eyebrow?: string;
  headline: string;
  copy: string;
  /** Optional bullet list of factual strengths */
  bullets?: string[];
  background?: 'background' | 'soft';
}

/**
 * Neutral, factual section describing what the competitor does well.
 * Designed to read as balanced, not as a takedown.
 */
export function CompetitorStrengthsSection({
  eyebrow = 'Their strengths',
  headline,
  copy,
  bullets,
  background = 'soft',
}: CompetitorStrengthsSectionProps) {
  const bg = background === 'soft' ? 'bg-[#f5f5f3]' : 'bg-background';

  return (
    <section className={`py-16 lg:py-28 ${bg}`}>
      <div className="max-w-[900px] mx-auto px-6 lg:px-10">
        <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-8 lg:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2 className="text-[#1a1a2e] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-5">
            {headline}
          </h2>
          <p className="text-[#475569] text-base sm:text-lg leading-relaxed">{copy}</p>

          {bullets && bullets.length > 0 && (
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {bullets.map((item) => (
                <li
                  key={item}
                  className="text-[#374151] text-[15px] leading-relaxed flex items-start gap-2.5"
                >
                  <span className="mt-2 inline-block h-1 w-1 rounded-full bg-[#1a1a2e]/40 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
