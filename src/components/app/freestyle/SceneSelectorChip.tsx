import { useState } from 'react';
import { Camera, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { TryOnPose, PoseCategory } from '@/types';
import { useCustomScenes } from '@/hooks/useCustomScenes';

interface SceneSelectorChipProps {
  selectedScene: TryOnPose | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (scene: TryOnPose | null) => void;
  modal?: boolean;
}

type SceneFilter = 'all' | 'on-model' | 'product' | 'food-home' | 'beauty';

const filterTabs: { key: SceneFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'on-model', label: 'On-Model' },
  { key: 'product', label: 'Product' },
  { key: 'food-home', label: 'Food & Home' },
  { key: 'beauty', label: 'Beauty' },
];

const filterCategoryMap: Record<SceneFilter, PoseCategory[]> = {
  all: [],
  'on-model': ['studio', 'lifestyle', 'editorial', 'streetwear'],
  product: ['clean-studio', 'surface', 'flat-lay'],
  'food-home': ['kitchen', 'living-space'],
  beauty: ['bathroom', 'botanical'],
};

export function SceneSelectorChip({ selectedScene, open, onOpenChange, onSelect, modal }: SceneSelectorChipProps) {
  const [activeFilter, setActiveFilter] = useState<SceneFilter>('all');
  const { asPoses: customPoses } = useCustomScenes();

  const allPoses = [...mockTryOnPoses, ...customPoses];
  const allCategories = Object.keys(poseCategoryLabels) as PoseCategory[];
  const visibleCategories = activeFilter === 'all'
    ? allCategories
    : filterCategoryMap[activeFilter];

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors">
          {selectedScene ? (
            <>
              <img src={selectedScene.previewUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
              <span className="max-w-[80px] truncate">{selectedScene.name}</span>
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onSelect(null); }}
                className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
              >
                <X className="w-3 h-3" />
              </span>
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
      <PopoverContent className="w-96 p-3" align="start">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
            Scene / Environment
          </p>
          {selectedScene && (
            <button
              onClick={() => { onSelect(null); onOpenChange(false); }}
              className="text-[10px] text-primary hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors',
                activeFilter === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {visibleCategories.map(cat => {
            const poses = allPoses.filter(p => p.category === cat);
            if (poses.length === 0) return null;
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
                        'rounded-lg overflow-hidden border-2 transition-all',
                        selectedScene?.poseId === pose.poseId
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-border'
                      )}
                    >
                      <img src={pose.previewUrl} alt={pose.name} className="w-full aspect-square object-cover" />
                      <div className="px-1.5 py-1 bg-background">
                        <p className="text-[9px] font-medium text-foreground leading-tight truncate">{pose.name}</p>
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
