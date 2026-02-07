import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';

// Fashion & Apparel (5 new high-quality images)
import fashionBlazerGolden from '@/assets/showcase/fashion-blazer-golden.jpg';
import fashionActivewearBright from '@/assets/showcase/fashion-activewear-bright.jpg';
import fashionDressBotanical from '@/assets/showcase/fashion-dress-botanical.jpg';
import fashionStreetDenim from '@/assets/showcase/fashion-street-denim.jpg';
import fashionCashmereCafe from '@/assets/showcase/fashion-cashmere-cafe.jpg';

// Skincare (5 new high-quality images — 1 failed moderation, using 4 + existing best)
import skincareSerumMorning from '@/assets/showcase/skincare-serum-morning.jpg';
import skincareCreamBotanical from '@/assets/showcase/skincare-cream-botanical.jpg';
import skincareOilLifestyle from '@/assets/showcase/skincare-oil-lifestyle.jpg';
import skincareRetinolModel from '@/assets/showcase/skincare-retinol-model.jpg';
import skincareSetMinimal from '@/assets/showcase/skincare-set-minimal.jpg';

// Food & Drinks (5 new high-quality images)
import foodPastaArtisan from '@/assets/showcase/food-pasta-artisan.jpg';
import foodCoffeePourover from '@/assets/showcase/food-coffee-pourover.jpg';
import foodHoneyGolden from '@/assets/showcase/food-honey-golden.jpg';
import foodAcaiBright from '@/assets/showcase/food-acai-bright.jpg';
import foodBreadBakery from '@/assets/showcase/food-bread-bakery.jpg';

// Home & Living (5 new high-quality images)
import homeCandleEvening from '@/assets/showcase/home-candle-evening.jpg';
import homeVasesShelf from '@/assets/showcase/home-vases-shelf.jpg';
import homeLampEvening from '@/assets/showcase/home-lamp-evening.jpg';
import homeBedroomMorning from '@/assets/showcase/home-bedroom-morning.jpg';
import homePendantKitchen from '@/assets/showcase/home-pendant-kitchen.jpg';

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
        <img
          key={i}
          src={img}
          alt={`${label} AI-generated product shot`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === currentIndex ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
      ))}
    </div>
  );
}

const CATEGORIES: CategoryCardProps[] = [
  {
    label: 'Fashion & Apparel',
    images: [fashionBlazerGolden, fashionActivewearBright, fashionDressBotanical, fashionStreetDenim, fashionCashmereCafe],
    cycleDuration: 7000,
  },
  {
    label: 'Skincare',
    images: [skincareSerumMorning, skincareCreamBotanical, skincareOilLifestyle, skincareRetinolModel, skincareSetMinimal],
    cycleDuration: 8500,
  },
  {
    label: 'Food & Drinks',
    images: [foodPastaArtisan, foodCoffeePourover, foodHoneyGolden, foodAcaiBright, foodBreadBakery],
    cycleDuration: 6000,
  },
  {
    label: 'Home & Living',
    images: [homeCandleEvening, homeVasesShelf, homeLampEvening, homeBedroomMorning, homePendantKitchen],
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
