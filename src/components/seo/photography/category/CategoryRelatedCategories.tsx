import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { PREVIEW, getRelatedPages, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

export function CategoryRelatedCategories({ page }: { page: CategoryPage }) {
  const related = getRelatedPages(page.relatedCategories);

  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Explore more
            </p>
            <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
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
          {related.map((rel) => (
            <Link
              key={rel.slug}
              to={rel.url}
              className="group flex flex-col bg-white rounded-2xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                <img
                  src={getOptimizedUrl(PREVIEW(rel.heroImageId), { quality: 60 })}
                  alt={rel.heroAlt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-col p-5 lg:p-6">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-2">
                  AI Product Photography
                </span>
                <h3 className="text-[#1a1a2e] text-lg font-semibold leading-tight mb-2">
                  {rel.groupName}
                </h3>
                <p className="text-[#6b7280] text-[13px] leading-relaxed mb-4 line-clamp-2">
                  {rel.heroSubheadline}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                  Explore {rel.groupName}
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
