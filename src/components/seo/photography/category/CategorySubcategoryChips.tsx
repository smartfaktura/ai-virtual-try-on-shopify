import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

export function CategorySubcategoryChips({ page }: { page: CategoryPage }) {
  return (
    <section className="py-10 lg:py-14 bg-background border-y border-[#f0efed]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          What we cover in {page.groupName.toLowerCase()}
        </p>

        {/* Mobile: full-bleed horizontal snap rail with edge fade */}
        <div className="sm:hidden relative -mx-6">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {page.subcategories.map((sub) => (
              <a
                key={sub}
                href="#scene-library"
                className="snap-start shrink-0 inline-flex items-center px-4 h-9 rounded-full bg-white border border-[#f0efed] text-[#1a1a2e] text-[13px] font-medium hover:border-foreground/20 transition-all shadow-sm whitespace-nowrap"
              >
                {sub}
              </a>
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/80 to-transparent" />
        </div>

        {/* Tablet+ : centered wrap */}
        <div className="hidden sm:flex flex-wrap justify-center gap-2">
          {page.subcategories.map((sub) => (
            <a
              key={sub}
              href="#scene-library"
              className="inline-flex items-center px-4 h-9 rounded-full bg-white border border-[#f0efed] text-[#1a1a2e] text-[13px] font-medium hover:border-foreground/20 hover:-translate-y-px transition-all shadow-sm"
            >
              {sub}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
