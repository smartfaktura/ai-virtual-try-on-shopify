import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { mockModels } from '@/data/mockData';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';

function ModelCardItem({ model }: { model: { name: string; previewUrl: string } }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="w-28 h-36 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
        <ShimmerImage
          src={model.previewUrl}
          alt={model.name}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          aspectRatio="3/4"
          onError={() => setHidden(true)}
        />
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground">{model.name}</span>
    </div>
  );
}

function MarqueeRow({ items, direction = 'left', durationSeconds = 120 }: { items: { name: string; previewUrl: string }[]; direction?: 'left' | 'right'; durationSeconds?: number }) {
  const tripled = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, hsl(var(--muted) / 0.3), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, hsl(var(--muted) / 0.3), transparent)' }} />
      <div
        className="flex gap-4"
        style={{
          width: 'max-content',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          animation: `marquee-${direction} ${durationSeconds}s linear infinite`,
        }}
      >
        {tripled.map((model, i) => (
          <ModelCardItem key={`${model.name}-${i}`} model={model} />
        ))}
      </div>
    </div>
  );
}

export function ModelShowcaseSection() {
  const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();

  const { row1, row2 } = useMemo(() => {
    const processed = sortModels(filterHidden(applyNameOverrides(applyOverrides([...mockModels]))));
    const mid = Math.ceil(processed.length / 2);
    return { row1: processed.slice(0, mid), row2: processed.slice(mid) };
  }, [sortModels, applyOverrides, applyNameOverrides, filterHidden]);

  return (
    <section className="py-20 lg:py-24 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            {row1.length + row2.length}+ AI Models
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Professional Models. Every Look.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Diverse models across every body type, ethnicity, and age - ready for your next campaign.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <MarqueeRow items={row1} direction="left" durationSeconds={120} />
        <MarqueeRow items={row2} direction="right" durationSeconds={130} />
      </div>
    </section>
  );
}
