import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import {
  SceneCatalogFiltersBar, QUICK_CHIPS, type FilterChipDef,
} from './SceneCatalogFilters';
import { SceneCatalogSidebar, type QuickView } from './SceneCatalogSidebar';
import { SceneCatalogGrid } from './SceneCatalogGrid';
import { useSceneCatalog, useInterleavedSceneCatalog, type CatalogScene } from '@/hooks/useSceneCatalog';
import { useSceneCounts } from '@/hooks/useSceneCounts';
import { useRecommendedScenes } from '@/hooks/useRecommendedScenes';
import { useCustomScenes, type CustomScene } from '@/hooks/useCustomScenes';
import type { TryOnPose, PoseCategory } from '@/types';

interface SceneCatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** scene_id of currently-selected Product Visuals scene (without pis- prefix) */
  selectedPisSceneId?: string | null;
  /** poseId of currently-selected mock/legacy pose (no prefix) */
  selectedLegacyPoseId?: string | null;
  onSelect: (scene: CatalogScene) => void;
  /** Called when the user picks one of the original Freestyle scenes (mockTryOnPoses). */
  onSelectLegacy?: (pose: TryOnPose) => void;
}


/** Convert a CustomScene back into a TryOnPose for the legacy onSelectLegacy handoff. */
function customSceneToTryOnPose(scene: CustomScene): TryOnPose {
  return {
    poseId: `custom-${scene.id}`,
    name: scene.name,
    category: scene.category as PoseCategory,
    description: scene.description,
    promptHint: scene.prompt_hint || scene.description,
    previewUrl: scene.preview_image_url || scene.image_url,
    optimizedImageUrl: scene.optimized_image_url || undefined,
    created_at: scene.created_at,
    promptOnly: scene.prompt_only || false,
  };
}

