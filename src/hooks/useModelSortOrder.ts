import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SortOrderRow {
  model_id: string;
  sort_order: number;
  image_override_url: string | null;
  name_override: string | null;
  gender_override: string | null;
  body_type_override: string | null;
  ethnicity_override: string | null;
  age_range_override: string | null;
  is_hidden: boolean;
}

export interface ModelSortEntry {
  model_id: string;
  sort_order: number;
}

export interface ModelMetadataOverrides {
  name_override?: string | null;
  gender_override?: string | null;
  body_type_override?: string | null;
  ethnicity_override?: string | null;
  age_range_override?: string | null;
}

export function useModelSortOrder() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['model-sort-order'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_sort_order' as any)
        .select('model_id, sort_order, image_override_url, name_override, gender_override, body_type_override, ethnicity_override, age_range_override, is_hidden')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const sortMap = new Map<string, number>();
      const imageOverrides = new Map<string, string>();
      const metadataOverrides = new Map<string, ModelMetadataOverrides>();
      const hiddenIds = new Set<string>();
      (data as unknown as SortOrderRow[]).forEach(r => {
        sortMap.set(r.model_id, r.sort_order);
        if (r.image_override_url) {
          imageOverrides.set(r.model_id, r.image_override_url);
        }
        if (r.name_override || r.gender_override || r.body_type_override || r.ethnicity_override || r.age_range_override) {
          metadataOverrides.set(r.model_id, {
            name_override: r.name_override,
            gender_override: r.gender_override,
            body_type_override: r.body_type_override,
            ethnicity_override: r.ethnicity_override,
            age_range_override: r.age_range_override,
          });
        }
        if (r.is_hidden) {
          hiddenIds.add(r.model_id);
        }
      });
      return { sortMap, imageOverrides, metadataOverrides, hiddenIds };
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });

  const sortMap = data?.sortMap ?? new Map<string, number>();
  const imageOverrides = data?.imageOverrides ?? new Map<string, string>();
  const metadataOverrides = data?.metadataOverrides ?? new Map<string, ModelMetadataOverrides>();
  const hiddenIds = data?.hiddenIds ?? new Set<string>();

  const sortModels = <T extends { modelId: string }>(models: T[]): T[] => {
    if (sortMap.size === 0) return models;
    return [...models].sort((a, b) => {
      const sa = sortMap.get(a.modelId) ?? 9999;
      const sb = sortMap.get(b.modelId) ?? 9999;
      return sa - sb;
    });
  };

  /** Apply image overrides to any model list that has previewUrl */
  const applyOverrides = <T extends { modelId: string; previewUrl: string }>(models: T[]): T[] => {
    if (imageOverrides.size === 0) return models;
    return models.map(m => {
      const override = imageOverrides.get(m.modelId);
      return override ? { ...m, previewUrl: override } : m;
    });
  };

  /** Apply name overrides */
  const applyNameOverrides = <T extends { modelId: string; name: string }>(models: T[]): T[] => {
    if (metadataOverrides.size === 0) return models;
    return models.map(m => {
      const overrides = metadataOverrides.get(m.modelId);
      if (!overrides?.name_override) return m;
      return { ...m, name: overrides.name_override };
    });
  };

  /** Filter out hidden models */
  const filterHidden = <T extends { modelId: string }>(models: T[]): T[] => {
    if (hiddenIds.size === 0) return models;
    return models.filter(m => !hiddenIds.has(m.modelId));
  };

  return { sortMap, imageOverrides, metadataOverrides, hiddenIds, sortModels, applyOverrides, applyNameOverrides, filterHidden, isLoading };
}

export function useSaveModelSortOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entries: ModelSortEntry[]) => {
      // Fetch existing rows to preserve overrides
      const { data: existing } = await supabase
        .from('model_sort_order' as any)
        .select('model_id, image_override_url, name_override, gender_override, body_type_override, ethnicity_override, age_range_override, is_hidden');
      const existingMap = new Map<string, any>();
      if (existing) {
        (existing as unknown as SortOrderRow[]).forEach(r => {
          existingMap.set(r.model_id, r);
        });
      }

      // Delete existing and reinsert
      const { error: delError } = await supabase
        .from('model_sort_order' as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (delError) throw delError;

      if (entries.length > 0) {
        const rows = entries.map(e => {
          const prev = existingMap.get(e.model_id);
          return {
            model_id: e.model_id,
            sort_order: e.sort_order,
            updated_by: user!.id,
            image_override_url: prev?.image_override_url || null,
            name_override: prev?.name_override || null,
            gender_override: prev?.gender_override || null,
            body_type_override: prev?.body_type_override || null,
            ethnicity_override: prev?.ethnicity_override || null,
            age_range_override: prev?.age_range_override || null,
            is_hidden: prev?.is_hidden || false,
          };
        });
        const { error } = await supabase
          .from('model_sort_order' as any)
          .insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['model-sort-order'] }),
  });
}

export function useSaveModelImageOverride() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ modelId, imageUrl }: { modelId: string; imageUrl: string }) => {
      const { data: existing } = await supabase
        .from('model_sort_order' as any)
        .select('id')
        .eq('model_id', modelId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('model_sort_order' as any)
          .update({ image_override_url: imageUrl } as any)
          .eq('model_id', modelId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('model_sort_order' as any)
          .insert({
            model_id: modelId,
            sort_order: 9999,
            updated_by: user!.id,
            image_override_url: imageUrl,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['model-sort-order'] }),
  });
}

export function useSaveModelMetadataOverride() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ modelId, overrides }: { modelId: string; overrides: ModelMetadataOverrides }) => {
      const { data: existing } = await supabase
        .from('model_sort_order' as any)
        .select('id')
        .eq('model_id', modelId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('model_sort_order' as any)
          .update(overrides as any)
          .eq('model_id', modelId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('model_sort_order' as any)
          .insert({
            model_id: modelId,
            sort_order: 9999,
            updated_by: user!.id,
            ...overrides,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['model-sort-order'] }),
  });
}

export function useToggleModelHidden() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ modelId, hidden }: { modelId: string; hidden: boolean }) => {
      const { data: existing } = await supabase
        .from('model_sort_order' as any)
        .select('id')
        .eq('model_id', modelId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('model_sort_order' as any)
          .update({ is_hidden: hidden } as any)
          .eq('model_id', modelId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('model_sort_order' as any)
          .insert({
            model_id: modelId,
            sort_order: 9999,
            updated_by: user!.id,
            is_hidden: hidden,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['model-sort-order'] }),
  });
}
