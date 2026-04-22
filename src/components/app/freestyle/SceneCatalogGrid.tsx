import { forwardRef, useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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

const LOAD_ALL_PAGE_CAP = 10;

export const SceneCatalogGrid = forwardRef<HTMLDivElement, SceneCatalogGridProps>(function SceneCatalogGrid({
  pages, isLoading, isFetchingNextPage, hasNextPage, onLoadMore, selectedSceneId, onSelect,
}, _ref) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const loadAllPagesRef = useRef(0);

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

  // Drive the load-all loop: each time fetching settles, request another page until cap or done.
  useEffect(() => {
    if (!loadingAll) return;
    if (isFetchingNextPage) return;
    if (!hasNextPage) {
      setLoadingAll(false);
      loadAllPagesRef.current = 0;
      return;
    }
    if (loadAllPagesRef.current >= LOAD_ALL_PAGE_CAP) {
      setLoadingAll(false);
      loadAllPagesRef.current = 0;
      return;
    }
    loadAllPagesRef.current += 1;
    onLoadMore();
  }, [loadingAll, isFetchingNextPage, hasNextPage, onLoadMore]);

  const handleLoadAll = () => {
    loadAllPagesRef.current = 0;
    setLoadingAll(true);
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
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
        <>
          <div ref={sentinelRef} className="h-px" />
          <div className="flex flex-col items-center gap-2 py-4">
            {isFetchingNextPage ? (
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {loadingAll ? `Loading more… (${flat.length} loaded)` : 'Loading more…'}
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLoadAll}
                disabled={loadingAll}
                className="rounded-full text-xs"
              >
                Load all
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
