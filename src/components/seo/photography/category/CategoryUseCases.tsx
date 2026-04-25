import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { iconMap } from './iconMap';

export function CategoryUseCases({ page }: { page: CategoryPage }) {
  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Use cases
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Built for {page.groupName.toLowerCase()} teams shipping every week
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {page.useCases.map(({ title, text, icon }) => {
            const Icon = iconMap[icon];
            return (
              <div key={title} className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <Icon size={20} className="text-primary mb-3" strokeWidth={1.75} />
                <h3 className="text-[#1a1a2e] text-base font-semibold mb-1">{title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
