import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
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
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'beauty', label: 'Beauty & Skincare' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home & Decor' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'supplements', label: 'Health & Supplements' },
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

function getItemId(item: DiscoverItem): string {
  return item.type === 'preset' ? item.data.id : item.data.poseId;
}

function getItemCategory(item: DiscoverItem): string {
  return item.data.category;
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
  const { featuredMap, isFeatured } = useFeaturedItems();
  const toggleFeatured = useToggleFeatured();
  const { isSaved, toggleSave } = useSavedItems();
  const { isAdmin } = useIsAdmin();
  const columnCount = useColumnCount();
  const { filterVisible } = useHiddenScenes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  // Fetch custom scenes publicly (no auth required with new RLS)
  const { data: customScenes = [] } = useQuery({
    queryKey: ['public-custom-scenes'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_scenes' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as PublicCustomScene[]) ?? [];
    },
  });

  const customScenePoses = useMemo(() => customScenes.map(toTryOnPose), [customScenes]);

  // Track views when modal opens (for logged-in users)
  useEffect(() => {
    if (selectedItem && user) {
      supabase.from('discover_item_views').insert({
        item_type: selectedItem.type,
        item_id: getItemId(selectedItem),
      }).then();
    }
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

  // Build unified feed
  const allItems = useMemo<DiscoverItem[]>(() => {
    const presetItems: DiscoverItem[] = presets.map((p) => ({ type: 'preset', data: p }));
    const sceneItems: DiscoverItem[] = [...filterVisible(mockTryOnPoses), ...customScenePoses].map((s) => ({ type: 'scene', data: s }));
    return [...presetItems, ...sceneItems];
  }, [presets, customScenePoses]);

  // Auto-open item from URL param
  useEffect(() => {
    if (!urlItemId || allItems.length === 0) return;
    const found = allItems.find((item) => {
      if (urlItemId.startsWith('scene-')) {
        return item.type === 'scene' && item.data.poseId === urlItemId.replace('scene-', '');
      }
      return item.type === 'preset' && item.data.id === urlItemId;
    });
    if (found) setSelectedItem(found);
  }, [urlItemId, allItems]);

  const getItemUrl = useCallback((item: DiscoverItem): string => {
    const id = item.type === 'scene' ? `scene-${item.data.poseId}` : item.data.id;
    return `/discover/${id}`;
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
      // Category filter
      if (selectedCategory !== 'all') {
        if (!itemMatchesProductCategory(item, selectedCategory)) return false;
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (item.type === 'preset') {
          return (
            item.data.title.toLowerCase().includes(q) ||
            item.data.prompt.toLowerCase().includes(q) ||
            item.data.tags?.some((t: string) => t.toLowerCase().includes(q))
          );
        } else {
          return (
            item.data.name.toLowerCase().includes(q) ||
            item.data.description.toLowerCase().includes(q) ||
            item.data.category.toLowerCase().includes(q)
          );
        }
      }
      return true;
    });
  }, [allItems, selectedCategory, searchQuery]);

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
  }, [selectedCategory, searchQuery]);

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

  const visibleItems = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);

  // Related items for modal
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
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
      navigate(`/app/freestyle?scene=${item.data.poseId}`);
    } else {
      const params = new URLSearchParams({
        prompt: item.data.prompt,
        ratio: item.data.aspect_ratio,
        quality: item.data.quality,
      });
      navigate(`/app/freestyle?${params.toString()}`);
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
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            All images on this page were generated with VOVV.AI — explore styles, scenes and prompts
          </p>
          <a
            href={user ? '/app/freestyle' : '/auth'}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Start generating for free →
          </a>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
          <Input
            placeholder="Search prompts, scenes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-border/50 bg-muted/30 text-sm placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Category filter bar */}
        <div className="flex justify-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                selectedCategory === cat.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

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
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-primary hover:underline"
              >
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
                            key={item.type === 'preset' ? `p-${item.data.id}` : `s-${item.data.poseId}`}
                            item={item}
                            onClick={() => handleCardClick(item)}
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
