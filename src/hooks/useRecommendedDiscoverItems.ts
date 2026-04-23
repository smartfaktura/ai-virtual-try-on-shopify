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
      let scenes: SceneRow[] = [];
      let recs: RecommendedRow[] = [];

      if (opts.mode === 'public') {
        // Public path: SECURITY DEFINER RPC bundles the join + active filter
        const { data, error } = await supabase.rpc('get_public_recommended_scenes');
        if (error) throw error;
        const rows = (data as any[]) ?? [];
        return rows.map(mapRow);
      }

      // Authenticated path: read both tables (RLS already allows it)
      const [recRes, sceneRes] = await Promise.all([
        supabase.from('recommended_scenes').select('id, scene_id, category, created_at'),
        supabase
          .from('product_image_scenes')
          .select('scene_id, title, description, preview_image_url, category_collection')
          .eq('is_active', true),
      ]);
      if (recRes.error) throw recRes.error;
      if (sceneRes.error) throw sceneRes.error;
      recs = recRes.data ?? [];
      scenes = sceneRes.data ?? [];

      const sceneById = new Map<string, SceneRow>();
      for (const s of scenes) sceneById.set(s.scene_id, s);

      // Dedupe by scene_id, keep newest recommended_at
      const newestRec = new Map<string, RecommendedRow>();
      for (const r of recs) {
        const existing = newestRec.get(r.scene_id);
        if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
          newestRec.set(r.scene_id, r);
        }
      }

      const out: RecommendedDiscoverPose[] = [];
      for (const [sceneId, rec] of newestRec) {
        const scene = sceneById.get(sceneId);
        if (!scene || !scene.preview_image_url) continue;
        out.push(buildPose(scene, rec.created_at));
      }
      return out;
    },
  });
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
  };
}
