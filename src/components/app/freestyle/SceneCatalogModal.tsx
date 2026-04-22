import { useMemo, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import {
  SceneCatalogFiltersBar, QUICK_CHIPS, type FilterChipDef,
} from './SceneCatalogFilters';
import { SceneCatalogSidebar } from './SceneCatalogSidebar';
import { SceneCatalogRail } from './SceneCatalogRail';
import { SceneCatalogGrid } from './SceneCatalogGrid';
import { useSceneCatalog, useSceneRail, type CatalogScene } from '@/hooks/useSceneCatalog';
import { useSceneCounts } from '@/hooks/useSceneCounts';
import { useRecommendedScenes } from '@/hooks/useRecommendedScenes';
import { SHOT_STYLE_LABEL, SUBJECT_LABEL, type SceneShotStyle, type SceneSubject } from '@/lib/sceneTaxonomy';

interface SceneCatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** scene_id of currently-selected Product Visuals scene (without pis- prefix) */
  selectedPisSceneId?: string | null;
  onSelect: (scene: CatalogScene) => void;
}

export function SceneCatalogModal({ open, onOpenChange, selectedPisSceneId, onSelect }: SceneCatalogModalProps) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [shotStyles, setShotStyles] = useState<string[]>([]);
  const [settings, setSettings] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sort, setSort] = useState<'recommended' | 'popular' | 'new'>('recommended');
  const [pendingScene, setPendingScene] = useState<CatalogScene | null>(null);

  // Debounce search
  useMemo(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const anyFilterActive =
    !!debouncedSearch ||
    subjects.length > 0 ||
    shotStyles.length > 0 ||
    settings.length > 0 ||
    collections.length > 0 ||
    filterTags.length > 0 ||
    sort !== 'recommended';

  const filters = {
    search: debouncedSearch,
    subjects,
    shotStyles,
    settings,
    collections,
    filterTags,
    sort,
  };

  // Default rails (only when no filters)
  const showRails = !anyFilterActive;

  const recommended = useRecommendedScenes(open && showRails);
  const productOnlyRail = useSceneRail('product-only', { subjects: ['product-only'] }, 12, open && showRails);
  const withModelRail = useSceneRail('with-model', { subjects: ['with-model'] }, 12, open && showRails);
  const editorialRail = useSceneRail('editorial', { shotStyles: ['editorial', 'campaign'] }, 12, open && showRails);

  // Filtered grid
  const grid = useSceneCatalog(filters, open && !showRails);
  const counts = useSceneCounts();

  const activeChipKeys = useMemo(() => {
    const set = new Set<string>();
    for (const chip of QUICK_CHIPS) {
      if (chip.axis === 'subject' && subjects.includes(chip.value)) set.add(chip.key);
      if (chip.axis === 'shot_style' && shotStyles.includes(chip.value)) set.add(chip.key);
      if (chip.axis === 'setting' && settings.includes(chip.value)) set.add(chip.key);
      if (chip.axis === 'tag' && filterTags.includes(chip.value)) set.add(chip.key);
    }
    return set;
  }, [subjects, shotStyles, settings, filterTags]);

  const toggleArr = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

  const handleChipToggle = (chip: FilterChipDef) => {
    if (chip.axis === 'subject') setSubjects(prev => toggleArr(prev, chip.value));
    else if (chip.axis === 'shot_style') setShotStyles(prev => toggleArr(prev, chip.value));
    else if (chip.axis === 'setting') setSettings(prev => toggleArr(prev, chip.value));
    else if (chip.axis === 'tag') setFilterTags(prev => toggleArr(prev, chip.value));
  };

  const handleSidebarToggle = (
    axis: 'subject' | 'shot_style' | 'setting' | 'collection',
    value: string,
  ) => {
    if (axis === 'subject') setSubjects(prev => toggleArr(prev, value));
    else if (axis === 'shot_style') setShotStyles(prev => toggleArr(prev, value));
    else if (axis === 'setting') setSettings(prev => toggleArr(prev, value));
    else setCollections(prev => toggleArr(prev, value));
  };

  const clearAll = () => {
    setSubjects([]); setShotStyles([]); setSettings([]);
    setCollections([]); setFilterTags([]);
    setSearch(''); setDebouncedSearch('');
    setSort('recommended');
  };

  const handleSelect = (scene: CatalogScene) => {
    setPendingScene(scene);
  };

  const handleConfirm = () => {
    if (pendingScene) {
      onSelect(pendingScene);
      setPendingScene(null);
      onOpenChange(false);
    }
  };

  const handleViewAll = (axis: 'subject' | 'shot_style', value: string) => {
    clearAll();
    if (axis === 'subject') setSubjects([value]);
    else setShotStyles([value]);
  };

  const currentSelectedId = pendingScene?.scene_id ?? selectedPisSceneId ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'p-0 gap-0 flex flex-col',
          isMobile
            ? 'h-[100vh] w-full max-w-none rounded-none'
            : 'w-[92vw] max-w-[1500px] sm:max-w-[1500px]',
        )}
      >
        {/* Header */}
        <header className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-border/40">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Select Scene</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Find the right shot for your product — over 1,000 curated scenes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </header>

        {/* Filter bar */}
        <SceneCatalogFiltersBar
          search={search}
          onSearchChange={setSearch}
          activeChipKeys={activeChipKeys}
          onChipToggle={handleChipToggle}
          onClearAll={clearAll}
          anyActive={anyFilterActive}
          sort={sort}
          onSortChange={setSort}
          showMobileFiltersBtn={false}
        />

        {/* Body: sidebar + content */}
        <div className="flex-1 flex min-h-0">
          <SceneCatalogSidebar
            counts={counts.data}
            selectedSubjects={subjects}
            selectedShotStyles={shotStyles}
            selectedSettings={settings}
            selectedCollections={collections}
            onToggle={handleSidebarToggle}
          />

          <ScrollArea className="flex-1">
            <div className="px-4 sm:px-6 py-5 space-y-6">
              {showRails ? (
                <>
                  <SceneCatalogRail
                    title="Recommended for you"
                    scenes={recommended.data}
                    isLoading={recommended.isLoading}
                    selectedSceneId={currentSelectedId}
                    onSelect={handleSelect}
                  />
                  <SceneCatalogRail
                    title="Product Only"
                    scenes={productOnlyRail.data}
                    isLoading={productOnlyRail.isLoading}
                    selectedSceneId={currentSelectedId}
                    onSelect={handleSelect}
                    onViewAll={() => handleViewAll('subject', 'product-only')}
                  />
                  <SceneCatalogRail
                    title="With Model"
                    scenes={withModelRail.data}
                    isLoading={withModelRail.isLoading}
                    selectedSceneId={currentSelectedId}
                    onSelect={handleSelect}
                    onViewAll={() => handleViewAll('subject', 'with-model')}
                  />
                  <SceneCatalogRail
                    title="Editorial"
                    scenes={editorialRail.data}
                    isLoading={editorialRail.isLoading}
                    selectedSceneId={currentSelectedId}
                    onSelect={handleSelect}
                    onViewAll={() => handleViewAll('shot_style', 'editorial')}
                  />
                </>
              ) : (
                <SceneCatalogGrid
                  pages={grid.data?.pages ?? []}
                  isLoading={grid.isLoading}
                  isFetchingNextPage={grid.isFetchingNextPage}
                  hasNextPage={!!grid.hasNextPage}
                  onLoadMore={() => grid.fetchNextPage()}
                  selectedSceneId={currentSelectedId}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-background px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {pendingScene ? (
              <>
                {pendingScene.preview_image_url && (
                  <img
                    src={getOptimizedUrl(pendingScene.preview_image_url, { quality: 60 })}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{pendingScene.title}</p>
                  <div className="flex gap-1 mt-0.5">
                    {pendingScene.subject && (
                      <span className="text-[10px] text-muted-foreground">
                        {SUBJECT_LABEL[pendingScene.subject as SceneSubject]}
                      </span>
                    )}
                    {pendingScene.shot_style && (
                      <span className="text-[10px] text-muted-foreground">
                        · {SHOT_STYLE_LABEL[pendingScene.shot_style as SceneShotStyle]}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Pick a scene to continue.</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={!pendingScene} onClick={handleConfirm}>
              Use scene
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
