import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { DiscoverCategoryBar } from '@/components/app/DiscoverCategoryBar';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { useFeaturedItems } from '@/hooks/useFeaturedItems';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

export function DashboardDiscoverSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const { featuredMap } = useFeaturedItems();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(16);

  const { data: profileCats } = useQuery({
    queryKey: ['dashboard-profile-cats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('product_categories')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const defaultCategory = useMemo(() => {
    const cats = profileCats?.product_categories as string[] | null;
    if (cats?.length && cats[0] !== 'any') {
      const match = CATEGORIES.find(c => c.id === cats[0]);
      if (match) return match.id;
    }
    return 'all';
  }, [profileCats]);

  const activeCategory = selectedCategory ?? defaultCategory;

  // Reset visible count when category changes
  useEffect(() => setVisibleCount(16), [activeCategory]);

  // Reorder categories: put user's preferred category right after "All"
  const orderedCategories = useMemo(() => {
    if (defaultCategory === 'all') return CATEGORIES;
    const preferred = CATEGORIES.find(c => c.id === defaultCategory);
    if (!preferred) return CATEGORIES;
    const rest = CATEGORIES.filter(c => c.id !== 'all' && c.id !== defaultCategory);
    return [CATEGORIES[0], preferred, ...rest];
  }, [defaultCategory]);

  const allItems = useMemo<DiscoverItem[]>(
    () => presets.map((p) => ({ type: 'preset' as const, data: p })),
    [presets]
  );

  const filtered = useMemo(() => {
    const items = activeCategory === 'all'
      ? allItems
      : allItems.filter((item) => itemMatchesProductCategory(item, activeCategory));
    
    // Sort: featured first, then by created_at desc — matching Discover page
    return [...items].sort((a, b) => {
      const aKey = `${a.type}:${a.type === 'preset' ? a.data.id : a.data.poseId}`;
      const bKey = `${b.type}:${b.type === 'preset' ? b.data.id : b.data.poseId}`;
      const aFeat = featuredMap.get(aKey);
      const bFeat = featuredMap.get(bKey);
      if (aFeat && !bFeat) return -1;
      if (!aFeat && bFeat) return 1;
      if (aFeat && bFeat) return new Date(bFeat.created_at).getTime() - new Date(aFeat.created_at).getTime();
      const aDate = a.data.created_at ? new Date(a.data.created_at).getTime() : 0;
      const bDate = b.data.created_at ? new Date(b.data.created_at).getTime() : 0;
      return bDate - aDate;
    });
  }, [allItems, activeCategory, featuredMap]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleUseItem = (item: DiscoverItem) => {
    if (item.type === 'scene') {
      navigate(`/app/freestyle?scene=${item.data.poseId}`);
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
        if (d.model_name) params.set('model', d.model_name);
        if (d.scene_name) params.set('scene', d.scene_name);
        if (d.model_image_url) params.set('modelImage', d.model_image_url);
        if (d.scene_image_url) params.set('sceneImage', d.scene_image_url);
        params.set('fromDiscover', '1');
        navigate(`/app/freestyle?${params.toString()}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (allItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Recreate What Works</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Click any visual to recreate it with your product.</p>
        </div>
        <Button
          variant="link"
          size="sm"
          className="text-sm font-medium gap-1"
          onClick={() => navigate('/app/discover')}
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <DiscoverCategoryBar
        categories={orderedCategories}
        selectedCategory={activeCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {visible.map((item) => (
          <DiscoverCard
            key={item.type === 'preset' ? item.data.id : item.data.poseId}
            item={item}
            aspectRatioOverride="3/4"
            onClick={() => setSelectedItem(item)}
            onRecreate={(e) => {
              e.stopPropagation();
              handleUseItem(item);
            }}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6" onClick={() => setVisibleCount(c => c + 16)}>
            Load more
          </Button>
        </div>
      )}

      <DiscoverDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onUseItem={handleUseItem}
        onSearchSimilar={() => {
          setSelectedItem(null);
          navigate('/app/discover');
        }}
        relatedItems={[]}
        onSelectRelated={(item) => setSelectedItem(item)}
      />
    </div>
  );
}
