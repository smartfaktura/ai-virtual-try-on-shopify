import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TryOnPose } from '@/types';

interface SortOrderRow {
  id: string;
  scene_id: string;
  sort_order: number;
  updated_by: string;
  created_at: string;
}

export function useSceneSortOrder() {
  const { user } = useAuth();

  const { data: sortMap = new Map<string, number>(), isLoading } = useQuery({
    queryKey: ['scene-sort-order'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scene_sort_order' as any)
        .select('scene_id, sort_order')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const map = new Map<string, number>();
      (data as unknown as SortOrderRow[]).forEach(r => map.set(r.scene_id, r.sort_order));
      return map;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const sortScenes = <T extends TryOnPose>(poses: T[]): T[] => {
    if (sortMap.size === 0) return poses;
    return [...poses].sort((a, b) => {
      const sa = sortMap.get(a.poseId) ?? 9999;
      const sb = sortMap.get(b.poseId) ?? 9999;
      return sa - sb;
    });
  };

  return { sortMap, sortScenes, isLoading };
}

export function useSaveSceneSortOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entries: { scene_id: string; sort_order: number }[]) => {
      // Delete existing and reinsert
      const { error: delError } = await supabase
        .from('scene_sort_order' as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
      if (delError) throw delError;

      if (entries.length > 0) {
        const rows = entries.map(e => ({ ...e, updated_by: user!.id }));
        const { error } = await supabase
          .from('scene_sort_order' as any)
          .insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scene-sort-order'] }),
  });
}
