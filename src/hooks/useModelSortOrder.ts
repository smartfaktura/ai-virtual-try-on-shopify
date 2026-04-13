import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SortOrderRow {
  model_id: string;
  sort_order: number;
  image_override_url: string | null;
}

export interface ModelSortEntry {
  model_id: string;
  sort_order: number;
}

export function useModelSortOrder() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['model-sort-order'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_sort_order' as any)
        .select('model_id, sort_order, image_override_url')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const sortMap = new Map<string, number>();
      const imageOverrides = new Map<string, string>();
      (data as unknown as SortOrderRow[]).forEach(r => {
        sortMap.set(r.model_id, r.sort_order);
        if (r.image_override_url) {
          imageOverrides.set(r.model_id, r.image_override_url);
        }
      });
      return { sortMap, imageOverrides };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const sortMap = data?.sortMap ?? new Map<string, number>();
  const imageOverrides = data?.imageOverrides ?? new Map<string, string>();

  const sortModels = <T extends { modelId: string }>(models: T[]): T[] => {
    if (sortMap.size === 0) return models;
    return [...models].sort((a, b) => {
      const sa = sortMap.get(a.modelId) ?? 9999;
      const sb = sortMap.get(b.modelId) ?? 9999;
      return sa - sb;
    });
  };

  return { sortMap, imageOverrides, sortModels, isLoading };
}

export function useSaveModelSortOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entries: ModelSortEntry[]) => {
      // Fetch existing rows to preserve image_override_url
      const { data: existing } = await supabase
        .from('model_sort_order' as any)
        .select('model_id, image_override_url');
      const overrideMap = new Map<string, string>();
      if (existing) {
        (existing as unknown as SortOrderRow[]).forEach(r => {
          if (r.image_override_url) overrideMap.set(r.model_id, r.image_override_url);
        });
      }

      // Delete existing and reinsert
      const { error: delError } = await supabase
        .from('model_sort_order' as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (delError) throw delError;

      if (entries.length > 0) {
        const rows = entries.map(e => ({
          model_id: e.model_id,
          sort_order: e.sort_order,
          updated_by: user!.id,
          image_override_url: overrideMap.get(e.model_id) || null,
        }));
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
      // Check if row exists
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
