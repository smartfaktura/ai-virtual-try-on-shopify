import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { iconMap } from './iconMap';

export function CategoryVisualOutputs({ page }: { page: CategoryPage }) {
  return (
    <section id="outputs" className="py-16 lg:py-32 bg-[#f5f5f3] scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            What VOVV creates
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            One {page.groupName.toLowerCase()} photo. A full visual system.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Upload your product once and create visuals for your store, ads, social, email, and seasonal campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {page.visualOutputs.map(({ title, text, icon }) => {
            const Icon = iconMap[icon];
            return (
              <div
                key={title}
                className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <h3 className="text-[#1a1a2e] text-base font-semibold mb-1.5">{title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
