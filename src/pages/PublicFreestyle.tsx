import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { PublicDiscoverDetailModal } from '@/components/app/PublicDiscoverDetailModal';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { useDiscoverPresets } from '@/hooks/useDiscoverPresets';
import { useFeaturedItems, useToggleFeatured } from '@/hooks/useFeaturedItems';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { FreestylePromptPanel } from '@/components/app/freestyle/FreestylePromptPanel';
import { mockTryOnPoses, mockModels } from '@/data/mockData';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useSceneSortOrder } from '@/hooks/useSceneSortOrder';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ModelProfile, TryOnPose, FramingOption } from '@/types';
import type { FreestyleAspectRatio } from '@/components/app/freestyle/FreestyleSettingsChips';
import type { ImageRole, EditIntent } from '@/components/app/freestyle/ImageRoleSelector';

function getItemId(item: DiscoverItem): string {
  return item.type === 'preset' ? item.data.id : item.data.poseId;
}

function useColumnCount() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w < 640) return 2;
    if (w < 1024) return 3;
    return 4;
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCount(2);
      else if (w < 1024) setCount(3);
      else setCount(4);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

export default function PublicFreestyle() {
  const navigate = useNavigate();
  const { itemId: urlItemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Redirect authenticated users to the app version
  useEffect(() => {
    if (user) navigate('/app/freestyle', { replace: true });
  }, [user, navigate]);

  const { data: allPresets = [], isLoading } = useDiscoverPresets();
  const { featuredMap, isFeatured } = useFeaturedItems();
  const toggleFeatured = useToggleFeatured();
  const { isSaved, toggleSave } = useSavedItems();
  const { isAdmin } = useIsAdmin();
  const columnCount = useColumnCount();

  // Scene data for prompt bar
  const { asPoses: customScenePoses } = useCustomScenes();
  const { filterVisible } = useHiddenScenes();
  const { sortScenes, applyCategoryOverrides } = useSceneSortOrder();

  const allScenes = useMemo(
    () => sortScenes(applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...filterVisible(customScenePoses)])),
    [mockTryOnPoses, customScenePoses, sortScenes, applyCategoryOverrides, filterVisible]
  );

  // Prompt bar state
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState<TryOnPose | null>(null);
  const [scenePopoverOpen, setScenePopoverOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<FreestyleAspectRatio>('1:1');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [cameraStyle, setCameraStyle] = useState<'pro' | 'natural'>('pro');
  const [framing, setFraming] = useState<FramingOption | null>(null);
  const [framingPopoverOpen, setFramingPopoverOpen] = useState(false);
  const [imageRole, setImageRole] = useState<ImageRole>('edit');
  const [editIntent, setEditIntent] = useState<EditIntent[]>([]);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);

  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  const canGenerate = !!(prompt.trim() || selectedModel || selectedScene);

  const isDirty = !!(prompt || selectedModel || selectedScene || framing || aspectRatio !== '1:1');

  const handleReset = useCallback(() => {
    setPrompt('');
    setSelectedModel(null);
    setSelectedScene(null);
    setAspectRatio('1:1');
    setCameraStyle('pro');
    setQuality('standard');
    setFraming(null);
  }, []);

  // Generate → auth redirect
  const handleGenerate = useCallback(() => {
    const params = new URLSearchParams();
    if (prompt) params.set('prompt', prompt);
    if (selectedModel) params.set('modelId', selectedModel.modelId);
    if (selectedScene) params.set('sceneId', selectedScene.poseId);
    if (aspectRatio !== '1:1') params.set('ratio', aspectRatio);
    const target = `/app/freestyle${params.toString() ? `?${params.toString()}` : ''}`;
    if (user) {
      navigate(target);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(target)}`);
    }
  }, [prompt, selectedModel, selectedScene, aspectRatio, user, navigate]);

  // Filter to freestyle-only presets (no workflow_slug)
  const freestylePresets = useMemo(
    () => allPresets.filter((p) => !p.workflow_slug),
    [allPresets]
  );

  // Track views
  const viewedItemsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedItem || !user || selectedItem.type !== 'preset') return;
    const key = `preset:${getItemId(selectedItem)}`;
    if (viewedItemsRef.current.has(key)) return;
    viewedItemsRef.current.add(key);
    supabase.from('discover_item_views').insert({
      item_type: 'preset',
      item_id: getItemId(selectedItem),
    }).then();
  }, [selectedItem, user]);

  const { data: viewCount } = useQuery({
    queryKey: ['discover-view-count', 'preset', selectedItem?.type === 'preset' ? getItemId(selectedItem) : null],
    queryFn: async () => {
      if (!selectedItem || selectedItem.type !== 'preset') return 0;
      const { count } = await supabase
        .from('discover_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', 'preset')
        .eq('item_id', getItemId(selectedItem));
      return count ?? 0;
    },
    enabled: !!selectedItem && selectedItem.type === 'preset' && !!user,
  });

  // Build items list
  const allItems = useMemo<DiscoverItem[]>(
    () => freestylePresets.map((p) => ({ type: 'preset' as const, data: p })),
    [freestylePresets]
  );

  // Auto-open from URL
  useEffect(() => {
    if (!urlItemId || allItems.length === 0) return;
    const found = allItems.find((item) => getItemId(item) === urlItemId);
    if (found) setSelectedItem(found);
  }, [urlItemId, allItems]);

  const getItemUrl = useCallback((item: DiscoverItem): string => {
    return `/freestyle/${getItemId(item)}`;
  }, []);

  const handleCardClick = useCallback((item: DiscoverItem) => {
    window.history.pushState(null, '', getItemUrl(item));
    setSelectedItem(item);
  }, [getItemUrl]);

  const handleClose = useCallback(() => {
    setSelectedItem(null);
    window.history.replaceState(null, '', '/freestyle');
  }, []);

  // Sort: featured first, then newest
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aKey = `preset:${getItemId(a)}`;
      const bKey = `preset:${getItemId(b)}`;
      const aFeat = featuredMap.get(aKey);
      const bFeat = featuredMap.get(bKey);
      if (aFeat && !bFeat) return -1;
      if (!aFeat && bFeat) return 1;
      if (aFeat && bFeat) return new Date(bFeat.created_at).getTime() - new Date(aFeat.created_at).getTime();
      const aDate = a.data.created_at ? new Date(a.data.created_at).getTime() : 0;
      const bDate = b.data.created_at ? new Date(b.data.created_at).getTime() : 0;
      return bDate - aDate;
    });
  }, [filtered, featuredMap]);

  // Progressive rendering
  const INITIAL_RENDER_COUNT = 30;
  const LOAD_MORE_COUNT = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVisibleCount(INITIAL_RENDER_COUNT); }, [selectedCategory]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, sorted.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sorted.length]);

  const visibleItems = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);

  // Related items
  const relatedItems = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'preset') return [];
    if (selectedItem.data.scene_name) {
      const sameScene = allItems.filter((i) =>
        i.type === 'preset' &&
        i.data.scene_name === selectedItem.data.scene_name &&
        getItemId(i) !== getItemId(selectedItem)
      );
      if (sameScene.length >= 3) return sameScene.slice(0, 9);
    }
    const selCat = selectedItem.data.category;
    return allItems
      .filter((i) => getItemId(i) !== getItemId(selectedItem) && i.data.category === selCat)
      .slice(0, 9);
  }, [allItems, selectedItem]);

  // "Recreate This" fills the prompt bar instead of redirecting
  const handleRecreateItem = useCallback((item: DiscoverItem) => {
    if (item.type !== 'preset') return;
    const d = item.data;
    if (d.prompt) setPrompt(d.prompt);
    if (d.aspect_ratio) setAspectRatio(d.aspect_ratio as FreestyleAspectRatio);
    if (d.quality) setQuality(d.quality as 'standard' | 'high');
    // Find matching scene/model by name
    if (d.scene_name) {
      const matchScene = allScenes.find(s => s.name === d.scene_name);
      if (matchScene) setSelectedScene(matchScene);
    }
    if (d.model_name) {
      const matchModel = mockModels.find(m => m.name === d.model_name);
      if (matchModel) setSelectedModel(matchModel);
    }
    setSelectedItem(null);
    window.history.replaceState(null, '', '/freestyle');
  }, [allScenes]);

  // Legacy handler for use-item (kept for DiscoverDetailModal)
  const handleUseItem = useCallback((item: DiscoverItem) => {
    handleRecreateItem(item);
  }, [handleRecreateItem]);

  const handleSearchSimilar = useCallback((item: DiscoverItem) => {
    setSelectedItem(null);
    setSelectedCategory(item.data.category);
  }, []);

  const handleToggleSave = useCallback(() => {
    if (!selectedItem) return;
    toggleSave.mutate({ itemType: selectedItem.type, itemId: getItemId(selectedItem) });
  }, [selectedItem, toggleSave]);

  const handleToggleFeatured = useCallback(() => {
    if (!selectedItem) return;
    const itemId = getItemId(selectedItem);
    toggleFeatured.mutate({ itemType: selectedItem.type, itemId, currentlyFeatured: isFeatured(selectedItem.type, itemId) });
  }, [selectedItem, toggleFeatured, isFeatured]);

  return (
    <PageLayout>
      <SEOHead
        title="AI Freestyle Photography — VOVV AI"
        description="Create stunning AI product photography with Freestyle. Choose models, scenes, and styles — generate professional images in seconds."
        canonical={`${SITE_URL}/freestyle`}
      />
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        {/* Scrollable gallery area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
                Freestyle Studio
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                AI-powered product photography. Pick a style below or describe your vision.
              </p>
            </div>

            {/* Category filter */}
            <PublicDiscoverCategoryBar
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-shimmer bg-[length:200%_100%]" />
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">No freestyle images found</p>
                <p className="text-xs text-muted-foreground/70 max-w-xs">
                  Try a different category or{' '}
                  <button onClick={() => setSelectedCategory('all')} className="text-primary hover:underline">
                    browse all
                  </button>
                </p>
              </div>
            ) : (
              (() => {
                const columns: DiscoverItem[][] = Array.from({ length: columnCount }, () => []);
                visibleItems.forEach((item, i) => {
                  columns[i % columnCount].push(item);
                });
                return (
                  <>
                    <div className="flex gap-1">
                      {columns.map((col, colIdx) => (
                        <div key={colIdx} className="flex-1 flex flex-col gap-1">
                          {col.map((item) => {
                            const itemId = getItemId(item);
                            return (
                              <DiscoverCard
                                key={`p-${itemId}`}
                                item={item}
                                onClick={() => handleCardClick(item)}
                                onRecreate={() => handleUseItem(item)}
                                hideLabels
                                {...(user ? {
                                  isSaved: isSaved(item.type, itemId),
                                  onToggleSave: () => toggleSave.mutate({ itemType: item.type, itemId }),
                                  isFeatured: isFeatured(item.type, itemId),
                                  isAdmin,
                                  onToggleFeatured: () => toggleFeatured.mutate({ itemType: item.type, itemId, currentlyFeatured: isFeatured(item.type, itemId) }),
                                } : {})}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    {visibleCount < sorted.length && (
                      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
                    )}
                  </>
                );
              })()
            )}

            {/* Bottom spacer for prompt bar */}
            <div className="h-48 sm:h-40" />
          </div>
        </div>

        {/* Pinned prompt bar */}
        <div className="sticky bottom-0 z-30 w-full">
          <div className="max-w-3xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6">
            <FreestylePromptPanel
              prompt={prompt}
              onPromptChange={setPrompt}
              sourceImagePreview={null}
              onUploadClick={() => {
                if (!user) navigate('/auth?redirect=/app/freestyle');
              }}
              onRemoveImage={() => {}}
              onGenerate={handleGenerate}
              canGenerate={canGenerate}
              isLoading={false}
              progress={0}
              creditCost={0}
              hideCreditCost
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
              modelPopoverOpen={modelPopoverOpen}
              onModelPopoverChange={setModelPopoverOpen}
              selectedScene={selectedScene}
              onSceneSelect={setSelectedScene}
              scenePopoverOpen={scenePopoverOpen}
              onScenePopoverChange={setScenePopoverOpen}
              selectedProduct={null}
              onProductSelect={() => {
                if (!user) navigate('/auth?redirect=/app/freestyle');
              }}
              productPopoverOpen={false}
              onProductPopoverChange={() => {
                if (!user) navigate('/auth?redirect=/app/freestyle');
              }}
              products={[]}
              isLoadingProducts={false}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              selectedBrandProfile={null}
              onBrandProfileSelect={() => {
                if (!user) navigate('/auth?redirect=/app/freestyle');
              }}
              brandProfilePopoverOpen={false}
              onBrandProfilePopoverChange={() => {
                if (!user) navigate('/auth?redirect=/app/freestyle');
              }}
              brandProfiles={[]}
              isLoadingBrandProfiles={false}
              cameraStyle={cameraStyle}
              onCameraStyleChange={setCameraStyle}
              quality={quality}
              onQualityChange={setQuality}
              framing={framing}
              onFramingChange={setFraming}
              framingPopoverOpen={framingPopoverOpen}
              onFramingPopoverChange={setFramingPopoverOpen}
              imageRole={imageRole}
              onImageRoleChange={setImageRole}
              editIntent={editIntent}
              onEditIntentChange={setEditIntent}
              disabledChips={{ product: true }}
              isCollapsed={isMobile ? isPromptCollapsed : undefined}
              onToggleCollapse={isMobile ? () => setIsPromptCollapsed(prev => !prev) : undefined}
              onReset={handleReset}
              isDirty={isDirty}
            />
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {user ? (
        <DiscoverDetailModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={handleClose}
          onUseItem={handleUseItem}
          onSearchSimilar={handleSearchSimilar}
          relatedItems={relatedItems}
          onSelectRelated={(item) => { window.history.replaceState(null, '', getItemUrl(item)); setSelectedItem(item); }}
          isSaved={selectedItem ? isSaved(selectedItem.type, getItemId(selectedItem)) : false}
          onToggleSave={handleToggleSave}
          viewCount={viewCount ?? undefined}
          isAdmin={isAdmin}
          isFeatured={selectedItem ? isFeatured(selectedItem.type, getItemId(selectedItem)) : false}
          onToggleFeatured={handleToggleFeatured}
        />
      ) : (
        <PublicDiscoverDetailModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={handleClose}
          relatedItems={relatedItems}
          onSelectRelated={(item) => { window.history.replaceState(null, '', getItemUrl(item)); setSelectedItem(item); }}
          onRecreate={handleRecreateItem}
        />
      )}
    </PageLayout>
  );
}
