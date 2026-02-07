import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

// Environments — diverse scenes
import envStudioFront from '@/assets/poses/pose-studio-front.jpg';
import envBeach from '@/assets/poses/pose-lifestyle-beach.jpg';
import envEditorialDramatic from '@/assets/poses/pose-editorial-dramatic.jpg';
import envNeon from '@/assets/poses/pose-streetwear-neon.jpg';
import envCoffee from '@/assets/poses/pose-lifestyle-coffee.jpg';
import envProfile from '@/assets/poses/pose-studio-profile.jpg';
import envGarden from '@/assets/poses/pose-lifestyle-garden.jpg';
import envWindow from '@/assets/poses/pose-editorial-window.jpg';
import envUrban from '@/assets/poses/pose-streetwear-urban.jpg';
import envRooftop from '@/assets/poses/pose-lifestyle-rooftop.jpg';
import envMinimal from '@/assets/poses/pose-editorial-minimal.jpg';
import envStairs from '@/assets/poses/pose-streetwear-stairs.jpg';
import envMovement from '@/assets/poses/pose-studio-movement.jpg';
import envPark from '@/assets/poses/pose-lifestyle-park.jpg';
import envMoody from '@/assets/poses/pose-editorial-moody.jpg';
import envBasketball from '@/assets/poses/pose-streetwear-basketball.jpg';
import envSeated from '@/assets/poses/pose-lifestyle-seated.jpg';
import envUnderpass from '@/assets/poses/pose-streetwear-underpass.jpg';

interface EnvironmentCard {
  name: string;
  image: string;
}

const ROW_1: EnvironmentCard[] = [
  { name: 'Studio Classic', image: envStudioFront },
  { name: 'Beach', image: envBeach },
  { name: 'Editorial Dark', image: envEditorialDramatic },
  { name: 'Neon Night', image: envNeon },
  { name: 'Coffee Shop', image: envCoffee },
  { name: 'Studio Profile', image: envProfile },
  { name: 'Garden', image: envGarden },
  { name: 'Window Light', image: envWindow },
  { name: 'Urban Street', image: envUrban },
];

const ROW_2: EnvironmentCard[] = [
  { name: 'Rooftop', image: envRooftop },
  { name: 'Minimal White', image: envMinimal },
  { name: 'Industrial', image: envStairs },
  { name: 'Studio Motion', image: envMovement },
  { name: 'Park', image: envPark },
  { name: 'Moody Editorial', image: envMoody },
  { name: 'Basketball Court', image: envBasketball },
  { name: 'Café Seated', image: envSeated },
  { name: 'Underpass', image: envUnderpass },
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
    <div className="overflow-hidden">
      <div ref={scrollRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content' }}>
        {doubled.map((env, i) => (
          <div key={`${env.name}-${i}`} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-36 h-48 sm:w-44 sm:h-56 lg:w-52 lg:h-64 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
              <img
                src={env.image}
                alt={env.name}
                className="w-full h-full object-cover"
                loading="lazy"
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
