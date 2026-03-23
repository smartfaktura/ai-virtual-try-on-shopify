import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { DiscoverCategoryBar } from '@/components/app/DiscoverCategoryBar';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { Skeleton } from '@/components/ui/skeleton';
import { getOptimizedUrl } from '@/lib/imageOptimization';

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
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  const allItems = useMemo<DiscoverItem[]>(
    () => presets.map((p) => ({ type: 'preset' as const, data: p })),
    [presets]
  );

  const filtered = useMemo(() => {
    const items = selectedCategory === 'all'
      ? allItems
      : allItems.filter((item) => itemMatchesProductCategory(item, selectedCategory));
    return items.slice(0, 10);
  }, [allItems, selectedCategory]);

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
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
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
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Discover</h2>
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
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {filtered.map((item) => (
          <DiscoverCard
            key={item.type === 'preset' ? item.data.id : item.data.poseId}
            item={item}
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
