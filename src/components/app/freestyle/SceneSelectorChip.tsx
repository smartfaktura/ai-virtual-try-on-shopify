import { Camera, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { TryOnPose } from '@/types';

interface SceneSelectorChipProps {
  selectedScene: TryOnPose | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (scene: TryOnPose | null) => void;
}

const categories = Object.keys(poseCategoryLabels);

export function SceneSelectorChip({ selectedScene, open, onOpenChange, onSelect }: SceneSelectorChipProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.04] text-sidebar-foreground/80 hover:bg-white/[0.08] transition-colors">
          {selectedScene ? (
            <>
              <img src={selectedScene.previewUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
              <span className="max-w-[80px] truncate">{selectedScene.name}</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              Scene
            </>
          )}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
          Scene / Environment
        </p>
        <button
          onClick={() => { onSelect(null); onOpenChange(false); }}
          className={cn(
            'w-full text-left px-3 py-2 rounded-lg text-sm mb-2 transition-colors',
            !selectedScene ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          )}
        >
          No Scene
        </button>
        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {categories.map(cat => {
            const poses = mockTryOnPoses.filter(p => p.category === cat);
            return (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-1.5 px-1">
                  {poseCategoryLabels[cat]}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {poses.map(pose => (
                    <button
                      key={pose.poseId}
                      onClick={() => { onSelect(pose); onOpenChange(false); }}
                      className={cn(
                        'relative rounded-lg overflow-hidden border-2 transition-all',
                        selectedScene?.poseId === pose.poseId
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-border'
                      )}
                    >
                      <img src={pose.previewUrl} alt={pose.name} className="w-full aspect-square object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                        <p className="text-[9px] text-white truncate">{pose.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
