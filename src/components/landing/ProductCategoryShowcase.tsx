import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';

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
    const timer = setInterval(advance, cycleDuration);
    return () => clearInterval(timer);
  }, [advance, cycleDuration]);

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
        <span className="text-xs font-medium tracking-wide text-primary-foreground bg-foreground/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
          {label}
        </span>
      </div>

      {/* All images stacked — only currentIndex is visible */}
      {images.map((img, i) => (
         <ShimmerImage
           key={i}
           src={img}
           alt={`${label} AI-generated product shot`}
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

const s = (path: string) => getLandingAssetUrl(`showcase/${path}`);

const CATEGORIES: CategoryCardProps[] = [
  {
    label: 'Fashion & Apparel',
    images: [s('fashion-blazer-golden.jpg'), s('fashion-activewear-bright.jpg'), s('fashion-dress-botanical.jpg'), s('fashion-street-denim.jpg'), s('fashion-cashmere-cafe.jpg')],
    cycleDuration: 7000,
  },
  {
    label: 'Skincare',
    images: [s('skincare-serum-morning.jpg'), s('skincare-cream-botanical.jpg'), s('skincare-oil-lifestyle.jpg'), s('skincare-retinol-model.jpg'), s('skincare-set-minimal.jpg')],
    cycleDuration: 8500,
  },
  {
    label: 'Food & Drinks',
    images: [s('food-pasta-artisan.jpg'), s('food-coffee-pourover.jpg'), s('food-honey-golden.jpg'), s('food-acai-bright.jpg'), s('food-bread-bakery.jpg')],
    cycleDuration: 6000,
  },
  {
    label: 'Home & Living',
    images: [s('home-candle-evening.jpg'), s('home-vases-shelf.jpg'), s('home-lamp-evening.jpg'), s('home-bedroom-morning.jpg'), s('home-pendant-kitchen.jpg')],
    cycleDuration: 7500,
  },
];

export function ProductCategoryShowcase() {
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
            Fashion, skincare, food, home décor — our AI adapts to any product category and delivers studio-quality shots.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.label} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
