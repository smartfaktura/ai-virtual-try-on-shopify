import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { PREVIEW, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * Per-category version of the homepage "One photo · Every shot" chip selector.
 * Chips read like: "Clothing & Apparel · Creative Shots".
 * The active scene's preview image is shown beside the chip rail.
 */
export function CategoryBuiltForEveryCategory({ page }: { page: CategoryPage }) {
  const scenes = page.sceneExamples;
  const [activeIdx, setActiveIdx] = useState(0);
  const active = scenes[activeIdx] ?? scenes[0];
  if (!active) return null;

  return (
    <section className="py-16 lg:py-32 bg-background overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            One photo · Every shot
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Built for every category.
          </h2>
        </div>

        {/* Chip rail */}
        <div className="mb-8 lg:mb-10">
          {/* Mobile: full-bleed scrollable rail with edge fades */}
          <div className="lg:hidden relative -mx-6">
            <div className="flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {scenes.map((s, idx) => (
                <button
                  key={`${s.collectionLabel}-${s.subCategory}-${idx}`}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border',
                    activeIdx === idx
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground',
                  )}
                >
                  {s.collectionLabel} · {s.subCategory}
                </button>
              ))}
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
          </div>

          {/* Desktop: centered wrap */}
          <div className="hidden lg:flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
            {scenes.map((s, idx) => (
              <button
                key={`${s.collectionLabel}-${s.subCategory}-${idx}`}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border',
                  activeIdx === idx
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/70',
                )}
              >
                {s.collectionLabel} · {s.subCategory}
              </button>
            ))}
          </div>
        </div>

        {/* Active preview */}
        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-xl shadow-foreground/[0.08] bg-muted/30">
            <img
              key={active.imageId}
              src={getOptimizedUrl(PREVIEW(active.imageId), { quality: 70 })}
              alt={active.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/60 via-black/15 to-transparent">
              <span className="block text-[11px] uppercase tracking-[0.18em] text-white/75 font-semibold">
                {active.collectionLabel} · {active.subCategory}
              </span>
              <span className="block text-base text-white font-medium leading-tight mt-1">
                {active.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
