import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { DiscoverCategoryBar } from '@/components/app/DiscoverCategoryBar';
import { DiscoverSubCategoryBar } from '@/components/app/DiscoverSubCategoryBar';
import {
  getDiscoverFamilies,
  getDiscoverSubtypes,
  isMultiSubFamily,
  itemMatchesDiscoverFilter,
  familyIdForSubtype,
} from '@/lib/discoverTaxonomy';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { useRecommendedDiscoverItems } from '@/hooks/useRecommendedDiscoverItems';
import { useFeaturedItems } from '@/hooks/useFeaturedItems';
import { useSavedItems } from '@/hooks/useSavedItems';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  ...getDiscoverFamilies().map((f) => ({ id: f.id, label: f.label })),
] as const;

export function DashboardDiscoverSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const { data: recommended = [], isLoading: isLoadingRec } = useRecommendedDiscoverItems({ mode: 'auth' });
  const { featuredMap } = useFeaturedItems();
  const { isSaved, toggleSave } = useSavedItems();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);
  const { data: profileCats } = useQuery({
    queryKey: ['dashboard-profile-cats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('product_categories, product_subcategories')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const SUBTYPE_TO_DISCOVER: Record<string, string> = {
    'beauty-skincare': 'beauty', 'makeup-lipsticks': 'beauty', 'fragrance': 'fragrances',
    'jewellery-rings': 'jewelry', 'jewellery-necklaces': 'jewelry',
    'jewellery-earrings': 'jewelry', 'jewellery-bracelets': 'jewelry', 'watches': 'jewelry',
    'tech-devices': 'electronics',
    'food': 'food', 'beverages': 'food', 'snacks-food': 'food',
    'home-decor': 'home', 'furniture': 'home',
    'supplements-wellness': 'supplements', 'activewear': 'sports',
    'eyewear': 'accessories', 'bags-accessories': 'accessories', 'backpacks': 'accessories',
    'belts': 'accessories', 'scarves': 'accessories', 'hats-small': 'accessories',
    'wallets-cardholders': 'accessories',
  };

  const defaultCategory = useMemo(() => {
    const subs = (profileCats as any)?.product_subcategories as string[] | null;
    if (subs?.length === 1) {
      const mapped = SUBTYPE_TO_DISCOVER[subs[0]];
      if (mapped && CATEGORIES.find(c => c.id === mapped)) return mapped;
    }
    const cats = profileCats?.product_categories as string[] | null;
    if (cats?.length && cats[0] !== 'any') {
      const fam = cats[0];
      const direct = CATEGORIES.find(c => c.id === fam);
      if (direct) return direct.id;
      // Map new family ids → discover category ids
      const FAM_TO_DISC: Record<string, string> = {
        'bags-accessories': 'accessories', 'beauty-fragrance': 'beauty',
        'food-drink': 'food', 'tech': 'electronics', 'wellness': 'supplements',
        'watches': 'jewelry', 'eyewear': 'accessories', 'footwear': 'fashion',
      };
      const mapped = FAM_TO_DISC[fam];
      if (mapped) return mapped;
    }
    return 'all';
  }, [profileCats]);

  const activeCategory = selectedCategory ?? defaultCategory;


  // Reorder categories: put user's preferred category right after "All"
  const orderedCategories = useMemo(() => {
    if (defaultCategory === 'all') return CATEGORIES;
    const preferred = CATEGORIES.find(c => c.id === defaultCategory);
    if (!preferred) return CATEGORIES;
    const rest = CATEGORIES.filter(c => c.id !== 'all' && c.id !== defaultCategory);
    return [preferred, CATEGORIES[0], ...rest];
  }, [defaultCategory]);

  const allItems = useMemo<DiscoverItem[]>(
    () => [
      ...presets.map((p) => ({ type: 'preset' as const, data: p })),
      ...recommended.map((r) => ({ type: 'scene' as const, data: r })),
    ],
    [presets, recommended]
  );

  // Hide chips that have zero items after merge
  const orderedCategoriesFiltered = useMemo(() => {
    const nonEmpty = new Set<string>(['all']);
    for (const item of allItems) {
      if (activeCategory === 'all' || true) {
        // mark every family that has at least one matching item under '__all__'
        for (const cat of CATEGORIES) {
          if (cat.id === 'all') continue;
          if (itemMatchesDiscoverFilter(item.data, cat.id, '__all__')) {
            nonEmpty.add(cat.id);
          }
        }
      }
    }
    return orderedCategories.filter((c) => nonEmpty.has(c.id));
  }, [allItems]);

  const filtered = useMemo(() => {
    const items = activeCategory === 'all'
      ? allItems
      : allItems.filter((item) => itemMatchesDiscoverFilter(item.data, activeCategory, '__all__'));
    
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

  const visible = filtered.slice(0, 16);

  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    const selectedId = selectedItem.type === 'preset' ? selectedItem.data.id : selectedItem.data.poseId;
    // Try same scene first
    if (selectedItem.type === 'preset' && selectedItem.data.scene_name) {
      const sameScene = allItems.filter(i =>
        i.type === 'preset' &&
        i.data.scene_name === selectedItem.data.scene_name &&
        i.data.id !== selectedId
      );
      if (sameScene.length >= 3) return sameScene.slice(0, 9);
    }
    // Fallback to same category
    return allItems
      .filter(i => {
        const iId = i.type === 'preset' ? i.data.id : i.data.poseId;
        return iId !== selectedId && i.data.category === selectedItem.data.category;
      })
      .slice(0, 9);
  }, [allItems, selectedItem]);

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

  const selectedItemSaved = selectedItem
    ? isSaved(selectedItem.type, selectedItem.type === 'preset' ? selectedItem.data.id : selectedItem.data.poseId)
    : false;

  if (isLoading || isLoadingRec) {
    return (
      <div className="space-y-4 min-h-[820px] sm:min-h-[760px] lg:min-h-[680px]">
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
    <div className="space-y-4 min-h-[820px] sm:min-h-[760px] lg:min-h-[680px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Steal the Look</h2>
          <p className="text-base text-muted-foreground mt-1.5">Click any visual to recreate it with your product</p>
        </div>
      </div>

      <DiscoverCategoryBar
        categories={orderedCategories}
        selectedCategory={activeCategory}
        onSelectCategory={setSelectedCategory}
        
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {visible.map((item, idx) => (
          <DiscoverCard
            key={item.type === 'preset' ? item.data.id : item.data.poseId}
            item={item}
            aspectRatioOverride="3/4"
            eager={idx < 8}
            fetchPriority={idx === 0 ? 'high' : undefined}
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
          if (!selectedItem) return;
          const sceneName = selectedItem.type === 'preset' ? selectedItem.data.scene_name : selectedItem.data.name;
          setSelectedItem(null);
          navigate(`/app/discover${sceneName ? `?similar=${encodeURIComponent(sceneName)}` : ''}`);
        }}
        relatedItems={relatedItems}
        onSelectRelated={(item) => setSelectedItem(item)}
        isSaved={selectedItemSaved}
        onToggleSave={() => {
          if (!selectedItem) return;
          toggleSave.mutate({
            itemType: selectedItem.type,
            itemId: selectedItem.type === 'preset' ? selectedItem.data.id : selectedItem.data.poseId,
          });
        }}
      />
    </div>
  );
}
