import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { PREVIEW, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

export function CategoryHero({ page }: { page: CategoryPage }) {
  return (
    <section className="pt-28 pb-16 lg:pt-36 lg:pb-20 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-8"
        >
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} className="opacity-50" />
          <Link to="/ai-product-photography" className="hover:text-foreground transition-colors">
            AI Product Photography
          </Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-foreground/80 font-medium">{page.groupName}</span>
        </nav>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              {page.heroEyebrow}
            </p>
            <h1 className="text-foreground text-[2.25rem] sm:text-[2.75rem] lg:text-[3rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              {page.h1Lead}
              <br />
              <span className="text-[#4a5578]">{page.h1Highlight}</span>
            </h1>

            <p className="max-w-xl text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
              {page.heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/app/generate/product-images"
                className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Create your first visuals free
                <ArrowRight size={16} />
              </Link>
              <a
                href="#scenes"
                className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
              >
                See {page.groupName.toLowerCase()} examples
              </a>
            </div>

            <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-6">
              No photoshoot needed · Built for {page.groupName.toLowerCase()} brands
            </p>
          </div>

          {/* Hero image */}
          <div className="relative aspect-[4/5] lg:aspect-[5/6] rounded-3xl overflow-hidden shadow-xl shadow-foreground/[0.06] bg-muted/30">
            <img
              src={getOptimizedUrl(PREVIEW(page.heroImageId), { quality: 70 })}
              alt={page.heroAlt}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/55 via-black/10 to-transparent">
              <span className="text-[11px] uppercase tracking-[0.16em] text-white/80 font-semibold">
                {page.groupName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
