import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { PublicDiscoverDetailModal } from '@/components/app/PublicDiscoverDetailModal';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { useDiscoverPresets } from '@/hooks/useDiscoverPresets';
import { useFeaturedItems, useToggleFeatured } from '@/hooks/useFeaturedItems';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { mockTryOnPoses } from '@/data/mockData';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { PublicDiscoverCategoryBar } from '@/components/app/DiscoverCategoryBar';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { getItemSlug } from '@/lib/slugUtils';
import type { TryOnPose, PoseCategory } from '@/types';

interface PublicCustomScene {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

function toTryOnPose(scene: PublicCustomScene): TryOnPose {
  return {
    poseId: `custom-${scene.id}`,
    name: scene.name,
    category: scene.category as PoseCategory,
    description: scene.description,
    promptHint: scene.description,
    previewUrl: scene.image_url,
    created_at: scene.created_at,
  };
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'sports', label: 'Sports' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'supplements', label: 'Health' },
] as const;



function getItemId(item: DiscoverItem): string {
  return item.type === 'preset' ? item.data.id : item.data.poseId;
}

function getItemCategory(item: DiscoverItem): string {
  return item.data.category;
}

function resolveCategory(cat: string): string {
  return cat;
}

function itemMatchesProductCategory(item: DiscoverItem, productCat: string): boolean {
  if (item.data.category === productCat) return true;
  const cats = (item.data as any).discover_categories;
  return Array.isArray(cats) && cats.includes(productCat);
}

