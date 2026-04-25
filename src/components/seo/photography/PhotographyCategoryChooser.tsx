import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { aiProductPhotographyCategories } from '@/data/aiProductPhotographyCategories';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {aiProductPhotographyCategories.map((cat) => {
            const thumbs = cat.previewImages.slice(0, 3);
            return (
              <Link
                key={cat.slug}
                to={cat.url}
                className="group flex flex-col bg-white rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* 3-image horizontal collage */}
                <div className="relative aspect-[16/9] bg-muted/30 p-1.5">
                  <div className="absolute inset-1.5 grid grid-cols-3 gap-1.5">
                    {thumbs.map((id, idx) => (
                      <div
                        key={`${id}-${idx}`}
                        className="relative overflow-hidden rounded-xl bg-muted/40"
                      >
                        <img
                          src={getOptimizedUrl(PREVIEW(id), { quality: 60 })}
                          alt={`${cat.name} AI product photography example`}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                      AI Product Photography
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 font-medium">
                      {cat.shotCount}+ shots
                    </span>
                  </div>
                  <h3 className="text-foreground text-lg font-semibold leading-tight mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 line-clamp-2">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Explore {cat.name}
                    <ArrowUpRight size={12} />
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
