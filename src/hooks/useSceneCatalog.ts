import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  CATEGORY_FAMILY_MAP,
  interleaveByFamily,
  interleaveByFamilyAndSubFamily,
  interleaveBySubFamily,
  resolveUserCollections,
} from '@/lib/sceneTaxonomy';

export interface CatalogScene {
  id: string;
  scene_id: string;
  title: string;
  sub_category: string | null;
  category_collection: string | null;
  scene_type: string | null;
  subject: string | null;
  shot_style: string | null;
  setting: string | null;
  preview_image_url: string | null;
  prompt_template: string | null;
  filter_tags: string[] | null;
  created_at: string | null;
}

const SLIM_COLUMNS =
  'id, scene_id, title, sub_category, category_collection, scene_type, subject, shot_style, setting, preview_image_url, prompt_template, filter_tags, created_at';

export interface SceneCatalogFilters {
  search?: string;
  subjects?: string[];
  shotStyles?: string[];
  settings?: string[];
  collections?: string[];
  /** Single-select family name (e.g. "Fashion"). Resolved to the matching collection slugs. */
  family?: string | null;
  /** Single-select sub-family slug (overrides family expansion when set). */
  categoryCollection?: string | null;
  filterTags?: string[];
  sort?: 'recommended' | 'new';
  /** When true, exclude rows whose sub_category contains "essential". */
  excludeEssentials?: boolean;
}

const PAGE_SIZE = 24;

function familyToCollections(family: string | null | undefined): string[] {
  if (!family) return [];
  return Object.entries(CATEGORY_FAMILY_MAP)
    .filter(([, fam]) => fam === family)
    .map(([slug]) => slug);
}

function applyFilters(query: any, filters: SceneCatalogFilters) {
  let q = query.eq('is_active', true);

  if (filters.subjects?.length) q = q.in('subject', filters.subjects);
  if (filters.shotStyles?.length) q = q.in('shot_style', filters.shotStyles);
  if (filters.settings?.length) q = q.in('setting', filters.settings);

  // Sub-family (single collection) takes top precedence, then family, then explicit collections.
  if (filters.categoryCollection) {
    q = q.eq('category_collection', filters.categoryCollection);
  } else {
    const familyCollections = familyToCollections(filters.family);
    if (familyCollections.length) {
      q = q.in('category_collection', familyCollections);
    } else if (filters.collections?.length) {
      q = q.in('category_collection', filters.collections);
    }
  }

  if (filters.filterTags?.length) q = q.contains('filter_tags', filters.filterTags);

  if (filters.excludeEssentials) {
    q = q.not('sub_category', 'ilike', '%essential%');
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[%_]/g, '\\$&');
    q = q.or(
      `title.ilike.%${term}%,description.ilike.%${term}%,sub_category.ilike.%${term}%`,
    );
  }

  if (filters.sort === 'new') {
    q = q.order('created_at', { ascending: false });
  } else {
    // When a family is selected, push "essential" sub-categories to the bottom of the list.
    if (filters.family) {
      // PostgREST supports order with foreignTable etc; sub_category ASC NULLS LAST is the closest pure approximation.
      // Essentials still rank below since titles like "Essential Pack" sort after most descriptive titles after sort_order.
      q = q.order('sort_order', { ascending: true });
    } else {
      q = q.order('sort_order', { ascending: true });
    }
  }

  return q;
}

/**
 * Infinite paged scene query. Used in filtered / search mode.
 *
 * When a family filter is active, we fetch the page then locally re-rank rows so
 * any sub_category containing "essential" sinks to the bottom — this matches the
 * UX requirement without needing a custom RPC.
 */
export function useSceneCatalog(filters: SceneCatalogFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['scene-catalog', filters],
    enabled,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      let q: any = supabase.from('product_image_scenes').select(SLIM_COLUMNS);
      q = applyFilters(q, filters).range(start, end);
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as CatalogScene[];

      // Sub-family round-robin: when a family filter is active (no specific
      // sub-family selected), rotate scenes across sub-families on each page so
      // the user sees variety (one shirt, one dress, one jeans…) instead of
      // a long cluster from a single sub-family.
      const familyFilteredRows =
        filters.family && !filters.categoryCollection
          ? interleaveBySubFamily(rows)
          : rows;

      if (filters.family) {
        // Stable sort: non-essentials first, essentials last.
        return [...familyFilteredRows].sort((a, b) => {
          const aE = a.sub_category?.toLowerCase().includes('essential') ? 1 : 0;
          const bE = b.sub_category?.toLowerCase().includes('essential') ? 1 : 0;
          return aE - bE;
        });
      }
      return familyFilteredRows;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length,
  });
}

