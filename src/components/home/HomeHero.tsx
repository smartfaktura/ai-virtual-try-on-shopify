import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

/* ── Category definitions ── */
type CategoryKey = 'fashion' | 'jewelry' | 'home' | 'beauty';

const categories: { key: CategoryKey; label: string; productImg: string }[] = [
  { key: 'fashion', label: 'Fashion & Accessories', productImg: h('hero-product-croptop.jpg') },
  { key: 'jewelry', label: 'Jewelry', productImg: h('hero-ring-fabric.png') },
  { key: 'home', label: 'Home & Lifestyle', productImg: h('hero-hp-desert.png') },
  { key: 'beauty', label: 'Beauty & Skincare', productImg: h('hero-croptop-cafe-lifestyle.png') },
];

const outputLabels = ['Product page', 'Social Media', 'Editorial', 'Ad Creatives', 'UGC Style', 'Selfie', 'Flat Lay', 'Video', 'Perspectives'] as const;

const categoryImages: Record<CategoryKey, string[][]> = {
  fashion: [
    [h('hero-croptop-studio-lookbook.png'), h('hero-croptop-cafe-lifestyle.png')],
    [h('hero-croptop-cafe-lifestyle.png'), h('hero-croptop-golden-hour.png')],
    [h('hero-croptop-studio-dark.png'), h('hero-croptop-studio-lounge.png')],
    [h('hero-croptop-golden-hour.png'), h('hero-croptop-urban-edge.png')],
    [h('hero-croptop-pilates-studio.png'), h('hero-croptop-studio-lookbook.png')],
    [h('hero-croptop-studio-lounge.png'), h('hero-croptop-studio-dark.png')],
    [h('hero-croptop-basketball-court.png'), h('hero-croptop-golden-hour.png')],
    [h('hero-croptop-golden-hour.png'), h('hero-croptop-urban-edge.png')],
    [h('hero-croptop-studio-lookbook.png'), h('hero-croptop-cafe-lifestyle.png')],
  ],
  jewelry: [
    [h('hero-ring-fabric.png'), h('hero-ring-hand.png')],
    [h('hero-ring-hand.png'), h('hero-ring-golden-light.png')],
    [h('hero-ring-golden-light.png'), h('hero-ring-portrait.png')],
    [h('hero-ring-portrait.png'), h('hero-ring-ugc.png')],
    [h('hero-ring-ugc.png'), h('hero-ring-concrete.png')],
    [h('hero-ring-concrete.png'), h('hero-ring-eucalyptus.png')],
    [h('hero-ring-floating.png'), h('hero-ring-fabric.png')],
    [h('hero-ring-eucalyptus.png'), h('hero-ring-hand.png')],
    [h('hero-ring-golden-light.png'), h('hero-ring-floating.png')],
  ],
  home: [
    [h('hero-hp-desert.png'), h('hero-hp-elevator.png')],
    [h('hero-hp-elevator.png'), h('hero-hp-linen.png')],
    [h('hero-hp-studio-seated.png'), h('hero-hp-desert.png')],
    [h('hero-hp-desert.png'), h('hero-hp-elevator.png')],
    [h('hero-hp-linen.png'), h('hero-hp-studio-seated.png')],
    [h('hero-hp-linen.png'), h('hero-hp-desert.png')],
    [h('hero-hp-elevator.png'), h('hero-hp-linen.png')],
    [h('hero-hp-desert.png'), h('hero-hp-studio-seated.png')],
    [h('hero-hp-studio-seated.png'), h('hero-hp-elevator.png')],
  ],
  beauty: [
    [h('hero-croptop-cafe-lifestyle.png'), h('hero-ring-eucalyptus.png')],
    [h('hero-ring-eucalyptus.png'), h('hero-croptop-studio-lounge.png')],
    [h('hero-croptop-studio-lounge.png'), h('hero-hp-linen.png')],
    [h('hero-hp-linen.png'), h('hero-croptop-pilates-studio.png')],
    [h('hero-croptop-pilates-studio.png'), h('hero-ring-concrete.png')],
    [h('hero-ring-concrete.png'), h('hero-croptop-cafe-lifestyle.png')],
    [h('hero-croptop-golden-hour.png'), h('hero-ring-eucalyptus.png')],
    [h('hero-ring-portrait.png'), h('hero-croptop-studio-dark.png')],
    [h('hero-croptop-studio-dark.png'), h('hero-hp-linen.png')],
  ],
};

/* ── Hooks ── */
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
    <div className="relative flex-shrink-0 w-[160px] h-[213px] sm:w-[200px] sm:h-[267px] rounded-2xl overflow-hidden border border-border/60 shadow-md shadow-foreground/[0.04]">
      <CrossfadeStack images={images} activeIndex={idx} />
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">{label}</span>
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
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('fashion');

  const activeCat = categories.find((c) => c.key === activeCategory)!;
  const images = categoryImages[activeCategory];

  const marqueeCards = outputLabels.map((label, i) => ({
    label,
    images: images[i],
  }));

  const row1 = marqueeCards.slice(0, 5);
  const row2 = marqueeCards.slice(4);

  return (
    <section className="pt-24 pb-12 lg:pt-32 lg:pb-24 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
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

        {/* ── Right — Marquee with controls ── */}
        <div className="flex flex-col gap-4">
          {/* Your photo + category pills */}
          <div className="flex items-end gap-4 flex-wrap justify-center lg:justify-start">
            {/* Your photo card */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-[72px] h-[90px] sm:w-20 sm:h-[100px] rounded-xl overflow-hidden border-2 border-background shadow-xl shadow-foreground/10">
                <img
                  src={getOptimizedUrl(activeCat.productImg, { width: 160, quality: 60 })}
                  alt="Original product"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
                Your photo
              </span>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200 border ${
                    activeCategory === cat.key
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Marquee rows */}
          <div className="flex flex-col gap-3">
            <MarqueeRow cards={row1} direction="left" duration="30s" />
            <MarqueeRow cards={row2} direction="right" duration="35s" />
          </div>
        </div>
      </div>
    </section>
  );
}
