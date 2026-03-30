import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryCardProps {
  label: string;
  images: string[];
  cycleDuration: number;
}

function CategoryCard({ label, images, cycleDuration }: CategoryCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [nextReady, setNextReady] = useState(false);

  const nextIndex = (currentIndex + 1) % images.length;

  // Advance only when the next image has loaded
  useEffect(() => {
    if (!nextReady) return;
    const timer = setTimeout(() => {
      setCurrentIndex(nextIndex);
      setProgressKey((k) => k + 1);
      setNextReady(false);
    }, cycleDuration);
    return () => clearTimeout(timer);
  }, [nextReady, nextIndex, cycleDuration]);

  // On first mount, start the first cycle immediately
  useEffect(() => {
    setNextReady(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/40 bg-card aspect-[3/4] group">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-muted/40">
        <div
          key={progressKey}
          className="h-full bg-primary/70"
          style={{
            animation: `progress-fill ${cycleDuration}ms linear forwards`,
          }}
        />
      </div>

      {/* Category label */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-xs font-medium tracking-wide text-primary-foreground bg-foreground/60 px-2.5 py-1 rounded-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          {label}
        </span>
      </div>

      {/* Current image (visible) */}
      <ShimmerImage
        key={`cur-${currentIndex}`}
        src={images[currentIndex]}
        alt={`${label} AI-generated product shot`}
        loading={currentIndex === 0 ? 'eager' : 'lazy'}
        decoding="async"
        wrapperClassName="absolute inset-0"
        wrapperStyle={{ opacity: 1, zIndex: 1 }}
        className="w-full h-full object-cover"
      />

      {/* Next image (hidden, preloading) */}
      <ShimmerImage
        key={`next-${nextIndex}`}
        src={images[nextIndex]}
        alt={`${label} AI-generated product shot`}
        loading="lazy"
        decoding="async"
        onLoad={() => setNextReady(true)}
        wrapperClassName="absolute inset-0"
        wrapperStyle={{ opacity: 0, zIndex: 0 }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(`showcase/${path}`), { width: 600, quality: 60 });

const CATEGORIES: CategoryCardProps[] = [
  {
    label: 'Fashion & Apparel',
    images: [
      s('fashion-activewear-track.jpg'),
      s('fashion-leopard-sneakers.jpg'),
      s('fashion-portrait-curls.jpg'),
      s('fashion-white-dress-stadium.jpg'),
      s('fashion-blonde-coat.jpg'),
      s('fashion-camel-coat.png'),
      s('fashion-white-suit.png'),
      s('fashion-knit-loft.png'),
      s('fashion-activewear-gym.png'),
    ],
    cycleDuration: 7000,
  },
  {
    label: 'Beauty',
    images: [
      s('beauty-perfume-ice.jpg'),
      s('beauty-perfume-driftwood.jpg'),
      s('beauty-perfume-splash.jpg'),
      s('beauty-perfume-rocks.jpg'),
      s('beauty-perfume-aloe.jpg'),
      s('skincare-serum-marble.png'),
      s('skincare-perfume-vanity.png'),
      s('skincare-serum-model.png'),
      s('skincare-model-light.png'),
    ],
    cycleDuration: 8500,
  },
  {
    label: 'Food & Drinks',
    images: [
      s('food-avocado-toast.png'),
      s('food-cocktail-bar.png'),
      s('food-pavlova-berries.png'),
      s('food-raspberry-dessert.png'),
      s('food-cocktail-rocks.png'),
    ],
    cycleDuration: 6000,
  },
  {
    label: 'Home & Living',
    images: [
      s('home-boucle-chair.jpg'),
      s('home-candle-evening.png'),
      s('home-vases-shelf.png'),
      s('home-lamp-evening.png'),
      s('home-bedroom-morning.png'),
      s('home-pendant-kitchen.png'),
    ],
    cycleDuration: 7500,
  },
];

export function ProductCategoryShowcase() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section className="py-16 lg:py-24 bg-background">
      {/* Inline keyframes for progress bar */}
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.label} {...cat} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            size="lg"
            className="rounded-full px-8 py-5 text-base font-semibold gap-2 shadow-lg shadow-primary/20"
            onClick={() => navigate(user ? '/app' : '/auth')}
          >
            Try It Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