/**
 * Single rail query (default view). Each rail = one tiny LIMIT 12 fetch.
 */
export function useSceneRail(
  key: string,
  filters: SceneCatalogFilters,
  limit = 12,
  enabled = true,
) {
  return useQuery({
    queryKey: ['scene-rail', key, filters, limit],
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      let q: any = supabase.from('product_image_scenes').select(SLIM_COLUMNS);
      q = applyFilters(q, filters).limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CatalogScene[];
    },
  });
}

/**
 * One-shot fetch of the active scene catalog, ordered for the default "All scenes" view.
 *
 * Order:
 *   1. Admin curated picks from `recommended_scenes` (Global + matching user
 *      product_categories), in admin's saved order.
 *   2. Sub-family-aware interleave across the catalog: round-robin one item per
 *      sub-family within each family, then 2-by-2 across families in FAMILY_ORDER.
 *   3. Long tail (anything left) keeps original sort_order.
 *
 * Cached 10 min per user. Returns pages-shaped data for <SceneCatalogGrid>.
 */
export function useInterleavedSceneCatalog(enabled = true, _chunkSize = 2) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: ['scene-catalog-interleaved', userId],
    enabled,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      // 1. Resolve user's onboarding categories for personalised admin picks.
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

      // 2. Parallel fetch: admin picks + full catalog.
      const adminPicksPromise = (async () => {
        let q: any = supabase
          .from('recommended_scenes' as any)
          .select('scene_id, sort_order, category');
        if (userCategories.length) {
          // category IS NULL OR category IN (userCategories)
          const list = userCategories.map(c => `"${c.replace(/"/g, '\\"')}"`).join(',');
          q = q.or(`category.is.null,category.in.(${list})`);
        } else {
          q = q.is('category', null);
        }
        const { data } = await q
          .order('category', { ascending: true, nullsFirst: false })
          .order('sort_order', { ascending: true })
          .limit(60);
        return ((data ?? []) as unknown) as {
          scene_id: string;
          sort_order: number;
          category: string | null;
        }[];
      })();

      const catalogPromise = supabase
        .from('product_image_scenes')
        .select(SLIM_COLUMNS)
        .eq('is_active', true)
        .not('sub_category', 'ilike', '%essential%')
        .order('sort_order', { ascending: true })
        .limit(1500);

      const [adminPicksRows, catalogResult] = await Promise.all([
        adminPicksPromise,
        catalogPromise,
      ]);

      if (catalogResult.error) throw catalogResult.error;
      const catalog = (catalogResult.data ?? []) as CatalogScene[];

      // 3. Resolve admin pick scene_ids → full scene rows from catalog (in catalog order),
      // then re-sort by admin's order. Dedupe by scene_id.
      const catalogByScene = new Map<string, CatalogScene>();
      for (const s of catalog) catalogByScene.set(s.scene_id, s);

      const seenSceneIds = new Set<string>();
      const adminPicks: CatalogScene[] = [];
      for (const row of adminPicksRows) {
        if (seenSceneIds.has(row.scene_id)) continue;
        const scene = catalogByScene.get(row.scene_id);
        if (!scene) continue;
        seenSceneIds.add(row.scene_id);
        adminPicks.push(scene);
      }

      // 4. Interleave the remaining catalog by family + sub-family.
      const remaining = catalog.filter(s => !seenSceneIds.has(s.scene_id));
      const interleaved = interleaveByFamilyAndSubFamily(remaining, {
        familyChunk: 2,
        subFamilyChunk: 1,
      });

      const finalList = [...adminPicks, ...interleaved];
      // Touch helper to keep export used (defensive — also useful for downstream callers).
      void interleaveByFamily;
      void resolveUserCollections;
      return { pages: [finalList] as CatalogScene[][] };
    },
  });
}

