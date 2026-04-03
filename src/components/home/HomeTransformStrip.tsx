import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

const staticOriginal = h('hero-product-croptop.jpg');

const marqueeCards: { label: string; images: string[] }[] = [
  {
    label: 'Product page',
    images: [h('hero-croptop-studio-lookbook.png'), h('hero-ring-fabric.png'), h('hero-hp-desert.png')],
  },
  {
    label: 'Social Media',
    images: [h('hero-croptop-cafe-lifestyle.png'), h('hero-ring-hand.png'), h('hero-hp-elevator.png')],
  },
  {
    label: 'Editorial',
    images: [h('hero-croptop-studio-dark.png'), h('hero-ring-golden-light.png'), h('hero-hp-studio-seated.png')],
  },
  {
    label: 'Ad Creatives',
    images: [h('hero-croptop-golden-hour.png'), h('hero-ring-portrait.png'), h('hero-croptop-urban-edge.png')],
  },
  {
    label: 'UGC Style',
    images: [h('hero-ring-ugc.png'), h('hero-croptop-pilates-studio.png'), h('hero-ring-concrete.png')],
  },
  {
    label: 'Selfie',
    images: [h('hero-hp-linen.png'), h('hero-croptop-studio-lounge.png'), h('hero-ring-eucalyptus.png')],
  },
  {
    label: 'Flat Lay',
    images: [h('hero-ring-floating.png'), h('hero-croptop-basketball-court.png'), h('hero-ring-fabric.png')],
  },
  {
    label: 'Video',
    images: [h('hero-croptop-golden-hour.png'), h('hero-hp-desert.png'), h('hero-ring-hand.png')],
  },
  {
    label: 'Perspectives',
    images: [h('hero-croptop-studio-lookbook.png'), h('hero-ring-golden-light.png'), h('hero-hp-elevator.png')],
  },
];

const row1 = marqueeCards.slice(0, 5);
const row2 = marqueeCards.slice(4);

function useRotatingIndex(length: number, intervalMs: number, delay = 0) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      intervalId = setInterval(() => setIdx((i) => (i + 1) % length), intervalMs);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [length, intervalMs, delay]);
  return idx;
}

function CrossfadeStack({ images, activeIndex }: { images: string[]; activeIndex: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={getOptimizedUrl(src, { width: 440, quality: 55 })}
          alt=""
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}

function MarqueeCard({ label, images, delay }: { label: string; images: string[]; delay: number }) {
  const idx = useRotatingIndex(images.length, 1200, delay);
  return (
    <div className="relative flex-shrink-0 w-[180px] h-[240px] sm:w-[220px] sm:h-[293px] rounded-2xl overflow-hidden border border-border/60 shadow-md shadow-foreground/[0.04]">
      <CrossfadeStack images={images} activeIndex={idx} />
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent z-10">
        <span className="text-[11px] font-medium tracking-wide text-white/90">
          {label}
        </span>
      </div>
    </div>
  );
}

function MarqueeRow({
  cards,
  direction,
  duration,
}: {
  cards: { label: string; images: string[] }[];
  direction: 'left' | 'right';
  duration: string;
}) {
  const doubled = [...cards, ...cards];
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex gap-3 lg:gap-4 w-max ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        } group-hover/marquee:[animation-play-state:paused]`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((card, i) => (
          <MarqueeCard key={`${card.label}-${i}`} label={card.label} images={card.images} delay={i * 200} />
        ))}
      </div>
    </div>
  );
}

export function HomeTransformStrip() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3] overflow-hidden" id="examples">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            From one product photo to every asset you need
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Use the same product to create store images, social creatives, campaign visuals, and short videos.
          </p>
        </div>

        <div
          ref={ref}
          className={`flex items-center gap-4 lg:gap-6 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Original card */}
          <div className="hidden sm:block shrink-0">
            <div className="relative w-20 lg:w-24 rounded-2xl overflow-hidden border border-border/60 shadow-xl shadow-foreground/[0.06]" style={{ aspectRatio: '3/4' }}>
              <img
                src={getOptimizedUrl(staticOriginal, { width: 200, quality: 55 })}
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
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <MarqueeRow cards={row1} direction="left" duration="32s" />
            <MarqueeRow cards={row2} direction="right" duration="38s" />
          </div>
        </div>
      </div>
    </section>
  );
}
