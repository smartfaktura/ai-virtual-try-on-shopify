import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

export function CategorySubcategoryChips({ page }: { page: CategoryPage }) {
  return (
    <section className="py-10 lg:py-14 bg-background border-y border-[#f0efed]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          What we cover in {page.groupName.toLowerCase()}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {page.subcategories.map((sub) => (
            <a
              key={sub}
              href="#outputs"
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
