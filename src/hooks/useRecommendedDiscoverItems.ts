import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_FAMILY_MAP, getSubFamilyLabel } from '@/lib/sceneTaxonomy';
import { FAMILY_NAME_TO_ID } from '@/lib/onboardingTaxonomy';
import type { TryOnPose, PoseCategory } from '@/types';

/**
 * Synthesizes Discover scene-tiles from admin-recommended scenes
 * (joins recommended_scenes ↔ product_image_scenes, dedupes by scene_id).
 *
 * Each tile carries `scene_ref` so the Recreate flow lands directly in the
 * Product Images wizard with the scene pre-selected.
 */

interface RecommendedRow {
  id: string;
  scene_id: string;
  category: string | null;
  created_at: string;
}

interface SceneRow {
  scene_id: string;
  title: string;
  description: string;
  preview_image_url: string | null;
  category_collection: string | null;
}

export interface RecommendedDiscoverPose extends TryOnPose {
  /** product_image_scenes.scene_id — drives "Recreate" pre-selection */
  scene_ref: string;
  /** [familyId, category_collection] for chip filtering */
  discover_categories: string[];
  /** sub-family slug */
  subcategory?: string;
  /** Workflow metadata so consumers can display "Created with Product Visuals" */
  workflow_slug?: string;
  workflow_name?: string;
}

function familyIdFor(collection: string | null | undefined): string {
  if (!collection) return 'all';
  const familyName = CATEGORY_FAMILY_MAP[collection];
  if (!familyName) return 'all';
  return FAMILY_NAME_TO_ID[familyName] ?? 'all';
}

export function useRecommendedDiscoverItems(opts: { mode: 'auth' | 'public' } = { mode: 'auth' }) {
  return useQuery({
    queryKey: ['recommended-discover-items', opts.mode],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<RecommendedDiscoverPose[]> => {
      // Both auth and public paths use the same SECURITY DEFINER RPC.
      // This avoids the silent 1000-row PostgREST cap that was truncating
      // the authenticated `product_image_scenes` read and dropping recommended
      // scenes whose IDs sat past the first 1000 active rows.
      const { data, error } = await supabase.rpc('get_public_recommended_scenes');
      if (error) throw error;
      const rows = (data as any[]) ?? [];
      return disambiguateTitles(rows.map(mapRow));
    },
  });
}

/**
 * When multiple recommended scenes share the same title across different
 * sub-categories (e.g. "Worn Portrait" exists for eyewear, hats, watches),
 * append " — {SubFamilyLabel}" to the display name only. The DB row,
 * scene_ref, and subcategory mapping stay untouched.
 */
function disambiguateTitles(poses: RecommendedDiscoverPose[]): RecommendedDiscoverPose[] {
  const groups = new Map<string, RecommendedDiscoverPose[]>();
  for (const p of poses) {
    const key = p.name.trim().toLowerCase();
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }
  for (const arr of groups.values()) {
    if (arr.length < 2) continue;
    const distinctSubs = new Set(arr.map((p) => p.subcategory ?? '').filter(Boolean));
    if (distinctSubs.size < 2) continue;
    for (const p of arr) {
      if (!p.subcategory) continue;
      const label = getSubFamilyLabel(p.subcategory);
      if (label) p.name = `${p.name} — ${label}`;
    }
  }
  return poses;
}

function mapRow(row: any): RecommendedDiscoverPose {
  return buildPose(
    {
      scene_id: row.scene_id,
      title: row.title,
      description: row.description ?? '',
      preview_image_url: row.preview_image_url,
      category_collection: row.category_collection,
    },
    row.created_at,
  );
}

function buildPose(scene: SceneRow, createdAt: string): RecommendedDiscoverPose {
  const subcategory = scene.category_collection ?? undefined;
  const familyId = familyIdFor(subcategory);
  const discoverCategories = [familyId, subcategory].filter(Boolean) as string[];
  return {
    poseId: `rec-${scene.scene_id}`,
    name: scene.title,
    category: familyId as PoseCategory,
    description: scene.description ?? '',
    promptHint: scene.description ?? '',
    previewUrl: scene.preview_image_url ?? '',
    created_at: createdAt,
    scene_ref: scene.scene_id,
    subcategory,
    discover_categories: discoverCategories,
    workflow_slug: 'product-images',
    workflow_name: 'Product Visuals',
  };
}
