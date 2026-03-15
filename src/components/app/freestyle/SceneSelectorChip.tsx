import { useState, useEffect, useCallback } from 'react';
import { Camera, ChevronDown, X, Maximize2, LayoutGrid } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { TryOnPose, PoseCategory } from '@/types';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useSceneSortOrder } from '@/hooks/useSceneSortOrder';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const COLUMN_OPTIONS: Record<DeviceType, number[]> = {
  desktop: [4, 3, 2],
  tablet: [3, 2],
  mobile: [3, 2, 1],
};

const COLUMN_DEFAULTS: Record<DeviceType, number> = {
  desktop: 4,
  tablet: 3,
  mobile: 3,
};

function getDeviceType(): DeviceType {
  const w = window.innerWidth;
  if (w >= 1024) return 'desktop';
  if (w >= 768) return 'tablet';
  return 'mobile';
}

function useExpandedColumns() {
  const [device, setDevice] = useState<DeviceType>(getDeviceType);
  const [columns, setColumns] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('scene-grid-columns');
      if (saved) return Number(saved);
    } catch {}
    return COLUMN_DEFAULTS[getDeviceType()];
  });

  useEffect(() => {
    const onResize = () => {
      const d = getDeviceType();
      setDevice(d);
      setColumns(prev => {
        const opts = COLUMN_OPTIONS[d];
        return opts.includes(prev) ? prev : COLUMN_DEFAULTS[d];
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const set = useCallback((n: number) => {
    setColumns(n);
    try { localStorage.setItem('scene-grid-columns', String(n)); } catch {}
  }, []);

  return { columns, setColumns: set, options: COLUMN_OPTIONS[device] };
}
import { MissingRequestBanner } from '@/components/app/MissingRequestBanner';

interface SceneSelectorChipProps {
  selectedScene: TryOnPose | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (scene: TryOnPose | null) => void;
  modal?: boolean;
}

type SceneFilter = 'all' | 'on-model' | 'product';

const filterTabs: { key: SceneFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'on-model', label: 'On-Model' },
  { key: 'product', label: 'Product' },
];

const filterCategoryMap: Record<SceneFilter, PoseCategory[]> = {
  all: [],
  'on-model': ['studio', 'lifestyle', 'editorial', 'streetwear'],
  product: ['clean-studio', 'surface', 'flat-lay', 'product-editorial'],
};

export function SceneSelectorChip({ selectedScene, open, onOpenChange, onSelect, modal }: SceneSelectorChipProps) {
  const [activeFilter, setActiveFilter] = useState<SceneFilter>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const { columns: expandedColumns, setColumns: setExpandedColumns, options: columnOptions } = useExpandedColumns();
  const { asPoses: customPoses } = useCustomScenes();
  const { filterVisible } = useHiddenScenes();
  const { sortScenes, applyCategoryOverrides, deriveCategoryOrder } = useSceneSortOrder();

  const rawPoses = applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...customPoses]);
  const allPoses = sortScenes(rawPoses);
  const derivedOrder = deriveCategoryOrder(allPoses);
  const allCategories: PoseCategory[] = derivedOrder.length > 0
    ? derivedOrder as PoseCategory[]
    : Object.keys(poseCategoryLabels) as PoseCategory[];
  const visibleCategories = activeFilter === 'all'
    ? allCategories
    : filterCategoryMap[activeFilter];

  const handleSelect = (scene: TryOnPose | null) => {
    onSelect(scene);
    onOpenChange(false);
    setIsExpanded(false);
  };

  const handleExpand = () => {
    onOpenChange(false);
    setIsExpanded(true);
  };

  const renderFilterTabs = (expanded: boolean) => (
    <div className={cn('flex items-center mb-3 flex-wrap gap-2', expanded && 'mb-4 justify-between')}>
      <div className={cn('flex gap-1', expanded && 'gap-1.5 sm:gap-2')}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'rounded-full font-medium transition-colors',
              expanded
                ? 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm'
                : 'px-2.5 py-1 text-[10px]',
              activeFilter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {expanded && (
        <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 p-0.5 sm:p-1 rounded-full">
          <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground mx-0.5 sm:mx-1" />
          {columnOptions.map(n => (
            <button
              key={n}
              onClick={() => setExpandedColumns(n)}
              className={cn(
                'w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-semibold transition-colors',
                expandedColumns === n
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderGrid = (expanded: boolean) => (
    <div className={cn('overflow-y-auto space-y-3 pr-1', expanded ? 'max-h-[70vh]' : 'max-h-72')}>
      {visibleCategories.map(cat => {
        const poses = allPoses.filter(p => p.category === cat);
        if (poses.length === 0) return null;
        return (
          <div key={cat}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-1.5 px-1">
              {poseCategoryLabels[cat]}
            </p>
            <div className={cn('grid gap-1.5', expanded ? `gap-2` : 'grid-cols-3')} style={expanded ? { gridTemplateColumns: `repeat(${expandedColumns}, minmax(0, 1fr))` } : undefined}>
              {poses.map(pose => (
                <button
                  key={pose.poseId}
                  onClick={() => handleSelect(pose)}
                  className={cn(
                    'rounded-lg overflow-hidden border-2 transition-all',
                    selectedScene?.poseId === pose.poseId
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <img src={pose.previewUrl} alt={pose.name} className="w-full aspect-[4/5] object-cover" />
                  <div className="px-1.5 py-1 bg-background">
                    <p className={cn('font-medium text-foreground leading-tight truncate', expanded ? 'text-[10px]' : 'text-[9px]')}>{pose.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
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
        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 lg:w-[480px] p-3" align="start">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
              Scene / Environment
            </p>
            <div className="flex items-center gap-1.5">
              {selectedScene && (
                <button
                  onClick={() => handleSelect(null)}
                  className="text-[10px] text-primary hover:underline"
                >
                  Clear selection
                </button>
              )}
              <button
                onClick={handleExpand}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Expand view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {renderFilterTabs(false)}
          {renderGrid(false)}

          <div className="mt-2">
            <MissingRequestBanner category="scene" compact />
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pr-8">
            <DialogTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
              Scene / Environment
            </DialogTitle>
            {selectedScene && (
              <button
                onClick={() => handleSelect(null)}
                className="text-[10px] text-primary hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>

          {renderFilterTabs(true)}
          {renderGrid(true)}

          <div className="mt-2">
            <MissingRequestBanner category="scene" compact />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
