import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { TEAM_MEMBERS } from '@/data/teamData';
import { cn } from '@/lib/utils';
import type { ProductImageScene } from './types';

interface DiscoverPreselectedCardProps {
  scene: ProductImageScene;
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

/**
 * "Pre-selected from Explore" card — rendered at the page level so it paints
 * instantly when the user lands on Step 2, regardless of product analysis or
 * lazy chunk loading state.
 */
export function DiscoverPreselectedCard({
  scene,
  selectedSceneIds,
  onSelectionChange,
}: DiscoverPreselectedCardProps) {
  const selected = selectedSceneIds.has(scene.id);

  const toggle = () => {
    const next = new Set(selectedSceneIds);
    if (next.has(scene.id)) next.delete(scene.id);
    else next.add(scene.id);
    onSelectionChange(next);
  };

  return (
    <div className="pt-3 mb-6 min-w-0 max-w-full animate-fade-in">
      <div className="flex items-center gap-2 mb-2 flex-wrap min-w-0 max-w-full">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
          Pre-selected from Explore
        </p>
        <div className="h-px flex-1 bg-border min-w-[20px]" />
        <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px] text-muted-foreground">
          <Avatar className="w-4 h-4 border border-primary/20">
            <AvatarImage src={TEAM_MEMBERS[0].avatar} alt={TEAM_MEMBERS[0].name} />
            <AvatarFallback className="text-[8px]">{TEAM_MEMBERS[0].name[0]}</AvatarFallback>
          </Avatar>
          Picked for you
        </span>
        {selected && (
          <span className="text-[10px] h-6 px-2 inline-flex items-center text-muted-foreground shrink-0">
            1 selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'group relative rounded-xl overflow-hidden border-2 bg-card text-left transition-all duration-200',
            selected
              ? 'border-primary ring-2 ring-primary/20 shadow-md'
              : 'border-transparent hover:border-border/60 hover:shadow-sm hover:-translate-y-0.5',
          )}
        >
          <div className="relative">
            {scene.previewUrl ? (
              <ShimmerImage
                src={getOptimizedUrl(scene.previewUrl, { quality: 70 })}
                alt={scene.title}
                className="w-full aspect-[4/5] object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/5] bg-muted" />
            )}
            {selected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <div className="px-2.5 py-2">
            <p className="text-[12px] font-medium text-foreground leading-tight truncate">
              {scene.title}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
