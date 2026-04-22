import { useState } from 'react';
import { Camera, ChevronDown, X, Check } from 'lucide-react';
import { SceneCatalogModal } from './SceneCatalogModal';
import { sanitizePromptTemplate, toPisSceneId, fromPisSceneId, isPisSceneId } from '@/lib/sceneTaxonomy';
import type { CatalogScene } from '@/hooks/useSceneCatalog';

const CATALOG_V2_ENABLED = (import.meta.env.VITE_SCENE_CATALOG_V2 ?? 'true') !== 'false';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePickerSheet } from './MobilePickerSheet';
import type { TryOnPose, PoseCategory } from '@/types';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useSceneSortOrder } from '@/hooks/useSceneSortOrder';
import { MissingRequestBanner } from '@/components/app/MissingRequestBanner';
import { LayoutGrid } from 'lucide-react';
import { useEffect, useCallback } from 'react';

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

interface SceneSelectorChipProps {
  selectedScene: TryOnPose | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (scene: TryOnPose | null) => void;
  modal?: boolean;
  fullWidth?: boolean;
}

type SceneFilter = 'all' | 'on-model' | 'product';

const filterTabs: { key: SceneFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'on-model', label: 'On-Model' },
  { key: 'product', label: 'Product' },
];

const ON_MODEL_CATEGORIES: PoseCategory[] = ['studio', 'lifestyle', 'editorial', 'streetwear'];

/**
 * Convert a Product Visuals CatalogScene → TryOnPose shape consumed by Freestyle.
 * - poseId is namespaced with `pis-` so it never collides with mock/custom poseIds.
 * - promptHint is sanitized (template tokens stripped).
 * - category falls back to a neutral non-on-model bucket when subject != with-model,
 *   so the Freestyle auto-prompt doesn't inject "worn by a model" for product-only shots.
 */
function pisSceneToPose(scene: CatalogScene): TryOnPose {
  const isWithModel = scene.subject === 'with-model';
  const category: PoseCategory = isWithModel
    ? 'lifestyle'
    : scene.shot_style === 'editorial' || scene.shot_style === 'campaign'
      ? 'product-editorial'
      : 'clean-studio';

  return {
    poseId: toPisSceneId(scene.scene_id),
    name: scene.title,
    category,
    description: scene.sub_category ?? '',
    promptHint: sanitizePromptTemplate(scene.prompt_template),
    previewUrl: scene.preview_image_url ?? '',
    promptOnly: false,
  } as TryOnPose;
}

