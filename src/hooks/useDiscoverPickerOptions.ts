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
 * Merges built-in mocks + custom rows + product_image_scenes (~200 rows).
 * Only fetches when `enabled` is true.
 */
export function useDiscoverPickerOptions(enabled: boolean) {
  const { asProfiles: customModelProfiles } = useCustomModels({ enabled });
  const { asPoses: customSceneProfiles } = useCustomScenes();

  const { data: productImageScenes } = useQuery({
    queryKey: ['discover-picker-product-image-scenes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_image_scenes')
        .select('id, scene_id, title, preview_image_url, category_collection')
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

  const scenes = useMemo<PickerSceneOption[]>(() => {
    const items: PickerSceneOption[] = mockTryOnPoses.map(s => ({
      name: s.name,
      imageUrl: s.previewUrl,
      category: s.category,
    }));
    customSceneProfiles?.forEach(cs => {
      if (!items.find(i => i.name === cs.name)) {
        items.push({ name: cs.name, imageUrl: cs.previewUrl, category: cs.category });
      }
    });
    productImageScenes?.forEach((ps: any) => {
      if (!items.find(i => i.name === ps.title)) {
        items.push({
          name: ps.title,
          imageUrl: ps.preview_image_url || '',
          category: ps.category_collection ?? 'product-images',
        });
      }
    });
    return items;
  }, [customSceneProfiles, productImageScenes]);

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

  // Group scenes by category for grouped display
  const scenesByCategory = useMemo(() => {
    const groups: Record<string, PickerSceneOption[]> = {};
    scenes.forEach(s => {
      const key = s.category || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [scenes]);

  return { scenes, scenesByCategory, models, workflows };
}
