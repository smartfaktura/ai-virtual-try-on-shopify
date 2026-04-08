import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORY_COLLECTIONS, ALL_SCENES as FALLBACK_ALL } from '@/components/app/product-images/sceneData';
import type { ProductImageScene, CategoryCollection } from '@/components/app/product-images/types';

export interface DbScene {
  id: string;
  scene_id: string;
  title: string;
  description: string;
  prompt_template: string;
  trigger_blocks: string[];
  category_collection: string | null;
  scene_type: string;
  preview_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  sub_category: string | null;
  category_sort_order: number;
  requires_extra_reference: boolean;
  sub_category_sort_order: number;
}

function dbToFrontend(d: DbScene): ProductImageScene {
  return {
    id: d.scene_id,
    title: d.title,
    description: d.description,
    promptTemplate: d.prompt_template,
    triggerBlocks: d.trigger_blocks,
    categoryCollection: d.category_collection ?? undefined,
    sceneType: (d.scene_type as ProductImageScene['sceneType']) ?? 'packshot',
    previewUrl: d.preview_image_url ?? undefined,
    subCategory: d.sub_category ?? undefined,
    requiresExtraReference: d.requires_extra_reference ?? false,
  };
}

const QUERY_KEY = ['product-image-scenes'];

export function useProductImageScenes() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: rawScenes, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_image_scenes' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as DbScene[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Derived frontend-shaped data with fallback
  const scenes = rawScenes && rawScenes.length > 0 ? rawScenes : null;

  const activeScenes: DbScene[] = scenes?.filter(s => s.is_active) ?? [];

  const categoryCollections: CategoryCollection[] = scenes
    ? buildCollections(activeScenes)
    : CATEGORY_COLLECTIONS;

  const allScenes: ProductImageScene[] = scenes
    ? activeScenes.map(dbToFrontend)
    : FALLBACK_ALL;

  // Admin CRUD
  const upsertScene = useMutation({
    mutationFn: async (scene: Partial<DbScene> & { scene_id: string }) => {
      const { error } = await supabase
        .from('product_image_scenes' as any)
        .upsert(scene as any, { onConflict: 'scene_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteScene = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_image_scenes' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateScene = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<DbScene> }) => {
      const { error } = await supabase
        .from('product_image_scenes' as any)
        .update(params.updates as any)
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    rawScenes: rawScenes ?? [],
    isLoading,
    categoryCollections,
    allScenes,
    upsertScene,
    deleteScene,
    updateScene,
  };
}

function buildCollections(scenes: DbScene[]): CategoryCollection[] {
  const catMap = new Map<string, DbScene[]>();
  const catSortOrder = new Map<string, number>();

  for (const s of scenes) {
    if (!s.category_collection) continue;
    const cat = s.category_collection;
    if (!catMap.has(cat)) {
      catMap.set(cat, []);
      catSortOrder.set(cat, s.category_sort_order ?? 0);
    }
    if ((s.category_sort_order ?? 0) < (catSortOrder.get(cat) ?? 0)) {
      catSortOrder.set(cat, s.category_sort_order ?? 0);
    }
    catMap.get(cat)!.push(s);
  }

  const TITLE_MAP: Record<string, string> = {
    fragrance: 'Fragrance',
    'beauty-skincare': 'Beauty & Skincare',
    'makeup-lipsticks': 'Makeup & Lipsticks',
    'bags-accessories': 'Bags & Structured Accessories',
    'hats-small': 'Hats & Small Accessories',
    shoes: 'Shoes',
    garments: 'Clothing & Apparel',
    'home-decor': 'Home Decor / Furniture',
    'tech-devices': 'Tech / Devices',
    'food-beverage': 'Food & Beverage',
    'supplements-wellness': 'Supplements & Wellness',
    other: 'Other / Custom',
  };

  return Array.from(catMap.entries())
    .sort((a, b) => (catSortOrder.get(a[0]) ?? 999) - (catSortOrder.get(b[0]) ?? 999))
    .map(([id, dbScenes]) => {
      const frontendScenes = dbScenes.map(dbToFrontend);
      // Build sub-groups
      const subGroupMap = new Map<string, ProductImageScene[]>();
      for (const s of frontendScenes) {
        const key = s.subCategory || '';
        if (!subGroupMap.has(key)) subGroupMap.set(key, []);
        subGroupMap.get(key)!.push(s);
      }
      // Sort sub-groups by sub_category_sort_order (from first scene in group); empty label ("General") goes last
      const subGroups = Array.from(subGroupMap.entries())
        .map(([label, scenes]) => {
          const groupOrder = Math.min(...dbScenes.filter(d => (d.sub_category || '') === label).map(d => d.sub_category_sort_order ?? 0));
          return { label: label || 'General', scenes, _groupOrder: groupOrder, _isGeneral: !label };
        })
        .sort((a, b) => {
          if (a._isGeneral !== b._isGeneral) return a._isGeneral ? 1 : -1;
          return a._groupOrder - b._groupOrder;
        })
        .map(({ label, scenes }) => ({ label, scenes }));

      return {
        id,
        title: TITLE_MAP[id] || id,
        scenes: frontendScenes,
        subGroups,
        categorySortOrder: catSortOrder.get(id) ?? 0,
      };
    });
}
