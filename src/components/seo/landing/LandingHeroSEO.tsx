import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

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
}

function Tile({
  tile,
  altPrefix,
  eager = false,
  highPriority = false,
}: {
  tile: HeroTile;
  altPrefix: string;
  eager?: boolean;
  highPriority?: boolean;
}) {
  const src = tile.id.startsWith('http') ? tile.id : PREVIEW(tile.id);
  return (
    <div className="relative flex-shrink-0 w-[180px] sm:w-[210px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-muted/30">
      <img
        src={getOptimizedUrl(src, { quality: 60 })}
        alt={`${altPrefix}: ${tile.label}`}
        width={210}
        height={280}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(highPriority ? { fetchpriority: 'high' as 'high' } : {})}
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

function MarqueeRow({
  tiles,
  direction,
  duration,
  altPrefix,
  eager = false,
}: {
  tiles: HeroTile[];
  direction: 'left' | 'right';
  duration: string;
  altPrefix: string;
  eager?: boolean;
}) {
  const doubled = [...tiles, ...tiles];
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex gap-3 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} group-hover/marquee:[animation-play-state:paused]`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((t, i) => (
          <Tile
            key={`${t.label}-${i}`}
            tile={t}
            altPrefix={altPrefix}
            eager={eager && i < tiles.length}
            highPriority={eager && i < 2}
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
}: LandingHeroSEOProps) {
  const mid = Math.ceil(tiles.length / 2);
  const row1 = tiles.slice(0, mid);
  const row2 = tiles.slice(mid);

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
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            {primaryCta.label}
            <ArrowRight size={16} />
          </Link>
          {secondaryCta && (
            <Link
              to={secondaryCta.to}
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
        <MarqueeRow tiles={row1} direction="left" duration="50s" altPrefix={altPrefix} />
        <MarqueeRow tiles={row2} direction="right" duration="55s" altPrefix={altPrefix} />
      </div>
    </section>
  );
}
