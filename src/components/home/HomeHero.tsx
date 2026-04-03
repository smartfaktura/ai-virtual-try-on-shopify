import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

/* ── Assets ── */
const centerProductImg = h('hero-product-croptop.jpg');

const cardSets: { label: string; images: string[] }[] = [
  {
    label: 'Product page',
    images: [
      h('hero-croptop-studio-lookbook.png'),
      h('hero-ring-fabric.png'),
      h('hero-hp-desert.png'),
      h('hero-croptop-golden-hour.png'),
      h('hero-ring-portrait.png'),
    ],
  },
  {
    label: 'Social ad',
    images: [
      h('hero-croptop-cafe-lifestyle.png'),
      h('hero-ring-hand.png'),
      h('hero-hp-elevator.png'),
      h('hero-croptop-urban-edge.png'),
      h('hero-ring-ugc.png'),
    ],
  },
  {
    label: 'Lifestyle',
    images: [
      h('hero-croptop-pilates-studio.png'),
      h('hero-ring-concrete.png'),
      h('hero-hp-linen.png'),
      h('hero-croptop-studio-lounge.png'),
      h('hero-ring-eucalyptus.png'),
    ],
  },
  {
    label: 'Editorial',
    images: [
      h('hero-croptop-studio-dark.png'),
      h('hero-ring-golden-light.png'),
      h('hero-hp-studio-seated.png'),
      h('hero-ring-floating.png'),
      h('hero-croptop-basketball-court.png'),
    ],
  },
  {
    label: 'Video',
    images: [
      h('hero-croptop-golden-hour.png'),
      h('hero-hp-desert.png'),
      h('hero-ring-hand.png'),
      h('hero-croptop-pilates-studio.png'),
      h('hero-ring-golden-light.png'),
    ],
  },
];

/* ── Preload images ── */
function usePreload(urls: string[]) {
  useEffect(() => {
    urls.forEach((u) => {
      const img = new Image();
      img.src = getOptimizedUrl(u, { width: 400, quality: 50 });
    });
  }, []);
}

/* ── Rotating index hook ── */
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

/* ── Crossfade image stack ── */
function CrossfadeStack({ images, activeIndex, className = '' }: { images: string[]; activeIndex: number; className?: string }) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
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

/* ── Output card ── */
function OutputCard({
  label,
  images,
  delay,
  rotate,
}: {
  label: string;
  images: string[];
  delay: number;
  rotate: string;
}) {
  const idx = useRotatingIndex(images.length, 1000, delay);

  return (
    <div
      className={`group relative w-full rounded-2xl overflow-hidden border border-border/60 shadow-md shadow-foreground/[0.04] ${rotate} transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg`}
      style={{ aspectRatio: '3/4' }}
    >
      <CrossfadeStack images={images} activeIndex={idx} />
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
        <span className="text-[11px] font-medium tracking-wide text-white/90">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function HomeHero() {
  // Preload all images
  const allImages = [
    centerProductImg,
    ...cardSets.flatMap((c) => c.images),
  ];
  usePreload(allImages);

  // Layout: left column 2 cards, center original, right column 3 cards
  const leftCards = cardSets.slice(0, 2);
  const rightCards = cardSets.slice(2);
  const rotationsLeft = ['-rotate-2', 'rotate-1'];
  const rotationsRight = ['rotate-2', '-rotate-1', 'rotate-1'];

  return (
    <section className="pt-28 pb-16 lg:pt-36 lg:pb-28 bg-[#FAFAF8]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
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

        {/* ── Right — Bento grid ── */}
        <div className="relative grid grid-cols-[1fr_1.2fr_1fr] gap-3 lg:gap-4 min-h-[420px] lg:min-h-[520px]">
          {/* Left column — 2 cards */}
          <div className="flex flex-col gap-3 justify-center">
            {leftCards.map((card, i) => (
              <OutputCard
                key={card.label}
                label={card.label}
                images={card.images}
                delay={i * 150}
                rotate={rotationsLeft[i]}
              />
            ))}
          </div>

          {/* Center "Original" card */}
          <div className="flex items-center justify-center">
            <div className="relative w-full rounded-3xl overflow-hidden border border-border/70 shadow-xl shadow-foreground/[0.06]" style={{ aspectRatio: '3/4.5' }}>
              <img
                src={getOptimizedUrl(centerProductImg, { width: 400, quality: 55 })}
                alt="Original product"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <span className="text-xs font-medium text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  Original
                </span>
              </div>
            </div>
          </div>

          {/* Right column — 3 cards */}
          <div className="flex flex-col gap-3 justify-center">
            {rightCards.map((card, i) => (
              <OutputCard
                key={card.label}
                label={card.label}
                images={card.images}
                delay={300 + i * 150}
                rotate={rotationsRight[i]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
