import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  filterTags?: string[];
  sort?: 'recommended' | 'popular' | 'new';
}

const PAGE_SIZE = 24;

function applyFilters<T extends ReturnType<typeof supabase.from>>(
  query: any,
  filters: SceneCatalogFilters,
) {
  let q = query.eq('is_active', true);

  if (filters.subjects?.length) q = q.in('subject', filters.subjects);
  if (filters.shotStyles?.length) q = q.in('shot_style', filters.shotStyles);
  if (filters.settings?.length) q = q.in('setting', filters.settings);
  if (filters.collections?.length) q = q.in('category_collection', filters.collections);
  if (filters.filterTags?.length) q = q.contains('filter_tags', filters.filterTags);

  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[%_]/g, '\\$&');
    q = q.or(
      `title.ilike.%${term}%,description.ilike.%${term}%,sub_category.ilike.%${term}%`,
    );
  }

  if (filters.sort === 'new') q = q.order('created_at', { ascending: false });
  else q = q.order('sort_order', { ascending: true });

  return q;
}

/**
 * Infinite paged scene query. Used in filtered / search mode.
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
      return (data ?? []) as CatalogScene[];
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
