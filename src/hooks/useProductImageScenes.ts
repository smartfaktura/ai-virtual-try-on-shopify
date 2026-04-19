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
  suggested_colors: Array<{hex: string; label: string}> | null;
  outfit_hint: string | null;
  use_scene_reference: boolean;
  updated_at: string;
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
    suggestedColors: d.suggested_colors ?? undefined,
    outfitHint: d.outfit_hint ?? undefined,
    useSceneReference: d.use_scene_reference ?? false,
  };
}

// ── Fetch helpers ──

// Full client column list — includes `prompt_template` because the wizard's
// buildDynamicPrompt runs locally on selected scenes.
const CLIENT_COLUMNS = 'id,scene_id,title,description,prompt_template,trigger_blocks,category_collection,scene_type,preview_image_url,is_active,sort_order,created_at,updated_at,sub_category,category_sort_order,requires_extra_reference,sub_category_sort_order,suggested_colors,outfit_hint,use_scene_reference';

// Ultra-slim columns for the deferred "rest" fetch — only what the picker UI
// needs (title / preview / category / ordering). Heavy `prompt_template`,
// `description`, and timestamps are fetched on-demand if a user picks one of
// these scenes (see fetchSceneById).
const SLIM_REST_COLUMNS = 'id,scene_id,title,trigger_blocks,category_collection,scene_type,preview_image_url,is_active,sort_order,sub_category,category_sort_order,requires_extra_reference,sub_category_sort_order,suggested_colors,outfit_hint,use_scene_reference';

function selectCols(includePromptTemplate: boolean): string {
  return includePromptTemplate ? '*' : CLIENT_COLUMNS;
}

// On-demand single-row fetch — used when the user picks a scene that came from
// the slim "rest" payload and we need its full prompt_template + description.
async function fetchSceneById(id: string): Promise<DbScene | null> {
  const { data, error } = await supabase
    .from('product_image_scenes' as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as DbScene) ?? null;
}

