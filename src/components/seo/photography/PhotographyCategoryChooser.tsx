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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-5">
          {aiProductPhotographyCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={cat.url}
              className="group flex flex-col bg-white rounded-2xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                <img
                  src={getOptimizedUrl(cat.previewImage, { quality: 60 })}
                  alt={cat.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-white/70 font-semibold mb-0.5">
                    {cat.shotCount}+ shots
                  </span>
                  <h3 className="text-white text-base sm:text-lg font-semibold leading-tight">{cat.name}</h3>
                </div>
              </div>
              <div className="flex flex-col flex-1 p-4 lg:p-5">
                <p className="text-[#6b7280] text-[13px] leading-relaxed mb-3 line-clamp-3">{cat.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                  Explore {cat.name}
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
