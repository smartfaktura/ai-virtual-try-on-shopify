import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

/* ── Assets ── */
const centerProductImg = h('hero-product-croptop.jpg');

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

/* ── Hooks ── */
function usePreload(urls: string[]) {
  useEffect(() => {
    urls.forEach((u) => {
      const img = new Image();
      img.src = getOptimizedUrl(u, { width: 400, quality: 50 });
    });
  }, []);
}

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

/* ── Crossfade stack ── */
function CrossfadeStack({ images, activeIndex }: { images: string[]; activeIndex: number }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={getOptimizedUrl(src, { width: 400, quality: 55 })}
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

/* ── Marquee card ── */
function MarqueeCard({ label, images, delay }: { label: string; images: string[]; delay: number }) {
  const idx = useRotatingIndex(images.length, 1200, delay);
  return (
    <div
      className="relative flex-shrink-0 w-[160px] h-[213px] sm:w-[200px] sm:h-[267px] rounded-2xl overflow-hidden border border-border/60 shadow-md shadow-foreground/[0.04]"
    >
      <CrossfadeStack images={images} activeIndex={idx} />
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── Marquee row ── */
function MarqueeRow({
  cards,
  direction,
  duration,
}: {
  cards: { label: string; images: string[] }[];
  direction: 'left' | 'right';
  duration: string;
}) {
  // Duplicate cards for seamless loop
  const doubled = [...cards, ...cards];
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex gap-3 w-max ${
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

/* ── Main component ── */
export function HomeHero() {
  const allImages = [centerProductImg, ...marqueeCards.flatMap((c) => c.images)];
  usePreload(allImages);

  return (
    <section className="pt-28 pb-16 lg:pt-36 lg:pb-28 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* ── Left — Copy ── */}
        <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
          <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 mb-7">
            AI product visuals
          </span>

          <h1 className="text-foreground text-[2.75rem] sm:text-5xl lg:text-[3.5rem] leading-[1.05] font-semibold tracking-[-0.03em] mb-5">
            One product photo.
            <br />
            <span className="bg-gradient-to-r from-[hsl(var(--foreground))] via-[hsl(215,25%,40%)] to-[hsl(var(--foreground))] bg-clip-text text-transparent">
              Every visual you need.
            </span>
          </h1>

          <p className="text-[17px] leading-relaxed text-muted-foreground mb-9 max-w-md mx-auto lg:mx-0">
            Create product images, social creatives, and short videos — without
            another photoshoot.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5 justify-center lg:justify-start">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/15 w-full sm:w-auto"
            >
              Try it on my product
              <ArrowRight size={16} />
            </Link>
            <a
              href="#examples"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-[15px] font-medium hover:bg-secondary transition-colors w-full sm:w-auto"
            >
              See examples
            </a>
          </div>

          <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium">
            20 free credits · No credit card required
          </p>
        </div>

        {/* ── Right — Marquee ── */}
        <div className="relative flex flex-col gap-3">
          {/* Original photo anchor */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
            <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-background shadow-xl shadow-foreground/10">
              <img
                src={getOptimizedUrl(centerProductImg, { width: 128, quality: 60 })}
                alt="Original product"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="block text-[8px] font-semibold tracking-widest uppercase text-muted-foreground/70 text-center mt-1">
              Your photo
            </span>
          </div>

          <MarqueeRow cards={row1} direction="left" duration="30s" />
          <MarqueeRow cards={row2} direction="right" duration="35s" />
        </div>
      </div>
    </section>
  );
}
