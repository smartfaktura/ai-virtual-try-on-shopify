import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

const staticOriginal = h('hero-product-croptop.jpg');

const outputCards = [
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

function OriginalCard({ visible }: { visible: boolean }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-border/60 shadow-xl shadow-foreground/[0.06] transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ aspectRatio: '3/4' }}
    >
      <img
        src={getOptimizedUrl(staticOriginal, { width: 400, quality: 55 })}
        alt="Original product"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent z-10">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-white/90">
          Original
        </span>
      </div>
    </div>
  );
}

function OutputCardItem({
  label,
  images,
  delay,
  visible,
}: {
  label: string;
  images: string[];
  delay: number;
  visible: boolean;
}) {
  const idx = useRotatingIndex(images.length, 1000, delay);
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-border/60 shadow-md shadow-foreground/[0.04] transition-all duration-700 hover:scale-[1.03] hover:shadow-lg ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ aspectRatio: '3/4', transitionDelay: `${delay}ms` }}
    >
      <CrossfadeStack images={images} activeIndex={idx} />
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent z-10">
        <span className="text-[11px] font-medium tracking-wide text-white/90">
          {label}
        </span>
      </div>
    </div>
  );
}

export function HomeTransformStrip() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]" id="examples">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            From one product photo to every asset you need
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Use the same product to create store images, social creatives, campaign visuals, and short videos.
          </p>
        </div>

        <div ref={ref} className="flex items-center gap-3 lg:gap-5">
          {/* Original — larger anchor */}
          <div className="w-[35%] sm:w-[28%] lg:w-[22%] shrink-0">
            <OriginalCard visible={visible} />
          </div>

          {/* Arrow connector */}
          <div
            className={`hidden sm:flex flex-col items-center gap-1 shrink-0 transition-all duration-700 delay-200 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-8 lg:w-12 h-px bg-border" />
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-border">
              <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
            </svg>
          </div>

          {/* Output cards grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 lg:gap-3">
            {outputCards.map((card, i) => (
              <OutputCardItem
                key={card.label}
                label={card.label}
                images={card.images}
                delay={200 + i * 120}
                visible={visible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
