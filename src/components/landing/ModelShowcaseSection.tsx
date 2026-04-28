import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User } from 'lucide-react';

import { mockModels } from '@/data/mockData';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';
import { useIsMobile } from '@/hooks/use-mobile';
import { getOptimizedUrl, getResizedSrcSet } from '@/lib/imageOptimization';

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
      <div className="w-24 h-32 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-2xl overflow-hidden bg-background border border-foreground/10 flex flex-col items-center justify-center gap-3 transition-all duration-500 group-hover:border-foreground/25">
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
  const [errored, setErrored] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="w-24 h-32 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-muted/40 flex items-center justify-center">
        {errored ? (
          <User className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.25} />
        ) : (
          <img
            src={getOptimizedUrl(model.previewUrl, { width: 360, height: 480, quality: 72, resize: 'cover' })}
            srcSet={getResizedSrcSet(model.previewUrl, { widths: [240, 360, 480], aspect: [3, 4], quality: 72 })}
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 128px, 144px"
            alt={model.name}
            loading="lazy"
            decoding="async"
            // @ts-expect-error fetchpriority is a valid HTML attribute
            fetchpriority="low"
            className="w-full h-full object-cover object-top"
            onError={() => setErrored(true)}
          />
        )}
      </div>
      <span className="text-[11px] tracking-wide text-muted-foreground truncate max-w-full">{model.name}</span>
    </div>
  );
}

function MarqueeRow({ items, direction = 'left', durationSeconds = 120, mobileDurationSeconds }: { items: ModelItem[]; direction?: 'left' | 'right'; durationSeconds?: number; mobileDurationSeconds?: number }) {
  const doubled = [...items, ...items];
  const isMobile = useIsMobile();
  const effectiveDuration = isMobile && mobileDurationSeconds ? mobileDurationSeconds : durationSeconds;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, hsl(var(--muted) / 0.3), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, hsl(var(--muted) / 0.3), transparent)' }} />
      <div
        className="flex gap-3 sm:gap-4"
        style={{
          width: 'max-content',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          animation: `marquee-${direction} ${effectiveDuration}s linear infinite`,
        }}
      >
        {doubled.map((item, i) =>
          item.kind === 'cta'
            ? <BrandModelCTA key={`cta-${i}`} />
            : <ModelCardItem key={`${item.name}-${i}`} model={item} />
        )}
      </div>
    </div>
  );
}

interface ModelsMarqueeProps {
  eyebrow?: (modelCount: number) => string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ModelsMarquee({ eyebrow, title, subtitle, className }: ModelsMarqueeProps = {}) {
  const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://azwiljtrbtaupofwmpzb.supabase.co';
    link.crossOrigin = '';
    document.head.appendChild(link);
    return () => { link.parentNode?.removeChild(link); };
  }, []);

  const { row1, row2, mobileItems, modelCount } = useMemo(() => {
    const processed = sortModels(filterHidden(applyNameOverrides(applyOverrides([...mockModels]))));
    const mid = Math.ceil(processed.length / 2);
    const wrap = (m: { name: string; previewUrl: string }): ModelItem => ({ kind: 'model', name: m.name, previewUrl: m.previewUrl });

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
    const r2 = interleaveCta(processed.slice(mid).map(wrap), 3);

    // Mobile: a curated, fixed grid (no animation, no off-screen cards).
    // Show a balanced selection of 11 models + 1 CTA = 12 tiles (3 cols x 4 rows).
    const mobileModels = processed.slice(0, 11).map(wrap);
    const mItems: ModelItem[] = [...mobileModels];
    mItems.splice(2, 0, { kind: 'cta' });

    return { row1: r1, row2: r2, mobileItems: mItems, modelCount: processed.length };
  }, [sortModels, applyOverrides, applyNameOverrides, filterHidden]);

  const eyebrowText = eyebrow ? eyebrow(modelCount) : `${modelCount}+ AI Models`;
  const titleText = title ?? 'Professional models. Every look.';
  const subtitleText = subtitle ?? 'Diverse models across every body type, ethnicity, and age — ready for your next campaign.';

  return (
    <section className={`py-16 lg:py-32 overflow-hidden ${className ?? 'bg-[#FAFAF8]'}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-10 lg:mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrowText}
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            {titleText}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {subtitleText}
          </p>
        </div>
      </div>

      {isMobile ? (
        <div className="px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {mobileItems.map((item, i) =>
              item.kind === 'cta'
                ? <BrandModelCTA key={`m-cta-${i}`} />
                : <ModelCardItem key={`m-${item.name}-${i}`} model={item} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <MarqueeRow items={row1} direction="left" durationSeconds={120} />
          <MarqueeRow items={row2} direction="right" durationSeconds={130} />
        </div>
      )}
    </section>
  );
}

export function ModelShowcaseSection() {
  return <ModelsMarquee />;
}
