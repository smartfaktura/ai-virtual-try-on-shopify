import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

interface CategoryData {
  label: string;
  original: string;
  cards: { label: string; image: string }[];
}

const CATEGORIES: CategoryData[] = [
  {
    label: 'Fashion & Accessories',
    original: h('hero-product-croptop.jpg'),
    cards: [
      { label: 'Product page', image: h('hero-croptop-studio-lookbook.png') },
      { label: 'Social Media', image: h('hero-croptop-cafe-lifestyle.png') },
      { label: 'Editorial', image: h('hero-croptop-studio-dark.png') },
      { label: 'Ad Creative', image: h('hero-croptop-golden-hour.png') },
      { label: 'UGC Style', image: h('hero-croptop-pilates-studio.png') },
      { label: 'Flat Lay', image: h('hero-croptop-basketball-court.png') },
      { label: 'Lookbook', image: h('hero-croptop-studio-lounge.png') },
      { label: 'Video', image: h('hero-croptop-urban-edge.png') },
      { label: 'Lifestyle', image: h('hero-croptop-golden-hour.png') },
    ],
  },
  {
    label: 'Jewelry',
    original: h('hero-ring-fabric.png'),
    cards: [
      { label: 'Product page', image: h('hero-ring-hand.png') },
      { label: 'Social Media', image: h('hero-ring-golden-light.png') },
      { label: 'Editorial', image: h('hero-ring-portrait.png') },
      { label: 'Ad Creative', image: h('hero-ring-ugc.png') },
      { label: 'UGC Style', image: h('hero-ring-concrete.png') },
      { label: 'Flat Lay', image: h('hero-ring-floating.png') },
      { label: 'Lookbook', image: h('hero-ring-eucalyptus.png') },
      { label: 'Close-up', image: h('hero-ring-fabric.png') },
      { label: 'Lifestyle', image: h('hero-ring-hand.png') },
    ],
  },
  {
    label: 'Beauty & Skincare',
    original: h('hero-hp-desert.png'),
    cards: [
      { label: 'Product page', image: h('hero-hp-elevator.png') },
      { label: 'Social Media', image: h('hero-hp-linen.png') },
      { label: 'Editorial', image: h('hero-hp-studio-seated.png') },
      { label: 'Ad Creative', image: h('hero-hp-desert.png') },
      { label: 'UGC Style', image: h('hero-hp-elevator.png') },
      { label: 'Flat Lay', image: h('hero-hp-linen.png') },
      { label: 'Lookbook', image: h('hero-hp-studio-seated.png') },
      { label: 'Video', image: h('hero-hp-desert.png') },
      { label: 'Lifestyle', image: h('hero-hp-elevator.png') },
    ],
  },
  {
    label: 'Home & Lifestyle',
    original: h('hero-croptop-studio-lookbook.png'),
    cards: [
      { label: 'Product page', image: h('hero-croptop-studio-dark.png') },
      { label: 'Social Media', image: h('hero-ring-golden-light.png') },
      { label: 'Editorial', image: h('hero-hp-studio-seated.png') },
      { label: 'Ad Creative', image: h('hero-croptop-golden-hour.png') },
      { label: 'UGC Style', image: h('hero-ring-concrete.png') },
      { label: 'Flat Lay', image: h('hero-ring-floating.png') },
      { label: 'Lookbook', image: h('hero-hp-linen.png') },
      { label: 'Video', image: h('hero-croptop-urban-edge.png') },
      { label: 'Lifestyle', image: h('hero-hp-desert.png') },
    ],
  },
];

/* ── Shimmer card ── */
function ShimmerCard() {
  return (
    <div className="flex-shrink-0 w-[180px] sm:w-[220px] rounded-2xl overflow-hidden">
      <div className="aspect-[3/4] bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
    </div>
  );
}

/* ── Single image card ── */
function ImageCard({
  label,
  src,
  onLoad,
}: {
  label: string;
  src: string;
  onLoad?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex-shrink-0 w-[160px] sm:w-[240px] lg:w-[260px] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.06]">
      <div className="aspect-[3/4] relative">
        {!loaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
        )}
        <img
          src={getOptimizedUrl(src, { width: 440, quality: 75 })}
          alt={label}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent z-10">
        <span className="text-[11px] font-medium tracking-wide text-white/90">{label}</span>
      </div>
    </div>
  );
}

/* ── Marquee row ── */
function MarqueeRow({
  cards,
  direction,
  duration,
  fadeKey,
}: {
  cards: { label: string; image: string }[];
  direction: 'left' | 'right';
  duration: string;
  fadeKey: string;
}) {
  const doubled = [...cards, ...cards];
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        key={fadeKey}
        className={`flex gap-3 lg:gap-4 w-max ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        } group-hover/marquee:[animation-play-state:paused] animate-fade-in`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((card, i) => (
          <ImageCard key={`${card.label}-${i}`} label={card.label} src={card.image} />
        ))}
      </div>
    </div>
  );
}

/* ── Main section ── */
export function HomeTransformStrip() {
  const { ref, visible } = useScrollReveal();
  const [activeIdx, setActiveIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const active = CATEGORIES[activeIdx];

  const switchCategory = useCallback(
    (idx: number) => {
      if (idx === activeIdx) return;
      setFadeIn(false);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActiveIdx(idx);
        setFadeIn(true);
      }, 200);
    },
    [activeIdx],
  );

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const row1 = active.cards.slice(0, 5);
  const row2 = active.cards.slice(4);

  return (
    <section className="py-16 lg:py-32 bg-background overflow-hidden" id="examples">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-10">
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            From one product photo to every asset you need
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Select a category to preview the kind of visuals you can create.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex justify-center gap-6 mb-10 lg:mb-14 border-b border-border/40">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.label}
              onClick={() => switchCategory(idx)}
              className={`relative pb-3 text-sm transition-colors duration-200 ${
                idx === activeIdx
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
              {idx === activeIdx && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-foreground rounded-full animate-fade-in" />
              )}
            </button>
          ))}
        </div>

        {/* Strip */}
        <div
          ref={ref}
          className={`flex items-center gap-4 lg:gap-6 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Original card */}
          <div className="hidden sm:block shrink-0">
            <div
              className={`relative w-20 lg:w-24 rounded-2xl overflow-hidden shadow-xl shadow-foreground/[0.06] transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
              style={{ aspectRatio: '3/4' }}
            >
              <img
                src={getOptimizedUrl(active.original, { width: 200, quality: 75 })}
                alt="Original product"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/50 to-transparent z-10">
                <span className="text-[8px] font-semibold tracking-widest uppercase text-white/90">
                  Original
                </span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
            <div className="w-6 lg:w-10 h-px bg-border" />
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-border">
              <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
            </svg>
          </div>

          {/* Marquee rows */}
          <div
            className={`flex-1 flex flex-col gap-3 min-w-0 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
          >
            <MarqueeRow cards={row1} direction="left" duration="32s" fadeKey={`r1-${activeIdx}`} />
            <MarqueeRow cards={row2} direction="right" duration="38s" fadeKey={`r2-${activeIdx}`} />
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10 lg:mt-14">
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link to="/auth">
              Try it on my product
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
