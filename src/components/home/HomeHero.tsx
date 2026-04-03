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

/* Indices that get crossfade rotation */
const ROTATING_INDICES = new Set([0, 8]); // Product page & Perspectives

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
function useRotatingIndex(length: number, intervalMs: number, enabled: boolean) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!enabled || length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs, enabled]);
  return idx;
}

/* ── Crossfade stack ── */
function CrossfadeStack({ images, activeIndex }: { images: string[]; activeIndex: number }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={getOptimizedUrl(src, { width: 800, quality: 55 })}
          alt=""
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}

/* ── Marquee card ── */
function MarqueeCard({ label, images, cardIndex }: { label: string; images: string[]; cardIndex: number }) {
  const rotates = ROTATING_INDICES.has(cardIndex);
  const idx = useRotatingIndex(images.length, 1000, rotates);
  return (
    <div className="relative flex-shrink-0 w-[160px] h-[213px] sm:w-[200px] sm:h-[267px] rounded-2xl overflow-hidden border border-border/60 shadow-md shadow-foreground/[0.04] bg-[hsl(var(--muted))]">
      {rotates ? (
        <CrossfadeStack images={images} activeIndex={idx} />
      ) : (
        <img
          src={getOptimizedUrl(images[0], { width: 800, quality: 55 })}
          alt=""
          loading="lazy"
          className="w-full h-full object-contain"
        />
      )}
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
  indexOffset,
}: {
  cards: { label: string; images: string[]; originalIndex: number }[];
  direction: 'left' | 'right';
  duration: string;
  indexOffset?: number;
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
          <MarqueeCard key={`${card.label}-${i}`} label={card.label} images={card.images} cardIndex={card.originalIndex} />
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
    originalIndex: i,
  }));

  const row1 = marqueeCards.slice(0, 5);
  const row2 = marqueeCards.slice(4);

  return (
    <section className="pt-20 pb-8 lg:pt-28 lg:pb-16 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-[2fr_3fr] gap-6 lg:gap-12 items-center">
        {/* ── Left — Copy (40%) ── */}
        <div className="mx-auto lg:mx-0 text-center lg:text-left">
          <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 mb-5">
            AI product visuals
          </span>

          <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.25rem] leading-[1.05] font-semibold tracking-[-0.03em] mb-4">
            One product photo.
            <br />
            <span className="bg-gradient-to-r from-[hsl(var(--foreground))] via-[hsl(215,25%,40%)] to-[hsl(var(--foreground))] bg-clip-text text-transparent">
              Every visual you need.
            </span>
          </h1>

          <p className="text-[16px] leading-relaxed text-muted-foreground mb-7 max-w-md mx-auto lg:mx-0">
            Create product images, social creatives, and short videos — without
            another photoshoot.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 justify-center lg:justify-start">
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

        {/* ── Right — Marquee + controls below (60%) ── */}
        <div className="flex flex-col gap-3">
          {/* Marquee rows */}
          <div className="flex flex-col gap-3">
            <MarqueeRow cards={row1} direction="left" duration="30s" />
            <MarqueeRow cards={row2} direction="right" duration="35s" />
          </div>

          {/* Controls bar: Your Photo + Category pills */}
          <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start pt-1">
            {/* Your photo card */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-14 h-[70px] rounded-xl overflow-hidden border-2 border-background shadow-lg shadow-foreground/10">
                <img
                  src={getOptimizedUrl(activeCat.productImg, { width: 120, quality: 60 })}
                  alt="Original product"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
                Your<br />photo
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-border/60 hidden sm:block" />

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs transition-all duration-200 border ${
                    activeCategory === cat.key
                      ? 'bg-secondary text-foreground border-foreground/20 font-semibold'
                      : 'bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
