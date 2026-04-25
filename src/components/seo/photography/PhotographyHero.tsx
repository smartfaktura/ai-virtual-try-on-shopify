import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

type Tile = { label: string; src: string };

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

// Curated, dynamic editorial set — intentionally distinct from the category
// chooser and scene library sections to give the hero its own visual identity.
const allTiles: Tile[] = [
  { label: 'Volcanic Sunset',    src: PREVIEW('repeated-shadow-grid-fragrance-1776013389735') },
  { label: 'Cliffside Walk',     src: PREVIEW('1776574208384-fmg2u3') },
  { label: 'Golden Horizon',     src: PREVIEW('1776574228066-oyklfz') },
  { label: 'Sunset Drive',       src: PREVIEW('1776102204479-9rlc0n') },
  { label: 'Movement Shot',      src: PREVIEW('1776690212460-cq4xnb') },
  { label: 'Office Flash',       src: PREVIEW('editorial-office-flash-eyewear-1776150153576') },
  { label: 'Yacht Bow',          src: PREVIEW('1776524132929-q8upyp') },
  { label: 'Dark Elegance',      src: PREVIEW('1776018020221-aehe8n') },
  { label: 'Old Money Portrait', src: PREVIEW('1776691906436-3fe7l9') },
  { label: 'Studio Hero',        src: PREVIEW('1776770347820-s3qwmr') },
  { label: 'Beauty Closeup',     src: PREVIEW('beauty-closeup-oversized-eyewear-1776150210659') },
  { label: 'Soft Volume Lean',   src: PREVIEW('1776691911049-gsxycu') },
];

const mid = Math.ceil(allTiles.length / 2);
const row1: Tile[] = allTiles.slice(0, mid);
const row2: Tile[] = allTiles.slice(mid);

function Tile({ tile }: { tile: Tile }) {
  return (
    <div className="relative flex-shrink-0 w-[180px] sm:w-[210px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-muted/30">
      <img
        src={getOptimizedUrl(tile.src, { quality: 60 })}
        alt={`AI product photography example: ${tile.label}`}
        loading="lazy"
        decoding="async"
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

function MarqueeRow({ tiles, direction, duration }: { tiles: Tile[]; direction: 'left' | 'right'; duration: string }) {
  const doubled = [...tiles, ...tiles];
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex gap-3 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} group-hover/marquee:[animation-play-state:paused]`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((t, i) => (
          <Tile key={`${t.label}-${i}`} tile={t} />
        ))}
      </div>
    </div>
  );
}

export function PhotographyHero() {
  return (
    <section className="pt-28 pb-6 lg:pt-36 lg:pb-10 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          AI Product Photography
        </p>
        <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
          AI Product Photography Generator
          <br />
          <span className="text-[#4a5578]">for E-commerce Brands</span>
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
          Turn one product photo into product page images, lifestyle visuals, social content, ads, and campaign-ready creative in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/app/generate/product-images"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Create your first visuals free
            <ArrowRight size={16} />
          </Link>
          <a
            href="#categories"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
          >
            Explore categories
          </a>
        </div>

        <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8">
          No photoshoot needed · Built for e-commerce brands · Create from one product photo
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <MarqueeRow tiles={row1} direction="left" duration="50s" />
        <MarqueeRow tiles={row2} direction="right" duration="55s" />
      </div>
    </section>
  );
}
