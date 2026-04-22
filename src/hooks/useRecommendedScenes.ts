import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveUserCollections } from '@/lib/sceneTaxonomy';
import type { CatalogScene } from './useSceneCatalog';

const SLIM_COLUMNS =
  'id, scene_id, title, sub_category, category_collection, scene_type, subject, shot_style, setting, preview_image_url, prompt_template, filter_tags, created_at';

const MAX = 12;

/**
 * Hybrid recommended rail:
 *   1. Admin-featured scenes that match user's onboarding categories
 *   2. Remaining admin-featured scenes
 *   3. Fill from user-category scenes
 *   4. Fallback: top-12 by sort_order
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
      // 1. Admin-curated featured scene IDs
      const { data: featured } = await supabase
        .from('recommended_scenes')
        .select('scene_id, sort_order')
        .order('sort_order', { ascending: true });
      const featuredIds = (featured ?? []).map(f => f.scene_id);

      // 2. User onboarding categories → collections
      let userCollections: string[] = [];
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('product_categories')
          .eq('user_id', userId)
          .maybeSingle();
        userCollections = resolveUserCollections(profile?.product_categories ?? []);
      }

      // 3. Fetch featured scenes in one query
      let featuredScenes: CatalogScene[] = [];
      if (featuredIds.length) {
        const { data } = await supabase
          .from('product_image_scenes')
          .select(SLIM_COLUMNS)
          .in('scene_id', featuredIds)
          .eq('is_active', true);
        featuredScenes = (data ?? []) as CatalogScene[];
        // Preserve admin sort order
        featuredScenes.sort((a, b) => featuredIds.indexOf(a.scene_id) - featuredIds.indexOf(b.scene_id));
      }

      // 4. Personalised scenes
      let personalised: CatalogScene[] = [];
      if (userCollections.length) {
        const { data } = await supabase
          .from('product_image_scenes')
          .select(SLIM_COLUMNS)
          .in('category_collection', userCollections)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(MAX * 2);
        personalised = (data ?? []) as CatalogScene[];
      }

      // 5. Merge in priority order, dedupe by id
      const seen = new Set<string>();
      const out: CatalogScene[] = [];

      const pushIfNew = (s: CatalogScene) => {
        if (out.length >= MAX) return;
        if (seen.has(s.id)) return;
        seen.add(s.id);
        out.push(s);
      };

      // a) admin-featured matching user's collection
      if (userCollections.length) {
        for (const s of featuredScenes) {
          if (s.category_collection && userCollections.includes(s.category_collection)) pushIfNew(s);
        }
      }
      // b) all remaining admin-featured
      for (const s of featuredScenes) pushIfNew(s);
      // c) personalised
      for (const s of personalised) pushIfNew(s);

      // d) fallback if still empty: top-N by sort_order
      if (out.length === 0) {
        const { data } = await supabase
          .from('product_image_scenes')
          .select(SLIM_COLUMNS)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(MAX);
        return (data ?? []) as CatalogScene[];
      }

      return out;
    },
  });
}
