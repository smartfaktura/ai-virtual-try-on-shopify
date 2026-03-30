import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const failedRef = useRef<Set<number>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);

  const getNextValid = useCallback((from: number) => {
    for (let i = 1; i <= images.length; i++) {
      const idx = (from + i) % images.length;
      if (!failedRef.current.has(idx)) return idx;
    }
    return from; // all failed, stay put
  }, [images.length]);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = getNextValid(prev);
      return next;
    });
    setProgressKey((k) => k + 1);
  }, [getNextValid]);

  const handleError = useCallback((idx: number) => {
    failedRef.current.add(idx);
    // If the currently visible image failed, advance immediately
    setCurrentIndex((prev) => {
      if (prev === idx) return getNextValid(prev);
      return prev;
    });
  }, [getNextValid]);

  // IntersectionObserver — only cycle when visible
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(advance, cycleDuration);
    return () => clearInterval(timer);
  }, [advance, cycleDuration, isVisible]);

  const nextIndex = getNextValid(currentIndex);

  return (
    <div ref={cardRef} className="relative rounded-xl overflow-hidden border border-border/40 bg-card aspect-[3/4] group">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-muted/40">
        {isVisible && (
          <div
            key={progressKey}
            className="h-full bg-primary/70"
            style={{
              animation: `progress-fill ${cycleDuration}ms linear forwards`,
            }}
          />
        )}
      </div>

      {/* Category label */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-xs font-medium tracking-wide text-primary-foreground bg-foreground/60 px-2.5 py-1 rounded-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          {label}
        </span>
      </div>

      {/* Current image */}
      <ShimmerImage
        key={currentIndex}
        src={images[currentIndex]}
        alt={`${label} AI-generated product shot`}
        loading="lazy"
        decoding="async"
        wrapperClassName="absolute inset-0"
        className="w-full h-full object-cover"
        onError={() => handleError(currentIndex)}
      />

      {/* Preload next image (hidden) */}
      {nextIndex !== currentIndex && (
        <ShimmerImage
          key={`pre-${nextIndex}`}
          src={images[nextIndex]}
          alt=""
          loading="lazy"
          decoding="async"
          wrapperClassName="absolute inset-0"
          wrapperStyle={{ opacity: 0, pointerEvents: 'none' }}
          className="w-full h-full object-cover"
          onError={() => handleError(nextIndex)}
        />
      )}
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
