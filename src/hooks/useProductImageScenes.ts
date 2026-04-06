import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GLOBAL_SCENES, CATEGORY_COLLECTIONS, ALL_SCENES as FALLBACK_ALL } from '@/components/app/product-images/sceneData';
import type { ProductImageScene, CategoryCollection } from '@/components/app/product-images/types';

export interface DbScene {
  id: string;
  scene_id: string;
  title: string;
  description: string;
  prompt_template: string;
  trigger_blocks: string[];
  is_global: boolean;
  category_collection: string | null;
  scene_type: string;
  exclude_categories: string[];
  preview_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  sub_category: string | null;
  category_sort_order: number;
}

function dbToFrontend(d: DbScene): ProductImageScene {
  return {
    id: d.scene_id,
    title: d.title,
    description: d.description,
    promptTemplate: d.prompt_template,
    triggerBlocks: d.trigger_blocks,
    isGlobal: d.is_global,
    categoryCollection: d.category_collection ?? undefined,
    sceneType: (d.scene_type as ProductImageScene['sceneType']) ?? 'packshot',
    excludeCategories: d.exclude_categories,
    previewUrl: d.preview_image_url ?? undefined,
    subCategory: d.sub_category ?? undefined,
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

  const globalScenes: ProductImageScene[] = scenes
    ? activeScenes.filter(s => s.is_global).map(dbToFrontend)
    : GLOBAL_SCENES;

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
    globalScenes,
    categoryCollections,
    allScenes,
    upsertScene,
    deleteScene,
    updateScene,
  };
}

function buildCollections(scenes: DbScene[]): CategoryCollection[] {
  const catMap = new Map<string, ProductImageScene[]>();
  const catOrder = new Map<string, number>();

  for (const s of scenes) {
    if (s.is_global || !s.category_collection) continue;
    const cat = s.category_collection;
    if (!catMap.has(cat)) {
      catMap.set(cat, []);
      catOrder.set(cat, s.sort_order);
    }
    catMap.get(cat)!.push(dbToFrontend(s));
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
    .sort((a, b) => (catOrder.get(a[0]) ?? 999) - (catOrder.get(b[0]) ?? 999))
    .map(([id, scenes]) => ({
      id,
      title: TITLE_MAP[id] || id,
      scenes,
    }));
}
