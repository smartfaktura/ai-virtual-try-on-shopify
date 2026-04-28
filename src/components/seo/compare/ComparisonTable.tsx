export interface ComparisonRow {
  feature: string;
  left: string;
  right: string;
}

export interface ComparisonTableProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  /** Header for the left column (competitor) */
  leftLabel: string;
  /** Header for the right column (VOVV.AI — visually accented) */
  rightLabel: string;
  rows: ComparisonRow[];
  background?: 'background' | 'soft';
}

export function ComparisonTable({
  eyebrow = 'Side by side',
  headline,
  intro,
  leftLabel,
  rightLabel,
  rows,
  background = 'soft',
}: ComparisonTableProps) {
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

        {/* Desktop / tablet table */}
        <div className="hidden md:block bg-white rounded-3xl border border-[#f0efed] shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-[#fafaf8] border-b border-[#f0efed]">
            <div className="col-span-4 px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Feature / Workflow
            </div>
            <div className="col-span-4 px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {leftLabel}
            </div>
            <div className="col-span-4 px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a1a2e]">
              {rightLabel}
            </div>
          </div>
          <div className="divide-y divide-[#f0efed]">
            {rows.map((row) => (
              <div key={row.feature} className="grid grid-cols-12 items-start">
                <div className="col-span-4 px-6 py-5 text-[#1a1a2e] text-[15px] font-semibold tracking-tight">
                  {row.feature}
                </div>
                <div className="col-span-4 px-6 py-5 text-[#475569] text-[15px] leading-relaxed">
                  {row.left}
                </div>
                <div className="col-span-4 px-6 py-5 text-[#1a1a2e] text-[15px] leading-relaxed bg-[#fafaf8]/50">
                  {row.right}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden space-y-4">
          {rows.map((row) => (
            <div
              key={row.feature}
              className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                {row.feature}
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80 mb-1">
                    {leftLabel}
                  </p>
                  <p className="text-[#475569] text-[14px] leading-relaxed">{row.left}</p>
                </div>
                <div className="pt-3 border-t border-[#f0efed]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1a1a2e] mb-1">
                    {rightLabel}
                  </p>
                  <p className="text-[#1a1a2e] text-[14px] leading-relaxed">{row.right}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
