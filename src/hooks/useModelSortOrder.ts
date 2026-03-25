import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SortOrderRow {
  model_id: string;
  sort_order: number;
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
        .select('model_id, sort_order')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const sortMap = new Map<string, number>();
      (data as unknown as SortOrderRow[]).forEach(r => {
        sortMap.set(r.model_id, r.sort_order);
      });
      return sortMap;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const sortMap = data ?? new Map<string, number>();

  const sortModels = <T extends { modelId: string }>(models: T[]): T[] => {
    if (sortMap.size === 0) return models;
    return [...models].sort((a, b) => {
      const sa = sortMap.get(a.modelId) ?? 9999;
      const sb = sortMap.get(b.modelId) ?? 9999;
      return sa - sb;
    });
  };

  return { sortMap, sortModels, isLoading };
}

export function useSaveModelSortOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entries: ModelSortEntry[]) => {
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
