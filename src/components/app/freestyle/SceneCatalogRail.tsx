import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
  if (!isLoading && (!scenes || scenes.length === 0)) return null;

  return (
    <section className="space-y-2.5">
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
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
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
    </section>
  );
}
