import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { supabase } from '@/integrations/supabase/client';

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

      {images.map((img, i) => (
        <ShimmerImage
          key={img}
          src={img}
          alt={`${label} AI-generated product shot`}
          loading="lazy"
          decoding="async"
          wrapperClassName="absolute inset-0"
          wrapperStyle={{
            opacity: i === currentIndex ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
          className="w-full h-full object-cover"
        />
      ))}
    </div>
  );
}

const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(`showcase/${path}`), { quality: 60 });

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const IMAGE_EXT = /\.(jpg|jpeg|png|webp)$/i;

interface CategoryDef {
  label: string;
  folder: string;
  cycleDuration: number;
  fallback: string[];
}

const CATEGORY_DEFS: CategoryDef[] = [
  {
    label: 'Fashion & Apparel',
    folder: 'fashion',
    cycleDuration: 7000,
    fallback: [
      s('fashion-camel-coat.png'),
      s('fashion-white-suit.png'),
      s('fashion-knit-loft.png'),
      s('fashion-activewear-gym.png'),
    ],
  },
  {
    label: 'Beauty',
    folder: 'beauty',
    cycleDuration: 8500,
    fallback: [
      s('skincare-serum-marble.png'),
      s('skincare-perfume-vanity.png'),
      s('skincare-serum-model.png'),
      s('skincare-model-light.png'),
    ],
  },
  {
    label: 'Food & Drinks',
    folder: 'food',
    cycleDuration: 6000,
    fallback: [
      s('food-avocado-toast.png'),
      s('food-cocktail-bar.png'),
      s('food-pavlova-berries.png'),
      s('food-raspberry-dessert.png'),
      s('food-cocktail-rocks.png'),
    ],
  },
  {
    label: 'Home & Living',
    folder: 'home',
    cycleDuration: 7500,
    fallback: [
      s('home-candle-evening.png'),
      s('home-vases-shelf.png'),
      s('home-lamp-evening.png'),
      s('home-bedroom-morning.png'),
      s('home-pendant-kitchen.png'),
    ],
  },
];

export function ProductCategoryShowcase() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchAll() {
      const results: Record<string, string[]> = {};
      await Promise.all(
        CATEGORY_DEFS.map(async (cat) => {
          try {
            const { data } = await supabase.storage
              .from('landing-assets')
              .list(`showcase/${cat.folder}`, { limit: 100 });
            const urls = data
              ?.filter((f) => IMAGE_EXT.test(f.name))
              .map((f) =>
                getOptimizedUrl(
                  getLandingAssetUrl(`showcase/${cat.folder}/${f.name}`),
                  { quality: 60 }
                )
              );
            if (urls?.length) {
              results[cat.folder] = shuffleArray(urls);
            }
          } catch {
            // fallback will be used
          }
        })
      );
      if (Object.keys(results).length) setCategoryImages(results);
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
              images={categoryImages[cat.folder] ?? cat.fallback}
              cycleDuration={cat.cycleDuration}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