function getResponsiveInitialCount() {
  if (typeof window === 'undefined') return 30;
  const w = window.innerWidth;
  if (w < 640) return 12;
  if (w < 1024) return 20;
  return 30;
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

export default function PublicDiscover() {
  const navigate = useNavigate();
  const { itemId: urlItemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const presetsLoaded = presets.length > 0;
  const { featuredMap, isFeatured } = useFeaturedItems();
  const toggleFeatured = useToggleFeatured();
  const { isSaved, toggleSave } = useSavedItems();
  const { isAdmin } = useIsAdmin();
  const columnCount = useColumnCount();
  const { filterVisible } = useHiddenScenes();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  // Fetch custom scenes publicly (no auth required with new RLS)
  const { data: customScenes = [] } = useQuery({
    queryKey: ['public-custom-scenes'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_custom_scenes');
      if (error) throw error;
      return (data as unknown as PublicCustomScene[]) ?? [];
    },
  });

  const customScenePoses = useMemo(() => customScenes.map(toTryOnPose), [customScenes]);

  // Track views when modal opens (deduplicated per session)
  const viewedItemsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedItem || !user) return;
    const key = `${selectedItem.type}:${getItemId(selectedItem)}`;
    if (viewedItemsRef.current.has(key)) return;
    viewedItemsRef.current.add(key);
    supabase.from('discover_item_views').insert({
      item_type: selectedItem.type,
      item_id: getItemId(selectedItem),
    }).then();
  }, [selectedItem, user]);

  // Fetch view count for selected item
  const { data: viewCount } = useQuery({
    queryKey: ['discover-view-count', selectedItem?.type, selectedItem ? getItemId(selectedItem) : null],
    queryFn: async () => {
      if (!selectedItem) return 0;
      const { count } = await supabase
        .from('discover_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', selectedItem.type)
        .eq('item_id', getItemId(selectedItem));
      return count ?? 0;
    },
    enabled: !!selectedItem && !!user,
  });

  // Build unified feed — deduplicate scenes that have been promoted to presets
  const allItems = useMemo<DiscoverItem[]>(() => {
    const presetItems: DiscoverItem[] = presets.map((p) => ({ type: 'preset', data: p }));
    const presetTitles = new Set(presets.map((p) => p.title));
    const sceneItems: DiscoverItem[] = [...filterVisible(mockTryOnPoses), ...customScenePoses]
      .filter((s) => !presetTitles.has(s.name))
      .map((s) => ({ type: 'scene', data: s }));
    return [...presetItems, ...sceneItems];
  }, [presets, customScenePoses]);

  // Auto-open item from URL param (supports slug, UUID, and scene- prefix)
  useEffect(() => {
    if (!urlItemId || allItems.length === 0) return;
    const found = allItems.find((item) => {
      if (urlItemId.startsWith('scene-')) {
        return item.type === 'scene' && item.data.poseId === urlItemId.replace('scene-', '');
      }
      // Match by slug or by raw UUID
      if (item.type === 'preset') {
        return item.data.slug === urlItemId || item.data.id === urlItemId;
      }
      return false;
    });
    if (found) setSelectedItem(found);
  }, [urlItemId, allItems]);

  const getItemUrl = useCallback((item: DiscoverItem): string => {
    return `/discover/${getItemSlug(item)}`;
  }, []);

  const handleCardClick = useCallback((item: DiscoverItem) => {
    window.history.pushState(null, '', getItemUrl(item));
    setSelectedItem(item);
  }, [getItemUrl]);

  const handleClose = useCallback(() => {
    setSelectedItem(null);
    window.history.replaceState(null, '', '/discover');
  }, []);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (selectedCategory !== 'all') {
        if (!itemMatchesProductCategory(item, selectedCategory)) return false;
      }
      return true;
    });
  }, [allItems, selectedCategory]);

  // Sort: featured items first, then newest first
  const sorted = useMemo(() => {
    const getDate = (item: DiscoverItem): number => {
      const d = item.type === 'preset' ? item.data.created_at : item.data.created_at;
      return d ? new Date(d).getTime() : 0;
    };
    return [...filtered].sort((a, b) => {
      const aKey = `${a.type}:${getItemId(a)}`;
      const bKey = `${b.type}:${getItemId(b)}`;
      const aFeat = featuredMap.get(aKey);
      const bFeat = featuredMap.get(bKey);
      if (aFeat && !bFeat) return -1;
      if (!aFeat && bFeat) return 1;
      if (aFeat && bFeat) return new Date(bFeat.created_at).getTime() - new Date(aFeat.created_at).getTime();
      return getDate(b) - getDate(a);
    });
  }, [filtered, featuredMap]);

  // Progressive rendering: render in batches for mobile perf
  const INITIAL_RENDER_COUNT = 30;
  const LOAD_MORE_COUNT = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_RENDER_COUNT);
  }, [selectedCategory]);

  // IntersectionObserver to load more items
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

  // Build stable columns: assign each item a fixed column so load-more doesn't reshuffle existing items
  const stableColumns = useMemo(() => {
    const cols: DiscoverItem[][] = Array.from({ length: columnCount }, () => []);
    sorted.forEach((item, i) => {
      cols[i % columnCount].push(item);
    });
    return cols;
  }, [sorted, columnCount]);

  // Slice each column to show only up to visibleCount total items
  const visibleColumns = useMemo(() => {
    const itemsPerCol = Math.ceil(visibleCount / columnCount);
    return stableColumns.map((col) => col.slice(0, itemsPerCol));
  }, [stableColumns, visibleCount, columnCount]);

  // Related items for modal
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    
    // Prioritize same scene_name for presets
    if (selectedItem.type === 'preset' && selectedItem.data.scene_name) {
      const sameScene = allItems.filter((i) =>
        i.type === 'preset' &&
        i.data.scene_name === selectedItem.data.scene_name &&
        i.data.id !== selectedItem.data.id
      );
      if (sameScene.length >= 3) return sameScene.slice(0, 9);
    }
    
    const selCat = resolveCategory(getItemCategory(selectedItem));
    return allItems
      .filter((i) => {
        if (i.type === selectedItem.type && getItemId(i) === getItemId(selectedItem)) return false;
        return resolveCategory(getItemCategory(i)) === selCat;
      })
      .slice(0, 9);
  }, [allItems, selectedItem]);

  // Handlers for authenticated users
  const handleUseItem = useCallback((item: DiscoverItem) => {
    if (item.type === 'scene') {
      const sp = new URLSearchParams();
      sp.set('scene', item.data.poseId);
      if (item.data.previewUrl) sp.set('sceneImage', item.data.previewUrl);
      if (item.data.name) sp.set('sceneName', item.data.name);
      sp.set('fromDiscover', '1');
      navigate(`/app/freestyle?${sp.toString()}`);
    } else {
      const d = item.data;
      if (d.workflow_slug) {
        const params = new URLSearchParams();
        if (d.model_name) params.set('model', d.model_name);
        if (d.scene_name) params.set('scene', d.scene_name);
        navigate(`/app/generate/${d.workflow_slug}?${params.toString()}`);
      } else {
        const params = new URLSearchParams({
          prompt: d.prompt,
          ratio: d.aspect_ratio,
          quality: d.quality,
        });
        navigate(`/app/freestyle?${params.toString()}`);
      }
    }
  }, [navigate]);

  const handleSearchSimilar = useCallback((item: DiscoverItem) => {
    setSelectedItem(null);
    // Simple: just filter by same category
    setSelectedCategory(getItemCategory(item));
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
      <SEOHead title="Discover AI Photography Presets & Scenes — VOVV AI" description="All images on this page were generated with VOVV.AI. Explore AI fashion photography styles, scenes and prompts — start generating for free." canonical={`${SITE_URL}/discover`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Discover
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Every image here was created by AI. Yours can be next.
          </p>
        </div>


        {/* Category filter bar */}
        <PublicDiscoverCategoryBar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Masonry grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-shimmer bg-[length:200%_100%]" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">No results found</p>
            <p className="text-xs text-muted-foreground/70 max-w-xs">
              Try different keywords or{' '}
              <button
                onClick={() => { setSelectedCategory('all'); }}
                className="text-primary hover:underline"
              >
                browse all
              </button>
            </p>
          </div>
        ) : (
          <>
                <div className="flex gap-1">
                  {visibleColumns.map((col, colIdx) => (
                    <div key={colIdx} className="flex-1 flex flex-col gap-1">
                      {col.map((item) => {
                        const itemId = getItemId(item);
                        return (
                          <DiscoverCard
                            key={item.type === 'preset' ? `p-${item.data.id}` : `s-${item.data.poseId}`}
                            item={item}
                            onClick={() => handleCardClick(item)}
                            onRecreate={() => navigate('/auth')}
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
        )}

        {/* Detail modal — auth-aware */}
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
          />
        )}
      </div>
    </PageLayout>
  );
}
