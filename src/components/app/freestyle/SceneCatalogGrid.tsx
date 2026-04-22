import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SceneCatalogCard } from './SceneCatalogCard';
import type { CatalogScene } from '@/hooks/useSceneCatalog';

interface SceneCatalogGridProps {
  pages: CatalogScene[][];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  selectedSceneId: string | null;
  onSelect: (scene: CatalogScene) => void;
}

export function SceneCatalogGrid({
  pages, isLoading, isFetchingNextPage, hasNextPage, onLoadMore, selectedSceneId, onSelect,
}: SceneCatalogGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) onLoadMore();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  const flat = pages.flat();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (flat.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-foreground">No scenes match these filters</p>
        <p className="text-xs text-muted-foreground mt-1">Try clearing some filters or adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {flat.map(scene => (
          <SceneCatalogCard
            key={scene.id}
            scene={scene}
            selected={selectedSceneId === scene.scene_id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {hasNextPage && (
        <div ref={sentinelRef} className="py-6 text-center">
          {isFetchingNextPage ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Loading more...</span>
          )}
        </div>
      )}
    </div>
  );
}
