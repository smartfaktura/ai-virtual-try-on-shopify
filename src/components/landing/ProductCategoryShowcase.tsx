import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';

// Fashion & Apparel
import fashionBlazer from '@/assets/showcase/fashion-blazer-street.jpg';
import fashionActivewear from '@/assets/showcase/fashion-activewear-studio.jpg';
import fashionDress from '@/assets/showcase/fashion-dress-garden.jpg';
import fashionStreetwear from '@/assets/showcase/fashion-streetwear-urban.jpg';

// Skincare
import skincareSerum from '@/assets/showcase/skincare-serum-marble.jpg';
import skincareCream from '@/assets/showcase/skincare-cream-moody.jpg';
import skincareSet from '@/assets/showcase/skincare-set-minimal.jpg';
import skincareOil from '@/assets/showcase/skincare-oil-bathroom.jpg';

// Food & Drinks
import foodPasta from '@/assets/showcase/food-pasta-rustic.jpg';
import foodCoffee from '@/assets/showcase/food-coffee-artisan.jpg';
import foodHoney from '@/assets/showcase/food-honey-farmhouse.jpg';
import foodSmoothie from '@/assets/showcase/food-smoothie-bright.jpg';

// Home & Living
import homeCandle from '@/assets/showcase/home-candle-scandi.jpg';
import homeVases from '@/assets/showcase/home-vases-japandi.jpg';
import homeLamp from '@/assets/showcase/home-lamp-desk.jpg';
import homeTextiles from '@/assets/showcase/home-textiles-bedroom.jpg';

interface CategoryCardProps {
  label: string;
  images: string[];
  cycleDuration: number;
}

function CategoryCard({ label, images, cycleDuration }: CategoryCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [progressKey, setProgressKey] = useState(0);

  const advance = useCallback(() => {
    setPreviousIndex(currentIndex);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgressKey((k) => k + 1);
  }, [currentIndex, images.length]);

  useEffect(() => {
    const timer = setInterval(advance, cycleDuration);
    return () => clearInterval(timer);
  }, [advance, cycleDuration]);

  // Clear previous image after crossfade completes
  useEffect(() => {
    if (previousIndex === null) return;
    const timeout = setTimeout(() => setPreviousIndex(null), 700);
    return () => clearTimeout(timeout);
  }, [previousIndex]);

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

      {/* Previous image (fading out) */}
      {previousIndex !== null && (
        <img
          src={images[previousIndex]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0"
          aria-hidden="true"
        />
      )}

      {/* Current image (fading in) */}
      <img
        key={currentIndex}
        src={images[currentIndex]}
        alt={`${label} AI-generated product shot`}
        className="absolute inset-0 w-full h-full object-cover animate-[fade-image_0.7s_ease-in-out_forwards]"
      />
    </div>
  );
}

const CATEGORIES: CategoryCardProps[] = [
  {
    label: 'Fashion & Apparel',
    images: [fashionBlazer, fashionActivewear, fashionDress, fashionStreetwear],
    cycleDuration: 7000,
  },
  {
    label: 'Skincare',
    images: [skincareSerum, skincareCream, skincareSet, skincareOil],
    cycleDuration: 8500,
  },
  {
    label: 'Food & Drinks',
    images: [foodPasta, foodCoffee, foodHoney, foodSmoothie],
    cycleDuration: 6000,
  },
  {
    label: 'Home & Living',
    images: [homeCandle, homeVases, homeLamp, homeTextiles],
    cycleDuration: 7500,
  },
];

export function ProductCategoryShowcase() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      {/* Inline keyframes for progress bar & image fade */}
      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes fade-image {
          from { opacity: 0; }
          to { opacity: 1; }
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
