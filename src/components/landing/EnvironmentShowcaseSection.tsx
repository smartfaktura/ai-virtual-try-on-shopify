import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';

interface EnvironmentCard {
  name: string;
  image: string;
}

const e = (name: string, file: string): EnvironmentCard => ({ name, image: getLandingAssetUrl(`poses/${file}`) });

const ROW_1: EnvironmentCard[] = [
  e('Studio Classic', 'pose-studio-front.jpg'),
  e('Beach', 'pose-lifestyle-beach.jpg'),
  e('Editorial Dark', 'pose-editorial-dramatic.jpg'),
  e('Neon Night', 'pose-streetwear-neon.jpg'),
  e('Coffee Shop', 'pose-lifestyle-coffee.jpg'),
  e('Studio Profile', 'pose-studio-profile.jpg'),
  e('Garden', 'pose-lifestyle-garden.jpg'),
  e('Window Light', 'pose-editorial-window.jpg'),
  e('Urban Street', 'pose-streetwear-urban.jpg'),
];

const ROW_2: EnvironmentCard[] = [
  e('Rooftop', 'pose-lifestyle-rooftop.jpg'),
  e('Minimal White', 'pose-editorial-minimal.jpg'),
  e('Industrial', 'pose-streetwear-stairs.jpg'),
  e('Studio Motion', 'pose-studio-movement.jpg'),
  e('Park', 'pose-lifestyle-park.jpg'),
  e('Moody Editorial', 'pose-editorial-moody.jpg'),
  e('Basketball Court', 'pose-streetwear-basketball.jpg'),
  e('Café Seated', 'pose-lifestyle-seated.jpg'),
  e('Underpass', 'pose-streetwear-underpass.jpg'),
];

function MarqueeRow({ items, direction = 'left' }: { items: EnvironmentCard[]; direction?: 'left' | 'right' }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let position = 0;
    const totalWidth = el.scrollWidth / 2;

    const step = () => {
      position += direction === 'left' ? 0.5 : -0.5;
      if (direction === 'left' && position >= totalWidth) position = 0;
      if (direction === 'right' && position <= -totalWidth) position = 0;
      el.style.transform = `translateX(${direction === 'left' ? -position : -position + totalWidth}px)`;
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [direction]);

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden relative">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, hsl(var(--background)), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }} />
      <div ref={scrollRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
        {doubled.map((env, i) => (
          <div key={`${env.name}-${i}`} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-36 h-48 sm:w-44 sm:h-56 lg:w-52 lg:h-64 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
              <ShimmerImage
                 src={env.image}
                 alt={env.name}
                 className="w-full h-full object-cover"
                 decoding="async"
                 aspectRatio="3/4"
               />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">{env.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentShowcaseSection() {
  return (
    <section className="py-12 lg:py-16 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            24+ Scenes
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Every Environment. One Click.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Studio, lifestyle, editorial, streetwear — place your products in any setting instantly.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <MarqueeRow items={ROW_1} direction="left" />
        <MarqueeRow items={ROW_2} direction="right" />
      </div>
    </section>
  );
}
