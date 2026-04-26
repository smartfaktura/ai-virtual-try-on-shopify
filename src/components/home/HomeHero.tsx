import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
// Row 2 starts after row 1 and excludes the video so it never repeats.
const row2 = heroImages
  .slice(6)
  .concat(heroImages.slice(0, 2))
  .filter((c) => !c.isVideo);

/* ── Marquee card ── */
function MarqueeCard({ label, src, isOriginal, isVideo }: HeroCard) {
  return (
    <div className="relative flex-shrink-0 w-[180px] sm:w-[210px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-muted/30">
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
        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-foreground/80 text-background px-2 py-0.5 rounded-full">
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

/* ── Typewriter for the hero subline ── */
const TYPED_PHRASES = [
  'For E-commerce Brands.',
  'From One Product Photo.',
  'Product Page Ready.',
  'Ads That Convert.',
  'Every Scene. Every Angle.',
  'No Photoshoot Needed.',
];

function HeroTypewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const full = TYPED_PHRASES[phraseIdx];

    if (reduceMotion) {
      setText(full);
      const t = setTimeout(() => setPhraseIdx((i) => (i + 1) % TYPED_PHRASES.length), 2400);
      return () => clearTimeout(t);
    }

    if (phase === 'typing') {
      if (text.length < full.length) {
        const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 55);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('holding'), 1600);
      return () => clearTimeout(t);
    }
    if (phase === 'holding') {
      const t = setTimeout(() => setPhase('deleting'), 0);
      return () => clearTimeout(t);
    }
    if (phase === 'deleting') {
      if (text.length > 0) {
        const t = setTimeout(() => setText(full.slice(0, text.length - 1)), 28);
        return () => clearTimeout(t);
      }
      setPhraseIdx((i) => (i + 1) % TYPED_PHRASES.length);
      setPhase('typing');
    }
  }, [text, phase, phraseIdx, reduceMotion]);

  return (
    <span
      className="text-[#4a5578] inline-block whitespace-nowrap min-h-[1.15em] align-baseline"
      aria-live="polite"
    >
      {text}
      <span
        className="inline-block w-[3px] h-[0.85em] bg-[#4a5578] ml-0.5 align-middle animate-[blink_1s_step-end_infinite]"
        aria-hidden
      />
    </span>
  );
}

/* ── Main component ── */
export function HomeHero() {
  return (
    <section className="pt-28 pb-6 lg:pt-36 lg:pb-10 bg-[#FAFAF8] overflow-hidden">
      {/* ── Centered copy ── */}
      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] font-semibold text-foreground tracking-[-0.03em] leading-[1.08] mb-6">
          <span>AI Product Visuals.</span>
          <br />
          <HeroTypewriter />
        </h1>

        <p className="hidden sm:block text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Turn one product photo into product page images, lifestyle visuals, ads, and campaign-ready creative — built for e-commerce brands.
        </p>
        <p className="sm:hidden text-[15px] text-muted-foreground max-w-xs mx-auto mb-8 leading-relaxed">
          One product photo. Ads, product pages, lifestyle, campaigns — built for e-commerce brands.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Try It On My Product
            <ArrowRight size={16} />
          </Link>
          <a
            href="#examples"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
          >
            See Real Examples
          </a>
        </div>

        <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8">
          20 free credits · No credit card required · Start in seconds
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
