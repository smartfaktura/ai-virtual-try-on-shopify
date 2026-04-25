import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

export function CategoryPainPoints({ page }: { page: CategoryPage }) {
  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Why this category is hard
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            What makes {page.groupName.toLowerCase()} visuals difficult
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {page.painPoints.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8 flex gap-5"
            >
              <span className="shrink-0 w-10 h-10 rounded-2xl bg-[#1a1a2e] text-white text-sm font-mono font-medium flex items-center justify-center">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-[#374151] text-[15px] leading-relaxed pt-1">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