export function SceneCatalogModal({
  open,
  onOpenChange,
  selectedPisSceneId,
  selectedLegacyPoseId,
  onSelect,
  onSelectLegacy,
}: SceneCatalogModalProps) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [family, setFamily] = useState<string | null>(null);
  const [categoryCollection, setCategoryCollection] = useState<string | null>(null);
  const [quickView, setQuickView] = useState<QuickView>('all');
  const [sort, setSort] = useState<'recommended' | 'new'>('recommended');
  const [pendingScene, setPendingScene] = useState<CatalogScene | null>(null);
  const [pendingLegacy, setPendingLegacy] = useState<TryOnPose | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Client-side pagination for the default interleaved view.
  const PAGE_SIZE = 24;
  const [visiblePageCount, setVisiblePageCount] = useState(1);

  // Ref to the Radix ScrollArea viewport so we can reset scroll on section changes.
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      viewportRef.current = null;
      return;
    }
    viewportRef.current = node.querySelector(
      '[data-radix-scroll-area-viewport]',
    ) as HTMLDivElement | null;
  }, []);

  // Reset scroll + visible page count whenever the user changes section/filter/sort.
  useEffect(() => {
    setVisiblePageCount(1);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0 });
    }
  }, [quickView, family, categoryCollection, subjects, debouncedSearch, sort]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const anyFilterActive =
    !!debouncedSearch ||
    subjects.length > 0 ||
    family !== null ||
    categoryCollection !== null ||
    quickView !== 'all';

  // Build filters for the grid query depending on the active quick view.
  const filters = useMemo(() => {
    const base = {
      search: debouncedSearch,
      subjects,
      family,
      categoryCollection,
      sort,
    };
    if (quickView === 'new') return { ...base, sort: 'new' as const };
    return base;
  }, [debouncedSearch, subjects, family, categoryCollection, sort, quickView]);

  // Default rails (only when no filters AND quickView === 'all')
  const showRails = !anyFilterActive;

  const recommended = useRecommendedScenes(open && (showRails || quickView === 'recommended'));

  // Default grid: full Freestyle catalog (no filters, excluding Essential Shots).
  // When filters are active we use the same hook with the user-selected filters.
  const useGrid = quickView !== 'recommended';
  const grid = useSceneCatalog({ ...filters, excludeEssentials: true }, open && useGrid && anyFilterActive);
  const interleavedGrid = useInterleavedSceneCatalog(open && useGrid && !anyFilterActive, 2);
  const counts = useSceneCounts();

  // Custom scenes kept only to resolve `cs-` selection IDs from prior sessions.
  const customScenesQuery = useCustomScenes();

  // Recommended rail — strip any "Essential Shots" rows defensively.
  const recommendedScenes = useMemo<CatalogScene[]>(() => {
    const data = (recommended.data ?? []) as CatalogScene[];
    return data.filter(s => !s.sub_category?.toLowerCase().includes('essential'));
  }, [recommended.data]);

  const newCount = useMemo(() => {
    // Fast approximation — we don't fetch a separate count; just show no badge.
    return undefined;
  }, []);

  const activeChipKeys = useMemo(() => {
    const set = new Set<string>();
    for (const chip of QUICK_CHIPS) {
      if (chip.axis === 'subject' && subjects.includes(chip.value)) set.add(chip.key);
    }
    return set;
  }, [subjects]);

  const toggleArr = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

  const handleChipToggle = (chip: FilterChipDef) => {
    if (chip.axis === 'subject') {
      // Mutually exclusive: toggling one subject clears any other and replaces it.
      setSubjects(prev => (prev.includes(chip.value) ? [] : [chip.value]));
    }
    setQuickView('all');
  };

  const handleToggleSubject = (value: string) => {
    setSubjects(prev => toggleArr(prev, value));
    setQuickView('all');
  };

  const handleSelectFamily = (next: string | null) => {
    setFamily(next);
    if (next === null) setCategoryCollection(null);
    else if (next !== family) setCategoryCollection(null);
    setQuickView('all');
  };

  const handleSelectCategoryCollection = (slug: string | null) => {
    setCategoryCollection(slug);
    setQuickView('all');
  };

  const handleSelectQuickView = (view: QuickView) => {
    setQuickView(view);
    if (view !== 'all') {
      setFamily(null);
      setCategoryCollection(null);
    }
    if (view === 'all') {
      setSubjects([]);
      setFamily(null);
      setCategoryCollection(null);
      setSearch('');
      setDebouncedSearch('');
      setSort('recommended');
    }
  };

  const clearAll = () => {
    setSubjects([]);
    setFamily(null);
    setCategoryCollection(null);
    setSearch('');
    setDebouncedSearch('');
    setSort('recommended');
    setQuickView('all');
  };

  const handleSelect = (scene: CatalogScene) => {
    if (scene.id.startsWith('cs-')) {
      // Resolve back to the original custom_scenes row to emit a TryOnPose-shaped object.
      const row = (customScenesQuery.scenes ?? []).find(s => s.id === scene.scene_id);
      if (row) {
        setPendingLegacy(customSceneToTryOnPose(row));
        setPendingScene(null);
        return;
      }
    }
    setPendingScene(scene);
    setPendingLegacy(null);
  };

  const handleConfirm = () => {
    if (pendingLegacy && onSelectLegacy) {
      onSelectLegacy(pendingLegacy);
      setPendingScene(null);
      setPendingLegacy(null);
      onOpenChange(false);
      return;
    }
    if (pendingScene) {
      onSelect(pendingScene);
      setPendingScene(null);
      setPendingLegacy(null);
      onOpenChange(false);
    }
  };

  const handleViewAllSubject = (value: string) => {
    setSubjects([value]);
    setFamily(null);
    setQuickView('all');
  };

  const currentSelectedId =
    pendingLegacy?.poseId ??
    pendingScene?.scene_id ??
    selectedPisSceneId ??
    selectedLegacyPoseId ??
    null;

  const footerThumb = pendingLegacy?.previewUrl ?? pendingScene?.preview_image_url ?? null;
  const footerTitle = pendingLegacy?.name ?? pendingScene?.title ?? null;

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
              Find the right shot for your product — 1,200+ curated scenes.
            </p>
          </div>
        </header>

        {/* Filter bar */}
        <SceneCatalogFiltersBar
          search={search}
          onSearchChange={v => { setSearch(v); setQuickView('all'); }}
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
            selectedFamily={family}
            selectedCategoryCollection={categoryCollection}
            selectedSubjects={subjects}
            quickView={quickView}
            recommendedCount={recommended.data?.length}
            newCount={newCount}
            onSelectFamily={handleSelectFamily}
            onSelectCategoryCollection={handleSelectCategoryCollection}
            onSelectQuickView={handleSelectQuickView}
          />

          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {showRails ? (() => {
                const fullList = interleavedGrid.data?.pages?.[0] ?? [];
                const visible = fullList.slice(0, visiblePageCount * PAGE_SIZE);
                const hasMore = fullList.length > visible.length;
                return (
                  <SceneCatalogGrid
                    pages={[visible]}
                    isLoading={interleavedGrid.isLoading}
                    isFetchingNextPage={false}
                    hasNextPage={hasMore}
                    onLoadMore={() => setVisiblePageCount(c => c + 1)}
                    selectedSceneId={currentSelectedId}
                    onSelect={handleSelect}
                  />
                );
              })() : quickView === 'recommended' ? (
                <SceneCatalogGrid
                  pages={[recommendedScenes]}
                  isLoading={recommended.isLoading}
                  isFetchingNextPage={false}
                  hasNextPage={false}
                  onLoadMore={() => {}}
                  selectedSceneId={currentSelectedId}
                  onSelect={handleSelect}
                />
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
            {footerTitle ? (
              <>
                {footerThumb && (
                  <img
                    src={getOptimizedUrl(footerThumb, { quality: 60 })}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{footerTitle}</p>
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
            <Button
              size="sm"
              disabled={!pendingScene && !pendingLegacy}
              onClick={handleConfirm}
            >
              Use scene
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
