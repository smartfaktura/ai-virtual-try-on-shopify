import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';

// Fashion & Apparel
import fashionStudio from '@/assets/hero/hero-output-studio.jpg';
import fashionPark from '@/assets/hero/hero-output-park.jpg';
import fashionRooftop from '@/assets/hero/hero-output-rooftop.jpg';
import fashionUrban from '@/assets/hero/hero-output-urban.jpg';
import fashionBeach from '@/assets/hero/hero-output-beach.jpg';

// Skincare
import skincareStudio from '@/assets/hero/hero-serum-studio.jpg';
import skincareShadows from '@/assets/hero/hero-serum-shadows.jpg';
import skincareBathroom from '@/assets/hero/hero-serum-bathroom.jpg';
import skincareMoody from '@/assets/hero/hero-serum-moody.jpg';
import skincareGarden from '@/assets/hero/hero-serum-garden.jpg';

// Food & Drinks
import foodRustic from '@/assets/templates/food-rustic.jpg';
import foodCommercial from '@/assets/templates/food-commercial.jpg';
import foodPackaging from '@/assets/templates/food-packaging.jpg';
import coffeeBeans from '@/assets/products/coffee-beans.jpg';
import honeyOrganic from '@/assets/products/honey-organic.jpg';

// Home & Living
import homeJapandi from '@/assets/templates/home-japandi.jpg';
import homeWarm from '@/assets/templates/home-warm.jpg';
import homeConcrete from '@/assets/templates/home-concrete.jpg';
import candleSoy from '@/assets/products/candle-soy.jpg';
import lampBrass from '@/assets/products/lamp-brass.jpg';

interface CategoryCardProps {
  label: string;
  images: string[];
  cycleDuration: number; // in ms
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
    <div className="relative rounded-xl overflow-hidden border border-border/30 bg-zinc-900 aspect-[3/4] group">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/10">
        <div
          key={progressKey}
          className="h-full bg-white/80"
          style={{
            animation: `progress-fill ${cycleDuration}ms linear forwards`,
          }}
        />
      </div>

      {/* Category label */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-xs font-medium tracking-wide text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
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
    images: [fashionStudio, fashionPark, fashionRooftop, fashionUrban, fashionBeach],
    cycleDuration: 4000,
  },
  {
    label: 'Skincare',
    images: [skincareStudio, skincareShadows, skincareBathroom, skincareMoody, skincareGarden],
    cycleDuration: 5000,
  },
  {
    label: 'Food & Drinks',
    images: [foodRustic, foodCommercial, foodPackaging, coffeeBeans, honeyOrganic],
    cycleDuration: 3500,
  },
  {
    label: 'Home & Living',
    images: [homeJapandi, homeWarm, homeConcrete, candleSoy, lampBrass],
    cycleDuration: 4500,
  },
];

export function ProductCategoryShowcase() {
  return (
    <section className="py-16 lg:py-24 bg-zinc-950">
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
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase bg-white/10 text-white/70 border-white/10 hover:bg-white/15">
            Every Category
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            All products look better here
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
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
