import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SeoVisualOverride {
  page_route: string;
  slot_key: string;
  scene_id: string;
  preview_image_url: string;
  alt_text: string | null;
}

const QUERY_KEY = ['seo-page-visuals'];

async function fetchAllOverrides(): Promise<SeoVisualOverride[]> {
  const { data, error } = await supabase
    .from('seo_page_visuals' as any)
    .select('page_route,slot_key,scene_id,preview_image_url,alt_text');
  if (error) {
    // Never throw — fallback path must remain stable for SEO.
    console.warn('[seo-overrides] fetch failed:', error.message);
    return [];
  }
  return (data ?? []) as unknown as SeoVisualOverride[];
}

/**
 * Public, lightweight hook. Returns a Map keyed by `${page_route}::${slot_key}`.
 * If the fetch fails or is in flight, returns an empty Map and the SEO pages
 * keep rendering their existing fallback images.
 */
export function useSeoVisualOverridesMap() {
  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAllOverrides,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const map = new Map<string, SeoVisualOverride>();
  for (const row of data ?? []) {
    map.set(`${row.page_route}::${row.slot_key}`, row);
  }
  return map;
}

export function getOverrideKey(pageRoute: string, slotKey: string) {
  return `${pageRoute}::${slotKey}`;
}

export const SEO_OVERRIDES_QUERY_KEY = QUERY_KEY;
