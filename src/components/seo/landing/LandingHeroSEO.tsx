import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useSeoVisualOverridesMap } from '@/hooks/useSeoVisualOverrides';
import { resolveSlotImageUrl, resolveSlotAlt } from '@/lib/resolveSlotImage';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

export interface HeroTile {
  /** Either a scene-preview id (we will resolve via PREVIEW) or a full URL. */
  id: string;
  label: string;
}

export interface LandingHeroSEOProps {
  eyebrow: string;
  headline: React.ReactNode;
  subheadline: string;
  trustLine: string;
  primaryCta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  tiles: HeroTile[];
  altPrefix: string;
  pageId?: string;
  /** Route key used to look up overrides in seo_page_visuals (e.g. "/etsy-product-photography-ai"). */
  pageRoute?: string;
}

function Tile({
  tile,
  resolvedSrc,
  resolvedAlt,
  eager = false,
  highPriority = false,
}: {
  tile: HeroTile;
  altPrefix: string;
  resolvedSrc: string;
  resolvedAlt: string;
  eager?: boolean;
  highPriority?: boolean;
}) {
  // Marquee tiles are fixed at 180–210 CSS px; a single 420×560 retina-grade
  // URL is sharper than a 3-width srcSet and avoids ~80 extra Supabase render
  // candidates the browser would otherwise evaluate per page load.
  return (
    <div className="relative flex-shrink-0 w-[180px] sm:w-[210px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-muted/30">
      <img
        src={getOptimizedUrl(resolvedSrc, { width: 420, height: 560, quality: 72, resize: 'cover' })}
        alt={resolvedAlt}
        width={210}
        height={280}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={highPriority ? 'high' : 'low'}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/55 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/95">
          {tile.label}
        </span>
      </div>
    </div>
  );
}

interface ResolvedTile {
  tile: HeroTile;
  src: string;
  alt: string;
  /** Original index in the full `tiles[]` array (0-based). */
  baseIndex: number;
}

function MarqueeRow({
  tiles,
  direction,
  duration,
  altPrefix,
  eager = false,
}: {
  tiles: ResolvedTile[];
  direction: 'left' | 'right';
  duration: string;
  altPrefix: string;
  eager?: boolean;
}) {
  // Repeat tiles enough times so each HALF of the marquee track (50% width)
  // overflows even ultra-wide viewports. With ≥5 unique tiles, 2 repeats =
  // 10 × 210px = 2100px per half — comfortably wider than any viewport.
  // Smaller tile sets keep 4 repeats so the seam math still holds.
  const REPEATS = tiles.length >= 5 ? 2 : 4;
  const repeated = Array.from({ length: REPEATS }, () => tiles).flat();
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex gap-3 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} group-hover/marquee:[animation-play-state:paused] [will-change:transform] [backface-visibility:hidden]`}
        style={{ animationDuration: duration }}
      >
        {repeated.map((rt, i) => (
          <Tile
            key={`${rt.tile.label}-${i}`}
            tile={rt.tile}
            altPrefix={altPrefix}
            resolvedSrc={rt.src}
            resolvedAlt={rt.alt}
            eager={eager && i === 0}
            highPriority={eager && i === 0}
          />
        ))}
      </div>
    </div>
  );
}

export function LandingHeroSEO({
  eyebrow,
  headline,
  subheadline,
  trustLine,
  primaryCta,
  secondaryCta,
  tiles,
  altPrefix,
  pageId,
  pageRoute,
}: LandingHeroSEOProps) {
  const overrides = useSeoVisualOverridesMap();

  const resolved: ResolvedTile[] = tiles.map((tile, i) => {
    const fallbackSrc = tile.id.startsWith('http') ? tile.id : PREVIEW(tile.id);
    const fallbackAlt = `${altPrefix}: ${tile.label}`;
    if (!pageRoute) {
      return { tile, src: fallbackSrc, alt: fallbackAlt, baseIndex: i };
    }
    const slotKey = `heroTile${i + 1}`;
    return {
      tile,
      src: resolveSlotImageUrl(overrides, pageRoute, slotKey, fallbackSrc),
      alt: resolveSlotAlt(overrides, pageRoute, slotKey, fallbackAlt),
      baseIndex: i,
    };
  });

  const mid = Math.ceil(resolved.length / 2);
  const row1 = resolved.slice(0, mid);
  let row2 = resolved.slice(mid);
  // Pad row2 from row1 so both rows have identical length and seam math.
  if (row2.length < row1.length && row1.length > 0) {
    const need = row1.length - row2.length;
    for (let i = 0; i < need; i++) row2.push(row1[i % row1.length]);
  }

  return (
    <section className="pt-28 pb-6 lg:pt-36 lg:pb-10 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          {eyebrow}
        </p>
        <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
          {headline}
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={primaryCta.to}
            data-cta="hero-primary"
            data-page={pageId}
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            {primaryCta.label}
            <ArrowRight size={16} />
          </Link>
          {secondaryCta && (
            <Link
              to={secondaryCta.to}
              data-cta="hero-secondary"
              data-page={pageId}
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>

        <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8">
          {trustLine}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <MarqueeRow tiles={row1} direction="left" duration="50s" altPrefix={altPrefix} eager />
        <MarqueeRow tiles={row2} direction="right" duration="55s" altPrefix={altPrefix} />
      </div>
    </section>
  );
}