async function fetchAllScenes(includePromptTemplate = false, activeOnly = true): Promise<DbScene[]> {
  const PAGE = 1000;
  let all: DbScene[] = [];
  let from = 0;
  while (true) {
    let q = supabase
      .from('product_image_scenes' as any)
      .select(selectCols(includePromptTemplate))
      .order('sort_order', { ascending: true })
      .range(from, from + PAGE - 1);
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw error;
    const batch = (data || []) as unknown as DbScene[];
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function fetchScenesByCategories(categories: string[], includePromptTemplate = false, activeOnly = true): Promise<DbScene[]> {
  let q = supabase
    .from('product_image_scenes' as any)
    .select(selectCols(includePromptTemplate))
    .in('category_collection', categories)
    .order('sort_order', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as DbScene[];
}

async function fetchScenesExcludingCategories(
  categories: string[],
  includePromptTemplate = false,
  activeOnly = true,
  slim = false,
): Promise<DbScene[]> {
  const PAGE = 1000;
  let all: DbScene[] = [];
  let from = 0;
  // When slim=true we ignore includePromptTemplate and use the ultra-slim
  // column list — caller is signalling "I only need picker metadata".
  const cols = slim ? SLIM_REST_COLUMNS : selectCols(includePromptTemplate);
  while (true) {
    let q = supabase
      .from('product_image_scenes' as any)
      .select(cols)
      .not('category_collection', 'in', `(${categories.join(',')})`)
      .order('sort_order', { ascending: true })
      .range(from, from + PAGE - 1);
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw error;
    const batch = (data || []) as unknown as DbScene[];
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// ── Collection builder ──

const COLLECTION_MERGE: Record<string, string> = {
  "snacks-food": "food",
  "food-beverage": "food",
  "wallets": "wallets-cardholders",
};

const TITLE_MAP_HOOK: Record<string, string> = {
  furniture: 'Furniture',
  'home-decor': 'Home Decor',
};

function buildCollections(scenes: DbScene[]): CategoryCollection[] {
  const catMap = new Map<string, DbScene[]>();
  const catSortOrder = new Map<string, number>();

  for (const s of scenes) {
    if (!s.category_collection) continue;
    const cat = COLLECTION_MERGE[s.category_collection] ?? s.category_collection;
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
    backpacks: 'Backpacks',
    'wallets-cardholders': 'Wallets & Cardholders',
    belts: 'Belts',
    scarves: 'Scarves',
    'hats-small': 'Hats & Headwear',
    shoes: 'Shoes',
    sneakers: 'Sneakers',
    boots: 'Boots',
    'high-heels': 'High Heels',
    garments: 'Clothing & Apparel',
    dresses: 'Dresses',
    hoodies: 'Hoodies',
    streetwear: 'Streetwear',
    jeans: 'Jeans',
    jackets: 'Jackets',
    activewear: 'Activewear & Sportswear',
    swimwear: 'Swimwear',
    lingerie: 'Lingerie',
    kidswear: 'Kidswear',
    'jewellery-necklaces': 'Necklaces',
    'jewellery-earrings': 'Earrings',
    'jewellery-bracelets': 'Bracelets',
    'jewellery-rings': 'Rings',
    watches: 'Watches',
    eyewear: 'Eyewear',
    'home-decor': 'Home Decor',
    furniture: 'Furniture',
    'tech-devices': 'Tech / Devices',
    food: 'Food & Snacks',
    beverages: 'Beverages',
    'supplements-wellness': 'Supplements & Wellness',
    other: 'Other / Custom',
  };

  return Array.from(catMap.entries())
    .sort((a, b) => (catSortOrder.get(a[0]) ?? 999) - (catSortOrder.get(b[0]) ?? 999))
    .map(([id, dbScenes]) => {
      const frontendScenes = dbScenes.map(dbToFrontend);
      const subGroupMap = new Map<string, ProductImageScene[]>();
      for (const s of frontendScenes) {
        const key = s.subCategory || '';
        if (!subGroupMap.has(key)) subGroupMap.set(key, []);
        subGroupMap.get(key)!.push(s);
      }
      const subGroups = Array.from(subGroupMap.entries())
        .map(([label, scenes]) => {
          const groupOrder = Math.min(...dbScenes.filter(d => (d.sub_category || '') === label).map(d => d.sub_category_sort_order ?? 0));
          return { label: label || 'General', scenes, _groupOrder: groupOrder, _isGeneral: !label };
        })
        .sort((a, b) => a._groupOrder - b._groupOrder)
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

// ── Query keys ──

const QUERY_KEY_ALL = ['product-image-scenes'];
const QUERY_KEY_PRIORITY = ['product-image-scenes-priority'];
const QUERY_KEY_REST = ['product-image-scenes-rest'];

// ── Hook options ──

interface UseProductImageScenesOptions {
  /** When provided, fetches these categories first (instant) and the rest in background */
  priorityCategories?: string[];
  /** Admin-only: include heavy prompt_template column. Default true for client (needed by prompt builder). */
  includePromptTemplate?: boolean;
  /** Admin-only: include inactive (hidden) scenes too. Default false. */
  includeInactive?: boolean;
}

export function useProductImageScenes(options?: UseProductImageScenesOptions) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const priorityCats = options?.priorityCategories;
  const hasPriority = priorityCats && priorityCats.length > 0;
  // Client wizard NEEDS prompt_template (buildDynamicPrompt builds prompts locally).
  const includePromptTemplate = options?.includePromptTemplate ?? true;
  const activeOnly = !(options?.includeInactive ?? false);
  const cacheVariant = `${includePromptTemplate ? 'pt' : 'slim'}-${activeOnly ? 'active' : 'all'}`;

  // ── Mode A: Two-tier fetch (when priority categories provided) ──

  const { data: priorityScenes, isLoading: isLoadingPriority } = useQuery({
    queryKey: [...QUERY_KEY_PRIORITY, cacheVariant, priorityCats],
    queryFn: () => fetchScenesByCategories(priorityCats!, includePromptTemplate, activeOnly),
    enabled: !!hasPriority,
    staleTime: 5 * 60 * 1000,
  });

  const { data: restScenes, isLoading: isLoadingRest } = useQuery({
    queryKey: [...QUERY_KEY_REST, cacheVariant, priorityCats],
    queryFn: () => fetchScenesExcludingCategories(priorityCats!, includePromptTemplate, activeOnly),
    enabled: !!hasPriority && !!priorityScenes,
    staleTime: 5 * 60 * 1000,
  });

  // ── Mode B: Full fetch (no priority — admin, review, results) ──

  const { data: allRawScenes, isLoading: isLoadingAll } = useQuery({
    queryKey: [...QUERY_KEY_ALL, cacheVariant],
    queryFn: () => fetchAllScenes(includePromptTemplate, activeOnly),
    enabled: !hasPriority,
    staleTime: 5 * 60 * 1000,
  });

  // ── Merge results ──

  const rawScenes: DbScene[] = hasPriority
    ? [...(priorityScenes ?? []), ...(restScenes ?? [])]
    : (allRawScenes ?? []);

  const isLoading = hasPriority ? isLoadingPriority : isLoadingAll;
  const scenes = rawScenes.length > 0 ? rawScenes : null;
  const activeScenes: DbScene[] = scenes?.filter(s => s.is_active) ?? [];

  // When priority loading is active, return empty arrays instead of hardcoded fallback
  // to prevent flash of stale data before real data arrives
  const useFallback = !hasPriority && !scenes;

  const categoryCollections: CategoryCollection[] = scenes
    ? buildCollections(activeScenes)
    : useFallback ? CATEGORY_COLLECTIONS : [];

  const allScenes: ProductImageScene[] = scenes
    ? activeScenes.map(dbToFrontend)
    : useFallback ? FALLBACK_ALL : [];

  // ── Admin CRUD ──

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEY_ALL });
    qc.invalidateQueries({ queryKey: QUERY_KEY_PRIORITY });
    qc.invalidateQueries({ queryKey: QUERY_KEY_REST });
  };

  const upsertScene = useMutation({
    mutationFn: async (scene: Partial<DbScene> & { scene_id: string }) => {
      const { error } = await supabase
        .from('product_image_scenes' as any)
        .upsert(scene as any, { onConflict: 'scene_id' });
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const deleteScene = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_image_scenes' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const updateScene = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<DbScene> }) => {
      const { error } = await supabase
        .from('product_image_scenes' as any)
        .update(params.updates as any)
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  return {
    rawScenes,
    isLoading,
    isLoadingRest: hasPriority ? (isLoadingRest && !!priorityScenes) : false,
    categoryCollections,
    allScenes,
    upsertScene,
    deleteScene,
    updateScene,
  };
}
