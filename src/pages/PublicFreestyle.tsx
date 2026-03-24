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
import { PublicDiscoverCategoryBar } from '@/components/app/DiscoverCategoryBar';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports' },
  { id: 'supplements', label: 'Health' },
] as const;

const PRODUCT_CATEGORY_MAP: Record<string, string[]> = {
  editorial: ['fashion', 'fragrances', 'jewelry'],
  commercial: ['fashion', 'jewelry', 'accessories', 'electronics', 'beauty'],
  lifestyle: ['home', 'food', 'accessories', 'fashion'],
  fashion: ['fashion', 'accessories'],
  campaign: ['fashion', 'sports', 'beauty', 'electronics'],
  cinematic: ['fashion', 'fragrances', 'jewelry'],
  photography: ['fashion', 'jewelry', 'accessories', 'electronics', 'beauty'],
  styling: ['fashion', 'accessories', 'jewelry'],
  ads: ['fashion', 'sports', 'beauty', 'electronics'],
  studio: ['fashion', 'jewelry', 'accessories', 'electronics', 'beauty'],
  streetwear: ['fashion', 'accessories'],
  fitness: ['sports', 'supplements'],
  athletic: ['sports', 'supplements'],
  gym: ['sports', 'supplements'],
  beauty: ['beauty', 'fragrances'],
  desert: ['fashion', 'fragrances'],
  outdoor: ['sports', 'home', 'fashion'],
  beach: ['fashion', 'accessories'],
  garden: ['home', 'beauty', 'fragrances'],
  industrial: ['electronics', 'fashion'],
  urban: ['fashion', 'accessories'],
  rooftop: ['fashion', 'food'],
  cafe: ['food', 'home'],
  mirror: ['beauty', 'fashion'],
  casual: ['fashion', 'accessories'],
  cozy: ['home', 'fashion'],
  professional: ['electronics', 'accessories'],
};

function itemMatchesProductCategory(item: DiscoverItem, productCat: string): boolean {
  const itemCat = item.data.category;
  if (itemCat === productCat) return true;
  const mapped = PRODUCT_CATEGORY_MAP[itemCat] ?? [];
  if (mapped.includes(productCat)) return true;
  if (item.type === 'preset' && item.data.tags) {
    return item.data.tags.some((t: string) => {
      const tagMapped = PRODUCT_CATEGORY_MAP[t.toLowerCase()] ?? [];
      return tagMapped.includes(productCat);
    });
  }
  return false;
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
  const { data: allPresets = [], isLoading } = useDiscoverPresets();
  const { featuredMap, isFeatured } = useFeaturedItems();
  const toggleFeatured = useToggleFeatured();
  const { isSaved, toggleSave } = useSavedItems();
  const { isAdmin } = useIsAdmin();
  const columnCount = useColumnCount();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  // Filter to freestyle-only presets (no workflow_slug)
  const freestylePresets = useMemo(
    () => allPresets.filter((p) => !p.workflow_slug),
    [allPresets]
  );

  // Track views
  const viewedItemsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedItem || !user || selectedItem.type !== 'preset') return;
    const key = `preset:${selectedItem.data.id}`;
    if (viewedItemsRef.current.has(key)) return;
    viewedItemsRef.current.add(key);
    supabase.from('discover_item_views').insert({
      item_type: 'preset',
      item_id: selectedItem.data.id,
    }).then();
  }, [selectedItem, user]);

  const { data: viewCount } = useQuery({
    queryKey: ['discover-view-count', 'preset', selectedItem?.type === 'preset' ? selectedItem.data.id : null],
    queryFn: async () => {
      if (!selectedItem || selectedItem.type !== 'preset') return 0;
      const { count } = await supabase
        .from('discover_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', 'preset')
        .eq('item_id', selectedItem.data.id);
      return count ?? 0;
    },
    enabled: !!selectedItem && selectedItem.type === 'preset' && !!user,
  });

  // Build items list (presets only, no scenes)
  const allItems = useMemo<DiscoverItem[]>(
    () => freestylePresets.map((p) => ({ type: 'preset' as const, data: p })),
    [freestylePresets]
  );

  // Auto-open from URL
  useEffect(() => {
    if (!urlItemId || allItems.length === 0) return;
    const found = allItems.find((item) => item.data.id === urlItemId);
    if (found) setSelectedItem(found);
  }, [urlItemId, allItems]);

  const getItemUrl = useCallback((item: DiscoverItem): string => {
    return `/freestyle/${item.data.id}`;
  }, []);

  const handleCardClick = useCallback((item: DiscoverItem) => {
    window.history.pushState(null, '', getItemUrl(item));
    setSelectedItem(item);
  }, [getItemUrl]);

  const handleClose = useCallback(() => {
    setSelectedItem(null);
    window.history.replaceState(null, '', '/freestyle');
  }, []);

  // Filter by category
  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return allItems;
    return allItems.filter((item) => itemMatchesProductCategory(item, selectedCategory));
  }, [allItems, selectedCategory]);

  // Sort: featured first, then newest
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aKey = `preset:${a.data.id}`;
      const bKey = `preset:${b.data.id}`;
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
        i.data.id !== selectedItem.data.id
      );
      if (sameScene.length >= 3) return sameScene.slice(0, 9);
    }
    const selCat = selectedItem.data.category;
    return allItems
      .filter((i) => i.data.id !== selectedItem.data.id && i.data.category === selCat)
      .slice(0, 9);
  }, [allItems, selectedItem]);

  // Use item handler
  const handleUseItem = useCallback((item: DiscoverItem) => {
    if (item.type !== 'preset') return;
    const d = item.data;
    const params = new URLSearchParams({
      prompt: d.prompt,
      ratio: d.aspect_ratio,
      quality: d.quality,
    });
    if (user) {
      navigate(`/app/freestyle?${params.toString()}`);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(`/app/freestyle?${params.toString()}`)}`);
    }
  }, [navigate, user]);

  const handleSearchSimilar = useCallback((item: DiscoverItem) => {
    setSelectedItem(null);
    setSelectedCategory(item.data.category);
  }, []);

  const handleToggleSave = useCallback(() => {
    if (!selectedItem) return;
    toggleSave.mutate({ itemType: selectedItem.type, itemId: selectedItem.data.id });
  }, [selectedItem, toggleSave]);

  const handleToggleFeatured = useCallback(() => {
    if (!selectedItem) return;
    const itemId = selectedItem.data.id;
    toggleFeatured.mutate({ itemType: selectedItem.type, itemId, currentlyFeatured: isFeatured(selectedItem.type, itemId) });
  }, [selectedItem, toggleFeatured, isFeatured]);

  return (
    <PageLayout>
      <SEOHead
        title="AI Freestyle Photography Gallery — VOVV AI"
        description="Explore AI-generated freestyle product photography. Every image was created with VOVV.AI — recreate any look with your own product in seconds."
        canonical={`${SITE_URL}/freestyle`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Freestyle Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            AI-generated product photography. Click any image to recreate it with your product.
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
                        const itemId = item.data.id;
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
            isSaved={selectedItem ? isSaved(selectedItem.type, selectedItem.data.id) : false}
            onToggleSave={handleToggleSave}
            viewCount={viewCount ?? undefined}
            isAdmin={isAdmin}
            isFeatured={selectedItem ? isFeatured(selectedItem.type, selectedItem.data.id) : false}
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
