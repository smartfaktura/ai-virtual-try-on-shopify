import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { supabase } from '@/integrations/supabase/client';

/* ── helpers ─────────────────────────────────────────────────────── */

const opt = (path: string) =>
  getOptimizedUrl(getLandingAssetUrl(`showcase/${path}`), { width: 800, quality: 60 });

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const IMAGE_EXT = /\.(jpg|jpeg|png|webp)$/i;

/* ── category definitions ────────────────────────────────────────── */

interface CategoryDef {
  label: string;
  prefix: string;
  cycleDuration: number;
  fallback: string[];
}

const CATEGORY_DEFS: CategoryDef[] = [
  {
    label: 'Fashion & Apparel',
    prefix: 'fashion-',
    cycleDuration: 7000,
    fallback: [
      opt('fashion-camel-coat.png'),
      opt('fashion-white-suit.png'),
      opt('fashion-knit-loft.png'),
      opt('fashion-activewear-gym.png'),
    ],
  },
  {
    label: 'Beauty',
    prefix: 'skincare-',
    cycleDuration: 8500,
    fallback: [
      opt('skincare-serum-marble.png'),
      opt('skincare-perfume-vanity.png'),
      opt('skincare-serum-model.png'),
      opt('skincare-model-light.png'),
    ],
  },
  {
    label: 'Food & Drinks',
    prefix: 'food-',
    cycleDuration: 6000,
    fallback: [
      opt('food-avocado-toast.png'),
      opt('food-cocktail-bar.png'),
      opt('food-pavlova-berries.png'),
      opt('food-raspberry-dessert.png'),
      opt('food-cocktail-rocks.png'),
    ],
  },
  {
    label: 'Home & Living',
    prefix: 'home-',
    cycleDuration: 7500,
    fallback: [
      opt('home-candle-evening.png'),
      opt('home-vases-shelf.png'),
      opt('home-lamp-evening.png'),
      opt('home-bedroom-morning.png'),
      opt('home-pendant-kitchen.png'),
    ],
  },
];

/* ── CategoryCard ─────────────────────────────────────────────────── */

interface CategoryCardProps {
  label: string;
  images: string[];
  cycleDuration: number;
}

function CategoryCard({ label, images, cycleDuration }: CategoryCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgressKey((k) => k + 1);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(advance, cycleDuration);
    return () => clearInterval(timer);
  }, [advance, cycleDuration, images.length]);

  // Only render current + next image (preload), not all images
  const visibleIndices = useMemo(() => {
    const indices = new Set<number>();
    indices.add(currentIndex);
    if (images.length > 1) {
      indices.add((currentIndex + 1) % images.length);
    }
    return indices;
  }, [currentIndex, images.length]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/40 bg-card aspect-[3/4] group">
      <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-muted/40">
        <div
          key={progressKey}
          className="h-full bg-primary/70"
          style={{
            animation: `progress-fill ${cycleDuration}ms linear forwards`,
          }}
        />
      </div>

      <div className="absolute top-3 left-3 z-20">
        <span className="text-xs font-medium tracking-wide text-primary-foreground bg-foreground/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
          {label}
        </span>
      </div>

      {images.map((img, i) =>
        visibleIndices.has(i) ? (
          <ShimmerImage
            key={img}
            src={img}
            alt={`${label} AI-generated product shot`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            wrapperClassName="absolute inset-0"
            wrapperStyle={{
              opacity: i === currentIndex ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
            }}
            className="w-full h-full object-cover"
          />
        ) : null
      )}
    </div>
  );
}

/* ── Showcase section ─────────────────────────────────────────────── */

export function ProductCategoryShowcase() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data } = await supabase.storage
          .from('landing-assets')
          .list('showcase', { limit: 200 });

        if (!data?.length) return;

        const results: Record<string, string[]> = {};

        for (const cat of CATEGORY_DEFS) {
          const urls = data
            .filter((f) => f.name.startsWith(cat.prefix) && IMAGE_EXT.test(f.name))
            .map((f) =>
              getOptimizedUrl(getLandingAssetUrl(`showcase/${f.name}`), {
                width: 800,
                quality: 60,
              })
            );

          if (urls.length) {
            results[cat.prefix] = shuffleArray(urls);
          }
        }

        if (Object.keys(results).length) setCategoryImages(results);
      } catch {
        // fallback images will be used
      }
    }
    fetchAll();
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            Every Category
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            All products look better here
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Fashion, beauty, food, home décor — our AI adapts to any product category and delivers studio-quality shots.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {CATEGORY_DEFS.map((cat) => (
            <CategoryCard
              key={cat.label}
              label={cat.label}
              images={categoryImages[cat.prefix] ?? cat.fallback}
              cycleDuration={cat.cycleDuration}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
