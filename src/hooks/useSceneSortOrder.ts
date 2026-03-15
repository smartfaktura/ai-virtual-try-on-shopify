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
  category_override: string | null;
}

export interface SortEntry {
  scene_id: string;
  sort_order: number;
  category_override?: string | null;
}

export function useSceneSortOrder() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['scene-sort-order'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scene_sort_order' as any)
        .select('scene_id, sort_order, category_override')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const sortMap = new Map<string, number>();
      const categoryMap = new Map<string, string>();
      (data as unknown as SortOrderRow[]).forEach(r => {
        sortMap.set(r.scene_id, r.sort_order);
        if (r.category_override) categoryMap.set(r.scene_id, r.category_override);
      });
      return { sortMap, categoryMap };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const sortMap = data?.sortMap ?? new Map<string, number>();
  const categoryMap = data?.categoryMap ?? new Map<string, string>();

  const sortScenes = <T extends TryOnPose>(poses: T[]): T[] => {
    if (sortMap.size === 0) return poses;
    return [...poses].sort((a, b) => {
      const sa = sortMap.get(a.poseId) ?? 9999;
      const sb = sortMap.get(b.poseId) ?? 9999;
      return sa - sb;
    });
  };

  const applyCategoryOverrides = <T extends TryOnPose>(poses: T[]): T[] => {
    if (categoryMap.size === 0) return poses;
    return poses.map(p => {
      const override = categoryMap.get(p.poseId);
      return override ? { ...p, category: override as T['category'] } : p;
    });
  };

  const deriveCategoryOrder = <T extends TryOnPose>(poses: T[]): string[] => {
    if (sortMap.size === 0) return [];
    const catMin = new Map<string, number>();
    poses.forEach(p => {
      const order = sortMap.get(p.poseId) ?? 9999;
      const cur = catMin.get(p.category);
      if (cur === undefined || order < cur) catMin.set(p.category, order);
    });
    return [...catMin.entries()].sort((a, b) => a[1] - b[1]).map(([cat]) => cat);
  };

  return { sortMap, categoryMap, sortScenes, applyCategoryOverrides, deriveCategoryOrder, isLoading };
}

export function useSaveSceneSortOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entries: SortEntry[]) => {
      // Delete existing and reinsert
      const { error: delError } = await supabase
        .from('scene_sort_order' as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
      if (delError) throw delError;

      if (entries.length > 0) {
        const rows = entries.map(e => ({
          scene_id: e.scene_id,
          sort_order: e.sort_order,
          category_override: e.category_override ?? null,
          updated_by: user!.id,
        }));
        const { error } = await supabase
          .from('scene_sort_order' as any)
          .insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scene-sort-order'] }),
  });
}
