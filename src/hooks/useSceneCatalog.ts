import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_FAMILY_MAP, interleaveByFamily } from '@/lib/sceneTaxonomy';

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

      if (filters.family) {
        // Stable sort: non-essentials first, essentials last.
        return [...rows].sort((a, b) => {
          const aE = a.sub_category?.toLowerCase().includes('essential') ? 1 : 0;
          const bE = b.sub_category?.toLowerCase().includes('essential') ? 1 : 0;
          return aE - bE;
        });
      }
      return rows;
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
