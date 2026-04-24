import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

/* ── Dresses category showcase: 1 original + 11 dress scene previews ── */
const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';

const ORIGINAL_DRESS = `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/products/1776686889528-b8ysdh.png`;
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const heroImages = [
  { label: 'Original',         src: ORIGINAL_DRESS,                       isOriginal: true },
  { label: 'Editorial',        src: PREVIEW('1776689318257-yahkye') }, // Flash Night Fashion Campaign
  { label: 'Studio',           src: PREVIEW('1776688965090-edaogg') }, // On-Model Front
  { label: 'Lifestyle',        src: PREVIEW('1776840733386-n4bc6x') }, // Greenhouse Elegance
  { label: 'Lookbook',         src: PREVIEW('1776689316419-90khdg') }, // Desert Tailored Walk
  { label: 'Campaign',         src: PREVIEW('1776688403670-i0t3r6') }, // Golden Coast Dress
  { label: 'Outdoor Portrait', src: PREVIEW('1776689319922-8yiolc') }, // Old Money Outdoor Portrait
  { label: 'Flash Glamour',    src: PREVIEW('1776689317300-luvmhd') }, // Flash Glamour Portrait
  { label: 'Architectural',    src: PREVIEW('1776688413055-z73arv') }, // Quiet Luxury Museum Staircase
  { label: 'Mirror Selfie',    src: PREVIEW('1776689320622-0lnst1') }, // Power Mirror Statement Selfie
  { label: 'Studio Look',      src: PREVIEW('1776688404914-wwy92r') }, // Mini Dress Studio Look
  { label: 'Side Lean Pose',   src: PREVIEW('1776689321496-nclkyc') }, // Side Lean Attitude Pose
];

const row1 = heroImages.slice(0, 6);
const row2 = heroImages.slice(6).concat(heroImages.slice(0, 2));

type HeroCard = { label: string; src: string; isOriginal?: boolean };

/* ── Marquee card ── */
function MarqueeCard({ label, src, isOriginal }: HeroCard) {
  return (
    <div
      className={cn(
        'relative flex-shrink-0 w-[180px] sm:w-[210px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04]',
        isOriginal && 'ring-1 ring-foreground/15 bg-[#FAFAF8]',
      )}
    >
      <img
        src={getOptimizedUrl(src, { width: 420, quality: isOriginal ? 70 : 55 })}
        alt={label}
        loading="lazy"
        className={cn(
          'w-full h-full',
          isOriginal ? 'object-contain p-3' : 'object-cover',
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 p-2.5',
          isOriginal
            ? 'bg-gradient-to-t from-white/95 to-transparent'
            : 'bg-gradient-to-t from-black/50 to-transparent',
        )}
      >
        <span
          className={cn(
            'text-[10px] sm:text-[11px] font-medium tracking-wide',
            isOriginal ? 'text-foreground/80' : 'text-white/90',
          )}
        >
          {isOriginal ? '↑ Original photo' : label}
        </span>
      </div>
    </div>
  );
}

/* ── Marquee row ── */
function MarqueeRow({ cards, direction, duration }: {
  cards: HeroCard[];
  direction: 'left' | 'right';
  duration: string;
}) {
  const doubled = [...cards, ...cards];
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex gap-3 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} group-hover/marquee:[animation-play-state:paused]`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((card, i) => (
          <MarqueeCard key={`${card.label}-${i}`} {...card} />
        ))}
      </div>
    </div>
  );
}

/* ── Main component ── */
export function HomeHero() {
  return (
    <section className="pt-24 pb-6 lg:pt-28 lg:pb-10 bg-[#FAFAF8] overflow-hidden">
      {/* ── Centered copy ── */}
      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <h1 className="text-foreground text-[2.75rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-5">
          One product photo.
          <br />
          <span className="text-[#4a5578]">AI creates the rest.</span>
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-6">
          Turn a single product image into product page visuals, social content, and campaign-ready creative in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/15"
          >
            Try it on my product
            <ArrowRight size={16} />
          </Link>
          <a
            href="#examples"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-[15px] font-medium hover:bg-secondary transition-colors"
          >
            See examples
          </a>
        </div>

        <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium">
          20 free credits · No credit card required
        </p>
      </div>

      {/* ── Marquee rows ── */}
      <div className="flex flex-col gap-3">
        <MarqueeRow cards={row1} direction="left" duration="35s" />
        <MarqueeRow cards={row2} direction="right" duration="40s" />
      </div>
    </section>
  );
}
