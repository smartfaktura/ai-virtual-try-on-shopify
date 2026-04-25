import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { aiProductPhotographyCategories } from '@/data/aiProductPhotographyCategories';
import { getOptimizedUrl } from '@/lib/imageOptimization';

export function PhotographyCategoryChooser() {
  return (
    <section id="categories" className="py-16 lg:py-32 bg-background scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Choose your category
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Choose your product category
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            VOVV.AI creates category-specific product visuals for fashion, footwear, beauty, fragrance, jewelry, food, home, tech, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiProductPhotographyCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={cat.url}
              className="group flex flex-col bg-white rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                <img
                  src={getOptimizedUrl(cat.previewImage, { quality: 60 })}
                  alt={cat.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col flex-1 p-6 lg:p-7">
                <h3 className="text-[#1a1a2e] text-xl font-semibold mb-2">{cat.name}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-4">{cat.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="text-[11px] font-medium text-muted-foreground bg-muted/60 border border-border/40 rounded-full px-2.5 py-1"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                  Explore {cat.name}
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
