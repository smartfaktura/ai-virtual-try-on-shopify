import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { DiscoverCategoryBar } from '@/components/app/DiscoverCategoryBar';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  // Fetch user's product categories for personalized default
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

  const allItems = useMemo<DiscoverItem[]>(
    () => presets.map((p) => ({ type: 'preset' as const, data: p })),
    [presets]
  );

  const filtered = useMemo(() => {
    const items = activeCategory === 'all'
      ? allItems
      : allItems.filter((item) => itemMatchesProductCategory(item, activeCategory));
    return items.slice(0, 16);
  }, [allItems, activeCategory]);

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (allItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Find & Recreate</h2>
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
        categories={CATEGORIES}
        selectedCategory={activeCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {filtered.map((item) => (
          <DiscoverCard
            key={item.type === 'preset' ? item.data.id : item.data.poseId}
            item={item}
            aspectRatioOverride="4/3"
            onClick={() => setSelectedItem(item)}
            onRecreate={(e) => {
              e.stopPropagation();
              handleUseItem(item);
            }}
          />
        ))}
      </div>

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
