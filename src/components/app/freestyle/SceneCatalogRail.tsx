import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SceneCatalogCard } from './SceneCatalogCard';
import type { CatalogScene } from '@/hooks/useSceneCatalog';

interface SceneCatalogRailProps {
  title: string;
  scenes: CatalogScene[] | undefined;
  isLoading: boolean;
  selectedSceneId: string | null;
  onSelect: (scene: CatalogScene) => void;
  onViewAll?: () => void;
}

export function SceneCatalogRail({
  title, scenes, isLoading, selectedSceneId, onSelect, onViewAll,
}: SceneCatalogRailProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    updateScrollState();
    node.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(node);
    return () => {
      node.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, scenes]);

  const scrollBy = (dir: 'left' | 'right') => {
    const node = scrollRef.current;
    if (!node) return;
    const offset = node.clientWidth * 0.85;
    node.scrollBy({ left: dir === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  if (!isLoading && (!scenes || scenes.length === 0)) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {onViewAll && scenes && scenes.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin scroll-smooth"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[160px]">
                  <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                </div>
              ))
            : scenes!.map(scene => (
                <div key={scene.id} className="shrink-0 w-[160px]">
                  <SceneCatalogCard
                    scene={scene}
                    selected={selectedSceneId === scene.scene_id}
                    onSelect={onSelect}
                  />
                </div>
              ))}
        </div>

        {/* Edge fades */}
        <div
          className={cn(
            'pointer-events-none absolute top-0 bottom-1 left-0 w-10 bg-gradient-to-r from-background to-transparent transition-opacity',
            canLeft ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute top-0 bottom-1 right-0 w-10 bg-gradient-to-l from-background to-transparent transition-opacity',
            canRight ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Arrows (desktop only) */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy('left')}
          className={cn(
            'hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 -mt-1 w-8 h-8 items-center justify-center rounded-full bg-background border border-border/60 shadow-md transition-opacity hover:bg-muted',
            canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy('right')}
          className={cn(
            'hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 -mt-1 w-8 h-8 items-center justify-center rounded-full bg-background border border-border/60 shadow-md transition-opacity hover:bg-muted',
            canRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </section>
  );
}
