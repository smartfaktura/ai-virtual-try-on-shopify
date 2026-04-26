import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { aiProductPhotographyCategories } from '@/data/aiProductPhotographyCategories';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useSeoVisualOverridesMap } from '@/hooks/useSeoVisualOverrides';
import { resolveSlotImageUrl } from '@/lib/resolveSlotImage';

const PAGE_ROUTE = '/ai-product-photography';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

export function PhotographyCategoryChooser() {
  const overrides = useSeoVisualOverridesMap();

  return (
    <section id="categories" className="py-16 lg:py-32 bg-background scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Categories · 10 product verticals
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Choose your product category
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            VOVV.AI creates category-specific product visuals for fashion, footwear, beauty, fragrance, jewelry, food, home, tech, and more.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {aiProductPhotographyCategories.map((cat) => {
            const thumbs = cat.previewImages.slice(0, 3).map((id, idx) => {
              const slotKey = `categoryThumb_${cat.slug}_${idx + 1}`;
              return resolveSlotImageUrl(overrides, PAGE_ROUTE, slotKey, PREVIEW(id));
            });
            const anchorText = `Explore AI ${cat.name.toLowerCase()} product photography`;
            return (
              <Link
                key={cat.slug}
                to={cat.url}
                aria-label={anchorText}
                title={anchorText}
                className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* Image collage — 2 thumbs on mobile, 3 from sm: up */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-muted/30 p-1 sm:p-1.5">
                  <div className="absolute inset-1 sm:inset-1.5 grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-1.5">
                    {thumbs.map((src, idx) => (
                      <div
                        key={`${cat.slug}-${idx}`}
                        className={`relative overflow-hidden rounded-lg sm:rounded-xl bg-muted/40 ${idx === 2 ? 'hidden sm:block' : ''}`}
                      >
                        <img
                          src={getOptimizedUrl(src, { quality: 60 })}
                          alt={`${cat.name} AI product photography example`}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col p-3.5 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-muted-foreground font-semibold">
                      AI Product Photography
                    </span>
                    <span className="hidden sm:inline text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 font-medium">
                      {cat.shotCount}+ shots
                    </span>
                  </div>
                  <h3 className="text-[#1a1a2e] text-[15px] sm:text-lg font-semibold leading-tight mb-1.5 sm:mb-2">
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block text-muted-foreground text-[13px] leading-relaxed mb-4 line-clamp-2">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-[#1a1a2e] group-hover:gap-2 transition-all">
                    <span className="sm:hidden">Explore {cat.name}</span>
                    <span className="hidden sm:inline">{anchorText}</span>
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
