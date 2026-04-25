import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { PREVIEW, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * Editorial split hero for /ai-product-photography/{slug} pages.
 * Spacious 5/6 grid: copy left, free-floating staggered 2x2 tile collage right.
 * Falls back to a single full image when no collage data is provided.
 */
export function CategoryHero({ page }: { page: CategoryPage }) {
  const collage = page.heroCollage;
  const hasCollage = collage && collage.length >= 4;

  return (
    <section className="relative bg-[#FAFAF8] overflow-hidden">
      {/* Subtle dotted backdrop for editorial depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 pt-0 pb-14 lg:pb-24">
        <div className="grid lg:grid-cols-[5fr_6fr] gap-12 lg:gap-20 items-center">
          {/* ── Copy column ─────────────────────────────────────────── */}
          <div>
            <h1 className="text-foreground text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-[1.05] font-semibold tracking-[-0.035em] mb-7">
              {page.h1Lead}
              <br />
              <span className="text-[#4a5578]">{page.h1Highlight}</span>
            </h1>

            <p className="flex items-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-4 before:content-[''] before:block before:w-6 before:h-px before:bg-foreground/25 before:mr-3">
              {page.heroEyebrow}
            </p>

            <p className="max-w-xl text-muted-foreground text-base sm:text-lg leading-relaxed mb-9">
              {page.heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/app/generate/product-images"
                className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-7 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Create your first visuals free
                <ArrowRight size={16} />
              </Link>
              <a
                href="#scenes"
                className="inline-flex items-center justify-center h-[3.25rem] px-7 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
              >
                See examples
              </a>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Free to start · No credit card required
            </p>
          </div>

          {/* ── Visual column ───────────────────────────────────────── */}
          {hasCollage ? (
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {/* Left column — slightly raised */}
              <div className="flex flex-col gap-3 lg:gap-4 lg:-translate-y-6">
                <HeroTile tile={collage![0]} priority />
                <HeroTile tile={collage![2]} />
              </div>
              {/* Right column — slightly lowered for editorial stagger */}
              <div className="flex flex-col gap-3 lg:gap-4 lg:translate-y-6">
                <HeroTile tile={collage![1]} priority />
                <HeroTile tile={collage![3]} />
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/5] lg:aspect-[5/6] rounded-2xl overflow-hidden bg-muted/30">
              <img
                src={getOptimizedUrl(PREVIEW(page.heroImageId), { quality: 70 })}
                alt={page.heroAlt}
                loading="eager"
                decoding="async"
                // @ts-expect-error fetchpriority is a valid HTML attribute not in React types
                fetchpriority="high"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute left-4 bottom-4 inline-flex items-center px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md text-[11px] uppercase tracking-[0.16em] text-foreground/85 font-semibold shadow-sm">
                {page.groupName}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroTile({
  tile,
  priority = false,
}: {
  tile: { subCategory: string; imageId: string; alt: string };
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted/40 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
      <img
        src={getOptimizedUrl(PREVIEW(tile.imageId), { quality: 70 })}
        alt={tile.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attribute not in React types
        fetchpriority={priority ? 'high' : 'auto'}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <span className="absolute left-3 bottom-3 inline-flex items-center px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-[10px] uppercase tracking-[0.16em] text-foreground/80 font-semibold">
        {tile.subCategory}
      </span>
    </div>
  );
}
