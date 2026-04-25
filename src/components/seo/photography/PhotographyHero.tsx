import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

type Tile = { label: string; src: string };

const row1: Tile[] = [
  { label: 'Product page', src: PREVIEW('1776688965090-edaogg') },
  { label: 'Lifestyle', src: PREVIEW('1776840733386-n4bc6x') },
  { label: 'Ad creative', src: PREVIEW('1776689318257-yahkye') },
  { label: 'Campaign', src: PREVIEW('1776688403670-i0t3r6') },
  { label: 'Detail shot', src: PREVIEW('closeup-detail-shoes-sneakers-1776008260513') },
  { label: 'Banner', src: PREVIEW('1776688413055-z73arv') },
];

const row2: Tile[] = [
  { label: 'Product page', src: PREVIEW('1776770347820-s3qwmr') },
  { label: 'Lifestyle', src: PREVIEW('1776239449949-ygljai') },
  { label: 'Ad creative', src: PREVIEW('1776018020221-aehe8n') },
  { label: 'Campaign', src: PREVIEW('1776102204479-9rlc0n') },
  { label: 'Detail shot', src: PREVIEW('1776018015756-3xfquh') },
  { label: 'Banner', src: PREVIEW('1776102181320-jisnae') },
];

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
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">
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
        <MarqueeRow tiles={row1} direction="left" duration="35s" />
        <MarqueeRow tiles={row2} direction="right" duration="40s" />
      </div>
    </section>
  );
}
