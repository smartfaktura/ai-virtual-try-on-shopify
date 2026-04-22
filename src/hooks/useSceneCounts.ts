import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SceneCounts {
  bySubject: Record<string, number>;
  byShotStyle: Record<string, number>;
  bySetting: Record<string, number>;
  byCollection: Record<string, number>;
  total: number;
}

/**
 * One small-ish query to compute facet counts for the sidebar.
 * Selects only the 4 facet columns from active scenes — typically <50 KB even at 1500 rows.
 */
export function useSceneCounts() {
  return useQuery<SceneCounts>({
    queryKey: ['scene-counts'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_image_scenes')
        .select('subject, shot_style, setting, category_collection, sub_category')
        .eq('is_active', true)
        .not('sub_category', 'ilike', '%essential%')
        .range(0, 4999);
      if (error) throw error;

      const bySubject: Record<string, number> = {};
      const byShotStyle: Record<string, number> = {};
      const bySetting: Record<string, number> = {};
      const byCollection: Record<string, number> = {};

      for (const row of data ?? []) {
        if (row.subject) bySubject[row.subject] = (bySubject[row.subject] ?? 0) + 1;
        if (row.shot_style) byShotStyle[row.shot_style] = (byShotStyle[row.shot_style] ?? 0) + 1;
        if (row.setting) bySetting[row.setting] = (bySetting[row.setting] ?? 0) + 1;
        if (row.category_collection)
          byCollection[row.category_collection] = (byCollection[row.category_collection] ?? 0) + 1;
      }

      return {
        bySubject,
        byShotStyle,
        bySetting,
        byCollection,
        total: data?.length ?? 0,
      };
    },
  });
}
