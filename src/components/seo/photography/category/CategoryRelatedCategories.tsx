import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SmartImage } from './SmartImage';
import { PREVIEW, getRelatedPages, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * Pick 3 unique imageIds that best preview the variety inside a related category.
 * Order of preference:
 *   1. Hero collage tiles (already curated multi-subcategory shots)
 *   2. First scene examples
 *   3. Hero image as a final filler
 */
function getRelatedThumbs(rel: CategoryPage): { id: string; alt: string }[] {
  const picks: { id: string; alt: string }[] = [];
  const seen = new Set<string>();

  const push = (id?: string, alt?: string) => {
    if (!id || seen.has(id) || picks.length >= 3) return;
    seen.add(id);
    picks.push({ id, alt: alt ?? rel.heroAlt });
  };

  rel.heroCollage?.forEach((t) => push(t.imageId, t.alt));
  rel.sceneExamples.forEach((s) => push(s.imageId, s.alt));
  push(rel.heroImageId, rel.heroAlt);

  return picks.slice(0, 3);
}

export function CategoryRelatedCategories({ page }: { page: CategoryPage }) {
  const related = getRelatedPages(page.relatedCategories);

  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Explore more
            </p>
            <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Related product photography categories
            </h2>
          </div>
          <Link
            to="/ai-product-photography"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2 transition-all self-start sm:self-end"
          >
            All AI product photography categories
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {related.map((rel) => {
            const thumbs = getRelatedThumbs(rel);
            return (
              <Link
                key={rel.slug}
                to={rel.url}
                className="group flex flex-col bg-white rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* 3-image horizontal collage */}
                <div className="relative aspect-[16/9] bg-muted/30 p-1.5">
                  <div className="absolute inset-1.5 grid grid-cols-3 gap-1.5">
                    {thumbs.map((t, idx) => (
                      <div
                        key={`${t.id}-${idx}`}
                        className="relative overflow-hidden rounded-xl bg-muted/40"
                      >
                        <SmartImage
                          src={getOptimizedUrl(PREVIEW(t.id), { quality: 55 })}
                          alt={t.alt}
                          imgClassName="transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col p-5 lg:p-6">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-2">
                    AI Product Photography
                  </span>
                  <h3 className="text-foreground text-lg font-semibold leading-tight mb-2">
                    {rel.groupName}
                  </h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 line-clamp-2">
                    {rel.heroSubheadline}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Explore {rel.groupName}
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
