import { Info } from 'lucide-react';
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
    <div className="pt-3 pl-2 min-w-0 max-w-full animate-fade-in">
      <div className="flex items-center gap-2 mb-1 flex-wrap min-w-0 max-w-full">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
          Pre-selected from Explore
        </p>
        <div className="h-px flex-1 bg-border min-w-[20px]" />
        {selected && (
          <span className="text-[10px] h-6 px-2 inline-flex items-center text-muted-foreground shrink-0">
            1 selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'group relative rounded-xl overflow-hidden border-2 transition-all text-left',
            selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
          )}
        >
          <div className="aspect-[3/4] relative bg-muted">
            {scene.previewUrl && (
              <ShimmerImage
                src={getOptimizedUrl(scene.previewUrl, { quality: 80 })}
                alt={scene.title}
                className="w-full h-full object-cover"
              />
            )}
            {selected && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-1.5 min-h-[44px] flex flex-col justify-center">
            <p className="text-xs font-medium text-foreground line-clamp-1">{scene.title}</p>
          </div>
        </button>
        <div className="rounded-xl border-2 border-dashed border-border/70 bg-muted/20 overflow-hidden flex flex-col">
          <div className="aspect-[3/4] relative flex flex-col items-center justify-center px-4 py-5 text-center gap-3">
            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <Avatar className="w-9 h-9 border border-primary/20 ring-1 ring-primary/10">
              <AvatarImage src={TEAM_MEMBERS[0].avatar} alt={TEAM_MEMBERS[0].name} />
              <AvatarFallback className="text-[10px]">{TEAM_MEMBERS[0].name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-[13px] font-semibold tracking-tight text-foreground leading-snug">
                Picked for you
              </p>
              <p className="text-xs text-muted-foreground leading-snug">
                From Explore
              </p>
            </div>
          </div>
          <div className="p-1.5 min-h-[44px] flex flex-col items-center justify-center gap-0.5 border-t border-dashed border-border/70">
            <p className="text-xs text-muted-foreground text-center leading-tight">
              Add more shots below
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
