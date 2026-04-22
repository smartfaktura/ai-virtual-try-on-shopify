import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CatalogScene } from './useSceneCatalog';

const SLIM_COLUMNS =
  'id, scene_id, title, sub_category, category_collection, scene_type, subject, shot_style, setting, preview_image_url, prompt_template, filter_tags, created_at';

const MAX = 12;

/**
 * Per-onboarding-category recommended rail.
 *
 * Resolution:
 *   1. For each category the user picked → fetch up to 12 from
 *      recommended_scenes WHERE category = <cat>, ordered by sort_order.
 *      Merge in the order categories were selected, dedupe, cap at 12.
 *   2. If still <12 → top up from category IS NULL (Global list).
 *   3. Final fallback if still empty → top-12 by sort_order from product_image_scenes.
 *
 * Cached 10 min per user.
 */
export function useRecommendedScenes(enabled = true) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery<CatalogScene[]>({
    queryKey: ['scene-recommended', userId],
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      // 1. User's onboarding categories
      let userCategories: string[] = [];
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('product_categories')
          .eq('user_id', userId)
          .maybeSingle();
        userCategories = (profile?.product_categories ?? []).filter(
          (c): c is string => !!c && c !== 'any',
        );
      }

      // Helper: fetch recommended scene_ids for a given category (or null=Global)
      const fetchRecForCategory = async (category: string | null) => {
        const q = supabase
          .from('recommended_scenes' as any)
          .select('scene_id, sort_order')
          .order('sort_order', { ascending: true })
          .limit(MAX);
        const { data } = await (category === null ? q.is('category' as any, null) : q.eq('category' as any, category));
        return ((data ?? []) as unknown) as { scene_id: string; sort_order: number }[];
      };

      // 2. Per-category fetches in parallel
      const perCategoryLists = await Promise.all(
        userCategories.map(c => fetchRecForCategory(c)),
      );

      // Merge in selection order, dedupe by scene_id
      const orderedSceneIds: string[] = [];
      const seen = new Set<string>();
      for (const list of perCategoryLists) {
        for (const row of list) {
          if (orderedSceneIds.length >= MAX) break;
          if (seen.has(row.scene_id)) continue;
          seen.add(row.scene_id);
          orderedSceneIds.push(row.scene_id);
        }
        if (orderedSceneIds.length >= MAX) break;
      }

      // 3. Top up from Global (category IS NULL) if still short
      if (orderedSceneIds.length < MAX) {
        const globalList = await fetchRecForCategory(null);
        for (const row of globalList) {
          if (orderedSceneIds.length >= MAX) break;
          if (seen.has(row.scene_id)) continue;
          seen.add(row.scene_id);
          orderedSceneIds.push(row.scene_id);
        }
      }

      // 4. Resolve scene_ids → full scene rows (preserving order)
      let recommendedScenes: CatalogScene[] = [];
      if (orderedSceneIds.length) {
        const { data } = await supabase
          .from('product_image_scenes')
          .select(SLIM_COLUMNS)
          .in('scene_id', orderedSceneIds)
          .eq('is_active', true);
        const rows = (data ?? []) as CatalogScene[];
        recommendedScenes = orderedSceneIds
          .map(id => rows.find(r => r.scene_id === id))
          .filter((r): r is CatalogScene => !!r);
      }

      if (recommendedScenes.length > 0) return recommendedScenes;

      // 5. Final fallback: top-12 by sort_order
      const { data } = await supabase
        .from('product_image_scenes')
        .select(SLIM_COLUMNS)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(MAX);
      return (data ?? []) as CatalogScene[];
    },
  });
}
