import { useEffect, useMemo } from 'react';
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
const STORAGE_KEY = 'seo-visual-overrides:v1';

interface Snapshot {
  ts: number;
  rows: SeoVisualOverride[];
}

function readSnapshot(): SeoVisualOverride[] | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Snapshot;
    if (!parsed || !Array.isArray(parsed.rows)) return undefined;
    return parsed.rows;
  } catch {
    return undefined;
  }
}

export function writeSnapshot(rows: SeoVisualOverride[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ts: Date.now(), rows } satisfies Snapshot),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function clearSnapshot() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchAllOverrides(): Promise<SeoVisualOverride[]> {
  const { data, error } = await supabase
    .from('seo_page_visuals' as any)
    .select('page_route,slot_key,scene_id,preview_image_url,alt_text');
  if (error) {
    console.warn('[seo-overrides] fetch failed:', error.message);
    return [];
  }
  const rows = (data ?? []) as unknown as SeoVisualOverride[];
  writeSnapshot(rows);
  return rows;
}

/**
 * Returns:
 *  - `map`: Map keyed by `${page_route}::${slot_key}`
 *  - `isReady`: true once we have either a localStorage snapshot or a fresh
 *    network result. While false, consumers should render a neutral
 *    placeholder instead of the hardcoded fallback to avoid the
 *    "old image flashes for 1s" problem on first paint.
 */
export function useSeoVisualOverridesMap(): {
  map: Map<string, SeoVisualOverride>;
  isReady: boolean;
} {
  const snapshot = useMemo(() => readSnapshot(), []);

  const { data, isFetched } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAllOverrides,
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    initialData: snapshot,
    // If we hydrated from snapshot, treat as immediately stale so we
    // refetch in background to pick up admin changes.
    initialDataUpdatedAt: snapshot ? 0 : undefined,
  });

  const map = useMemo(() => {
    const m = new Map<string, SeoVisualOverride>();
    for (const row of data ?? []) {
      m.set(`${row.page_route}::${row.slot_key}`, row);
    }
    return m;
  }, [data]);

  // Preload override images so the eventual swap (cold-cache first visit)
  // is instant rather than waiting on a fresh image fetch.
  useEffect(() => {
    if (typeof window === 'undefined' || !data) return;
    const seen = new Set<string>();
    for (const row of data) {
      if (!row.preview_image_url || seen.has(row.preview_image_url)) continue;
      seen.add(row.preview_image_url);
      const img = new Image();
      img.decoding = 'async';
      img.src = row.preview_image_url;
    }
  }, [data]);

  const isReady = !!snapshot || isFetched;
  return { map, isReady };
}

export function getOverrideKey(pageRoute: string, slotKey: string) {
  return `${pageRoute}::${slotKey}`;
}

export const SEO_OVERRIDES_QUERY_KEY = QUERY_KEY;
