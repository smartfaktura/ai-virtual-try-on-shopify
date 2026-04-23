import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  CATEGORY_FAMILY_MAP,
  FAMILY_ORDER,
  interleaveByFamily,
  resolveUserCollections,
} from '@/lib/sceneTaxonomy';
import type { CatalogScene } from './useSceneCatalog';

const SLIM_COLUMNS =
  'id, scene_id, title, sub_category, category_collection, scene_type, subject, shot_style, setting, preview_image_url, prompt_template, filter_tags, created_at';

const PER_BUCKET = 12;
const HARD_CEILING = 60;

/**
 * Per-user recommended rail.
 *
 * Resolution (3-pass on the recommended_scenes table, then algorithmic):
 *   1. Sub-category curated — for each sub-type slug the user picked in
 *      Step 3, fetch rows WHERE category = <slug> ordered by sort_order.
 *   2. Family curated — for each family id from Step 2, fetch rows WHERE
 *      category = <family>.
 *   3. Global top-up — rows WHERE category IS NULL.
 *   4. Algorithmic fallback — interleave top scenes per family the user picked.
 *
 * Cached 10 min per user. Output is deduped & capped at 12.
 */
export function useRecommendedScenes(enabled = true) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery<CatalogScene[]>({
    queryKey: ['scene-recommended', userId],
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      // 1. User's onboarding categories + sub-categories
      let userCategories: string[] = [];
      let userSubcategories: string[] = [];
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('product_categories, product_subcategories')
          .eq('user_id', userId)
          .maybeSingle();
        userCategories = (profile?.product_categories ?? []).filter(
          (c): c is string => !!c && c !== 'any',
        );
        userSubcategories = (((profile as any)?.product_subcategories) ?? []).filter(
          (c: any): c is string => !!c && typeof c === 'string',
        );
      }

      // Helper: fetch recommended scene_ids for a given category key (or null=Global)
      const fetchRecForCategory = async (category: string | null) => {
        let q: any = supabase
          .from('recommended_scenes' as any)
          .select('scene_id, sort_order');
        q = category === null ? q.is('category', null) : q.eq('category', category);
        const { data } = await q.order('sort_order', { ascending: true }).limit(MAX);
        return ((data ?? []) as unknown) as { scene_id: string; sort_order: number }[];
      };

      const orderedSceneIds: string[] = [];
      const seen = new Set<string>();

      const ingest = (rows: { scene_id: string; sort_order: number }[]) => {
        for (const row of rows) {
          if (orderedSceneIds.length >= MAX) break;
          if (seen.has(row.scene_id)) continue;
          seen.add(row.scene_id);
          orderedSceneIds.push(row.scene_id);
        }
      };

      // PASS 1: sub-category curated (highest precision)
      if (userSubcategories.length) {
        const perSubLists = await Promise.all(
          userSubcategories.map(s => fetchRecForCategory(s)),
        );
        for (const list of perSubLists) {
          ingest(list);
          if (orderedSceneIds.length >= MAX) break;
        }
      }

      // PASS 2: family curated (existing behaviour)
      if (orderedSceneIds.length < MAX && userCategories.length) {
        const perCategoryLists = await Promise.all(
          userCategories.map(c => fetchRecForCategory(c)),
        );
        for (const list of perCategoryLists) {
          ingest(list);
          if (orderedSceneIds.length >= MAX) break;
        }
      }

      // PASS 3: Global top-up (category IS NULL)
      if (orderedSceneIds.length < MAX) {
        const globalList = await fetchRecForCategory(null);
        ingest(globalList);
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

      if (recommendedScenes.length >= MAX) return recommendedScenes.slice(0, MAX);

      // 5. Algorithmic fallback: top scenes per family the user picked,
      // narrowed to picked sub-categories when present.
      const userFamilies: string[] = (() => {
        if (!userCategories.length && !userSubcategories.length) return [...FAMILY_ORDER];
        const collections = resolveUserCollections(userCategories, userSubcategories);
        const fams = new Set<string>();
        for (const c of collections) {
          const f = CATEGORY_FAMILY_MAP[c];
          if (f) fams.add(f);
        }
        return fams.size ? Array.from(fams) : [...FAMILY_ORDER];
      })();

      const subcategorySet = new Set(userSubcategories.map(s => s.toLowerCase()));
      const perFamilyLists = await Promise.all(
        userFamilies.map(async fam => {
          let collections = Object.entries(CATEGORY_FAMILY_MAP)
            .filter(([, f]) => f === fam)
            .map(([slug]) => slug);
          if (subcategorySet.size) {
            const narrowed = collections.filter(s => subcategorySet.has(s));
            if (narrowed.length) collections = narrowed;
          }
          if (!collections.length) return [] as CatalogScene[];
          const { data } = await supabase
            .from('product_image_scenes')
            .select(SLIM_COLUMNS)
            .eq('is_active', true)
            .in('category_collection', collections)
            .order('sort_order', { ascending: true })
            .limit(MAX);
          return (data ?? []) as CatalogScene[];
        }),
      );

      const flat: CatalogScene[] = [];
      for (const list of perFamilyLists) {
        for (const s of list) {
          if (seen.has(s.scene_id)) continue;
          seen.add(s.scene_id);
          flat.push(s);
        }
      }

      const interleaved = interleaveByFamily(flat, 2);
      return [...recommendedScenes, ...interleaved].slice(0, MAX);
    },
  });
}
