import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import originalDress from '@/assets/home-hero-original-dress.jpg';
import productVideoLoop from '@/assets/home-create-product-videos.mp4';

/* ── Dresses category showcase: 1 original + 11 dress scene previews ── */
const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';

const ORIGINAL_DRESS = originalDress;
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

type HeroCard = { label: string; src: string; isOriginal?: boolean; isVideo?: boolean };

const heroImages: HeroCard[] = [
  { label: 'Original',         src: ORIGINAL_DRESS,                       isOriginal: true },
  { label: 'Video',            src: productVideoLoop,                     isVideo: true },
  { label: 'Editorial',        src: PREVIEW('1776689318257-yahkye') },
  { label: 'Studio',           src: PREVIEW('1776688965090-edaogg') },
  { label: 'Lifestyle',        src: PREVIEW('1776840733386-n4bc6x') },
  { label: 'Lookbook',         src: PREVIEW('1776689316419-90khdg') },
  { label: 'Campaign',         src: PREVIEW('1776688403670-i0t3r6') },
  { label: 'Outdoor Portrait', src: PREVIEW('1776689319922-8yiolc') },
  { label: 'Flash Glamour',    src: PREVIEW('1776689317300-luvmhd') },
  { label: 'Architectural',    src: PREVIEW('1776688413055-z73arv') },
  { label: 'Mirror Selfie',    src: PREVIEW('1776689320622-0lnst1') },
  { label: 'Studio Look',      src: PREVIEW('1776688404914-wwy92r') },
  { label: 'Side Lean Pose',   src: PREVIEW('1776689321496-nclkyc') },
];

const row1 = heroImages.slice(0, 6);
const row2 = heroImages
  .slice(6)
  .concat(heroImages.slice(0, 2))
  .filter((c) => !c.isVideo);

/* ── Marquee card ── */
function MarqueeCard({ label, src, isOriginal, isVideo }: HeroCard) {
  return (
    <div className="relative flex-shrink-0 w-[180px] sm:w-[210px] aspect-[3/4] rounded-2xl overflow-hidden shadow-sm shadow-foreground/[0.04] bg-muted/30">
      {isVideo ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={isOriginal ? src : getOptimizedUrl(src, { quality: 60 })}
          alt={label}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      )}
      {isOriginal && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
          Original
        </span>
      )}
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">
          {label}
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
    <section className="pt-28 pb-6 lg:pt-36 lg:pb-10 bg-[#FAFAF8] overflow-hidden">
      {/* ── Centered copy — unified header pattern ── */}
      <div className="max-w-2xl mx-auto px-6 text-center mb-12 lg:mb-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          AI Visual Studio
        </p>
        <h1 className="text-foreground text-[2.75rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-5">
          One product photo.
          <br />
          <span className="text-muted-foreground">AI creates the rest.</span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
          Turn a single product image into product page visuals, social content, and campaign-ready creative in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold shadow-lg shadow-primary/25">
            <Link to="/auth">
              Try it on my product
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-[3.25rem] px-8 text-base font-semibold">
            <a href="#examples">See examples</a>
          </Button>
        </div>

        <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8">
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