export function SceneSelectorChip({ selectedScene, open, onOpenChange, onSelect, modal, fullWidth }: SceneSelectorChipProps) {
  const [activeFilter, setActiveFilter] = useState<SceneFilter>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const { columns: expandedColumns, setColumns: setExpandedColumns, options: columnOptions } = useExpandedColumns();
  const { asPoses: customPoses } = useCustomScenes();
  const { filterVisible } = useHiddenScenes();
  const { sortScenes, applyCategoryOverrides, deriveCategoryOrder } = useSceneSortOrder();
  const isMobile = useIsMobile();

  const rawPoses = applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...customPoses]);
  const allPoses = sortScenes(rawPoses);
  const derivedOrder = deriveCategoryOrder(allPoses);
  const allCategories: PoseCategory[] = derivedOrder.length > 0
    ? derivedOrder as PoseCategory[]
    : Object.keys(poseCategoryLabels) as PoseCategory[];
  const visibleCategories = activeFilter === 'all'
    ? allCategories
    : activeFilter === 'on-model'
      ? ON_MODEL_CATEGORIES
      : allCategories.filter(cat => !ON_MODEL_CATEGORIES.includes(cat));

  const handleSelect = (scene: TryOnPose | null) => {
    onSelect(scene);
    onOpenChange(false);
    setIsExpanded(false);
  };

  const handleCatalogSelect = (scene: CatalogScene) => {
    onSelect(pisSceneToPose(scene));
    onOpenChange(false);
  };

  const handleCatalogSelectLegacy = (pose: TryOnPose) => {
    onSelect(pose);
    onOpenChange(false);
  };

  const selectedLegacyPoseId =
    selectedScene && !isPisSceneId(selectedScene.poseId)
      ? selectedScene.poseId
      : null;

  const selectedPisSceneId =
    selectedScene && isPisSceneId(selectedScene.poseId)
      ? fromPisSceneId(selectedScene.poseId)
      : null;

  const renderFilterTabs = (expanded: boolean) => (
    <div className={cn('flex items-center mb-4 flex-wrap gap-2', expanded && 'justify-between')}>
      <div className={cn('flex gap-1.5', expanded && 'gap-2')}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'rounded-full font-medium transition-colors',
              expanded
                ? 'px-3.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm'
                : 'px-3.5 py-1.5 text-xs',
              activeFilter === tab.key
                ? 'bg-foreground text-background'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
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
    <div className={cn('overflow-y-auto space-y-4 pr-1', expanded ? 'max-h-[70vh]' : 'max-h-[420px]')}>
      {visibleCategories.map(cat => {
        const poses = allPoses.filter(p => p.category === cat);
        if (poses.length === 0) return null;
        return (
          <div key={cat}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-2 mt-1 px-1">
              {poseCategoryLabels[cat]}
            </p>
            <div className={cn('grid gap-2.5', expanded ? 'gap-2.5' : 'grid-cols-3')} style={expanded ? { gridTemplateColumns: `repeat(${expandedColumns}, minmax(0, 1fr))` } : undefined}>
              {poses.map(pose => {
                const isSelected = selectedScene?.poseId === pose.poseId;
                return (
                  <button
                    key={pose.poseId}
                    onClick={() => handleSelect(pose)}
                    className={cn(
                      'relative rounded-lg overflow-hidden border-2 transition-all duration-200',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-border/60 hover:shadow-sm hover:-translate-y-0.5'
                    )}
                  >
                    <ShimmerImage
                      src={getOptimizedUrl(pose.previewUrl, { quality: 60 })}
                      alt={pose.name}
                      className="w-full aspect-[4/5] object-cover"
                      wrapperClassName="h-auto"
                      aspectRatio="4/5"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                    <div className="px-2 py-2 bg-background min-h-[2.75rem] flex items-start">
                      <p className={cn('font-medium text-foreground leading-tight line-clamp-2', expanded ? 'text-[11px]' : 'text-[11px]')}>{pose.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const triggerButton = (
    <button
      onClick={(isMobile || CATALOG_V2_ENABLED) ? () => onOpenChange(!open) : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors min-w-0",
        fullWidth ? "w-full max-w-none" : "max-w-[140px]"
      )}
    >
      {selectedScene ? (
        <>
          <img src={getOptimizedUrl(selectedScene.previewUrl, { quality: 60 })} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
          <span className="truncate flex-1 min-w-0 text-left">{selectedScene.name}</span>
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onSelect(null); }}
            className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 shrink-0"
          >
            <X className="w-3 h-3" />
          </span>
        </>
      ) : (
        <>
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Scene</span>
        </>
      )}
      <ChevronDown className="w-3 h-3 opacity-40 shrink-0" />
    </button>
  );

  // V2 Catalog Modal — full-screen sheet (replaces popover when flag is on)
  if (CATALOG_V2_ENABLED) {
    return (
      <>
        {triggerButton}
        <SceneCatalogModal
          open={open}
          onOpenChange={onOpenChange}
          selectedPisSceneId={selectedPisSceneId}
          selectedLegacyPoseId={selectedLegacyPoseId}
          onSelect={handleCatalogSelect}
          onSelectLegacy={handleCatalogSelectLegacy}
        />
      </>
    );
  }

  const pickerContent = (
    <>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Scene / Environment</h3>
          {selectedScene && (
            <button
              onClick={() => handleSelect(null)}
              className="text-[11px] text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Choose a scene to guide mood, framing, and visual context</p>
      </div>

      {renderFilterTabs(false)}
      {renderGrid(false)}

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-border/30">
        <MissingRequestBanner category="scene" compact />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <MobilePickerSheet open={open} onOpenChange={onOpenChange} title="Scene / Environment">
          {pickerContent}
        </MobilePickerSheet>
      </>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
        <PopoverContent className="w-[min(520px,calc(100vw-2rem))] p-4 rounded-xl border-border/50 shadow-xl shadow-black/8" align="start">
          {pickerContent}
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

          <div className="pt-3 mt-3 border-t border-border/30">
            <MissingRequestBanner category="scene" compact />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
