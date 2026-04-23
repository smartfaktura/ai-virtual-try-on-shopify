import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockModels, mockTryOnPoses } from '@/data/mockData';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useCustomScenes } from '@/hooks/useCustomScenes';

export interface PickerSceneOption {
  name: string;
  imageUrl: string;
  category: string;
  subCategory?: string | null;
  /**
   * Stable scene reference for `product_image_scenes` rows.
   * Present ONLY on rows that come from the product-images library.
   * `custom_scenes` / mock poses leave this `null`.
   */
  sceneRef?: string | null;
  /** Which library this option originated from. */
  source: 'product_image_scenes' | 'custom_scenes' | 'mock';
}

export interface PickerModelOption {
  name: string;
  imageUrl: string;
}

export interface PickerWorkflowOption {
  slug: string;
  name: string;
}

/**
 * Shared admin-only picker options for the Discover modals (Add / Edit).
 * Returns scenes split by source so callers can render the right library
 * based on the selected workflow:
 *   - workflow `product-images` → `productImageScenes` (writes `scene_ref`)
 *   - any other workflow / freestyle → `customScenes` (legacy `scene_name`)
 *
 * `scenes` (combined) is kept for back-compat where source doesn't matter.
 */
export function useDiscoverPickerOptions(enabled: boolean) {
  const { asProfiles: customModelProfiles } = useCustomModels({ enabled });
  const { asPoses: customSceneProfiles } = useCustomScenes({ enabled });

  const { data: productImageScenesRows } = useQuery({
    queryKey: ['discover-picker-product-image-scenes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_image_scenes')
        .select('id, scene_id, title, preview_image_url, category_collection, sub_category')
        .eq('is_active', true);
      return data ?? [];
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  const { data: workflowsData } = useQuery({
    queryKey: ['discover-picker-workflows'],
    queryFn: async () => {
      const { data } = await supabase
        .from('workflows')
        .select('slug, name')
        .order('sort_order');
      return data ?? [];
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  // Scenes from `product_image_scenes` — these carry a stable `sceneRef`.
  const productImageScenes = useMemo<PickerSceneOption[]>(() => {
    const items: PickerSceneOption[] = [];
    const seen = new Set<string>();
    (productImageScenesRows ?? []).forEach((ps: any) => {
      const key = `${ps.title}::${ps.category_collection ?? ''}::${ps.sub_category ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({
        name: ps.title,
        imageUrl: ps.preview_image_url || '',
        category: ps.category_collection ?? 'product-images',
        subCategory: ps.sub_category ?? null,
        sceneRef: ps.scene_id,
        source: 'product_image_scenes',
      });
    });
    return items;
  }, [productImageScenesRows]);

  // Scenes from `custom_scenes` + mock poses — used by Freestyle / other workflows.
  const customScenes = useMemo<PickerSceneOption[]>(() => {
    const items: PickerSceneOption[] = [];
    const seen = new Set<string>();
    const push = (item: PickerSceneOption) => {
      const key = `${item.name}::${item.category}::${item.subCategory ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push(item);
    };
    mockTryOnPoses.forEach(s => push({
      name: s.name,
      imageUrl: s.previewUrl,
      category: s.category,
      subCategory: null,
      sceneRef: null,
      source: 'mock',
    }));
    customSceneProfiles?.forEach(cs => push({
      name: cs.name,
      imageUrl: cs.previewUrl,
      category: cs.category,
      subCategory: null,
      sceneRef: null,
      source: 'custom_scenes',
    }));
    return items;
  }, [customSceneProfiles]);

  // Combined list (back-compat). product_image_scenes first.
  const scenes = useMemo<PickerSceneOption[]>(
    () => [...productImageScenes, ...customScenes],
    [productImageScenes, customScenes],
  );

  const models = useMemo<PickerModelOption[]>(() => {
    const items: PickerModelOption[] = mockModels.map(m => ({
      name: m.name,
      imageUrl: m.previewUrl,
    }));
    customModelProfiles?.forEach(cm => {
      if (!items.find(i => i.name === cm.name)) {
        items.push({ name: cm.name, imageUrl: cm.previewUrl });
      }
    });
    return items;
  }, [customModelProfiles]);

  const workflows = useMemo<PickerWorkflowOption[]>(() => {
    return (workflowsData ?? []).map((w: any) => ({ slug: w.slug, name: w.name }));
  }, [workflowsData]);

  // Group scenes by category for grouped display (combined list).
  const scenesByCategory = useMemo(() => {
    const groups: Record<string, PickerSceneOption[]> = {};
    scenes.forEach(s => {
      const key = s.category || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [scenes]);

  /**
   * Pick the right scene library based on a workflow slug.
   * `product-images` → product_image_scenes. Anything else → custom_scenes.
   */
  const scenesForWorkflow = (workflowSlug: string | null | undefined): PickerSceneOption[] => {
    if (workflowSlug === 'product-images') return productImageScenes;
    return customScenes;
  };

  return {
    scenes,
    scenesByCategory,
    productImageScenes,
    customScenes,
    scenesForWorkflow,
    models,
    workflows,
  };
}
