import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl, getResizedSrcSet } from '@/lib/imageOptimization';
import { PREVIEW, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { useSeoVisualOverridesMap } from '@/hooks/useSeoVisualOverrides';
import { resolveSlotImageUrl, resolveSlotAlt } from '@/lib/resolveSlotImage';
import { SmartImage } from './SmartImage';


/**
 * Editorial split hero for /ai-product-photography/{slug} pages.
 * Spacious 5/6 grid: copy left, free-floating staggered 2x2 tile collage right.
 * Falls back to a single full image when no collage data is provided.
 *
 * Reads admin overrides from /app/admin/seo-page-visuals for the slots
 * `heroMain` (single-image variant) and `heroCollage1`…`heroCollage4` (collage).
 */
export function CategoryHero({ page }: { page: CategoryPage }) {
  const overrides = useSeoVisualOverridesMap();
  const collage = page.heroCollage;
  const hasCollage = collage && collage.length >= 4;

  const heroMainSrc = resolveSlotImageUrl(
    overrides,
    page.url,
    'heroMain',
    PREVIEW(page.heroImageId),
  );
  const heroMainAlt = resolveSlotAlt(overrides, page.url, 'heroMain', page.heroAlt);

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
            <h1 className="text-[#1a1a2e] text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-[1.05] font-semibold tracking-[-0.035em] mb-7">
              {page.h1Lead}
              <br />
              <span className="text-[#4a5578]">{page.h1Highlight}</span>
            </h1>

            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-4">
              {page.heroEyebrow}
            </p>

            <p className="max-w-xl text-muted-foreground text-base sm:text-lg leading-relaxed mb-9">
              {page.heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/app/generate/product-images"
                className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Try it free
                <ArrowRight size={16} />
              </Link>
              <a
                href="#scenes"
                className="inline-flex items-center justify-center h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
              >
                See examples
              </a>
            </div>

            <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] font-medium tracking-[-0.005em] text-muted-foreground/70">
              <li>Free to start</li>
              <li aria-hidden className="hidden sm:block h-3 w-px bg-border" />
              <li>No credit card</li>
              <li aria-hidden className="hidden sm:block h-3 w-px bg-border" />
              <li>Cancel anytime</li>
            </ul>
          </div>

          {/* ── Visual column ───────────────────────────────────────── */}
          {hasCollage ? (
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="flex flex-col gap-3 lg:gap-4">
                <HeroTile tile={collage![0]} index={0} pageRoute={page.url} overrides={overrides} priority />
                <HeroTile tile={collage![2]} index={2} pageRoute={page.url} overrides={overrides} />
              </div>
              <div className="flex flex-col gap-3 lg:gap-4 lg:translate-y-8">
                <HeroTile tile={collage![1]} index={1} pageRoute={page.url} overrides={overrides} priority />
                <HeroTile tile={collage![3]} index={3} pageRoute={page.url} overrides={overrides} />
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/5] lg:aspect-[5/6] rounded-2xl overflow-hidden bg-muted/30">
              <SmartImage
                src={getOptimizedUrl(heroMainSrc, { width: 1120, height: 1400, quality: 85, resize: 'cover' })}
                srcSet={getResizedSrcSet(heroMainSrc, { widths: [640, 900, 1120, 1400], aspect: [4, 5], quality: 85 })}
                sizes="(max-width: 1024px) 92vw, 560px"
                alt={heroMainAlt}
                priority
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
  index,
  pageRoute,
  overrides,
  priority = false,
}: {
  tile: { subCategory: string; imageId: string; alt: string };
  index: number;
  pageRoute: string;
  overrides: ReturnType<typeof useSeoVisualOverridesMap>;
  priority?: boolean;
}) {
  const slotKey = `heroCollage${index + 1}`;
  const src = resolveSlotImageUrl(overrides, pageRoute, slotKey, PREVIEW(tile.imageId));
  const alt = resolveSlotAlt(overrides, pageRoute, slotKey, tile.alt);
  return (
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted/40 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
      <SmartImage
        src={getOptimizedUrl(src, { width: 640, height: 800, quality: 75, resize: 'cover' })}
        srcSet={getResizedSrcSet(src, { widths: [360, 540, 720], aspect: [4, 5], quality: 75 })}
        sizes="(max-width: 1024px) 45vw, 280px"
        alt={alt}
        priority={priority}
      />
      <span className="absolute left-3 bottom-3 inline-flex items-center px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-[10px] uppercase tracking-[0.16em] text-foreground/80 font-semibold">
        {tile.subCategory}
      </span>
    </div>
  );
}
