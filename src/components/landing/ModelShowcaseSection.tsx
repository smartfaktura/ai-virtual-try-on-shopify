import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { ShimmerImage } from '@/components/ui/shimmer-image';
import { mockModels } from '@/data/mockData';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';

type ModelItem =
  | { kind: 'model'; name: string; previewUrl: string }
  | { kind: 'cta' };

function BrandModelCTA() {
  return (
    <Link
      to="/app/models"
      className="group flex flex-col items-center gap-2 flex-shrink-0"
      aria-label="Create your own brand models"
    >
      <div className="w-28 h-36 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-2xl overflow-hidden bg-background border border-foreground/10 flex flex-col items-center justify-center gap-3 transition-all duration-500 group-hover:border-foreground/25">
        <div className="w-9 h-9 rounded-full border border-foreground/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
          <Plus className="w-4 h-4 text-foreground/80" strokeWidth={1.5} />
        </div>
        <div className="text-center px-2">
          <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-foreground leading-tight">
            Brand
          </div>
          <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-foreground leading-tight">
            Models
          </div>
          <div className="mt-1.5 text-[9px] tracking-wide text-foreground/70 font-medium">
            Create your own
          </div>
        </div>
      </div>
      <span className="text-[11px] tracking-wide text-muted-foreground">Custom</span>
    </Link>
  );
}

function ModelCardItem({ model }: { model: { name: string; previewUrl: string } }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="w-28 h-36 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-card">
        <ShimmerImage
          src={model.previewUrl}
          alt={model.name}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          aspectRatio="3/4"
          onError={() => setHidden(true)}
        />
      </div>
      <span className="text-[11px] tracking-wide text-muted-foreground">{model.name}</span>
    </div>
  );
}

function MarqueeRow({ items, direction = 'left', durationSeconds = 120 }: { items: ModelItem[]; direction?: 'left' | 'right'; durationSeconds?: number }) {
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
        {tripled.map((item, i) =>
          item.kind === 'cta'
            ? <BrandModelCTA key={`cta-${i}`} />
            : <ModelCardItem key={`${item.name}-${i}`} model={item} />
        )}
      </div>
    </div>
  );
}

export function ModelShowcaseSection() {
  const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();

  const { row1, row2, modelCount } = useMemo(() => {
    const processed = sortModels(filterHidden(applyNameOverrides(applyOverrides([...mockModels]))));
    const mid = Math.ceil(processed.length / 2);
    const wrap = (m: { name: string; previewUrl: string }): ModelItem => ({ kind: 'model', name: m.name, previewUrl: m.previewUrl });

    // Insert a Brand Models CTA every N cards so one is always visible on screen.
    const INTERLEAVE = 6;
    const interleaveCta = (models: ModelItem[], startOffset = 0): ModelItem[] => {
      const out: ModelItem[] = [];
      if (startOffset === 0) out.push({ kind: 'cta' });
      models.forEach((m, i) => {
        out.push(m);
        const pos = i + 1 + startOffset;
        if (pos % INTERLEAVE === 0 && i !== models.length - 1) {
          out.push({ kind: 'cta' });
        }
      });
      return out;
    };

    const r1 = interleaveCta(processed.slice(0, mid).map(wrap), 0);
    // Offset row 2 by 3 so its CTAs don't vertically align with row 1.
    const r2 = interleaveCta(processed.slice(mid).map(wrap), 3);

    return { row1: r1, row2: r2, modelCount: processed.length };
  }, [sortModels, applyOverrides, applyNameOverrides, filterHidden]);

  return (
    <section className="py-16 lg:py-32 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-12 lg:mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {modelCount}+ AI Models
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Professional models. Every look.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Diverse models across every body type, ethnicity, and age — ready for your next campaign.
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
