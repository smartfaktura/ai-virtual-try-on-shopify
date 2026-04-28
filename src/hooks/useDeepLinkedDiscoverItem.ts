import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockTryOnPoses } from '@/data/mockData';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';
import type { TryOnPose, PoseCategory } from '@/types';

/**
 * Single-row fetch that resolves a deep-linked /discover/:itemId URL into a
 * `DiscoverItem` BEFORE the rest of the feed loads. This lets the detail
 * modal open in one round-trip instead of waiting for ~400+ rows across
 * three separate RPCs.
 *
 * Resolution rules (mirror the auto-open effect in PublicDiscover.tsx):
 * - `scene-rec-<scene_id>` → product_image_scenes row (anon SELECT allowed
 *    where is_active = true) shaped as a recommended TryOnPose.
 * - `scene-<poseId>` (legacy mock) → resolved synchronously from the bundle.
 * - Anything else → discover_presets row matched by slug or UUID (anon
 *    SELECT allowed).
 *
 * Custom scenes (`scene-custom-<uuid>`) are intentionally NOT fast-pathed —
 * they require an admin-gated RPC and the fallback effect in
 * PublicDiscover.tsx will pick them up once the regular feed resolves.
 */
export function useDeepLinkedDiscoverItem(urlItemId: string | undefined) {
  return useQuery<DiscoverItem | null>({
    queryKey: ['discover-deep-linked-item', urlItemId ?? null],
    enabled: !!urlItemId,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (!urlItemId) return null;

      // 1. Recommended scene fast-path: scene-rec-<scene_id>
      if (urlItemId.startsWith('scene-rec-')) {
        const sceneId = urlItemId.replace(/^scene-rec-/, '');
        const { data, error } = await supabase
          .from('product_image_scenes')
          .select('scene_id, title, description, preview_image_url, category_collection, created_at')
          .eq('scene_id', sceneId)
          .eq('is_active', true)
          .maybeSingle();
        if (error || !data) return null;
        const pose: TryOnPose = {
          poseId: `rec-${data.scene_id}`,
          name: data.title,
          category: 'fashion' as PoseCategory,
          description: data.description ?? '',
          promptHint: data.description ?? '',
          previewUrl: data.preview_image_url ?? '',
          created_at: data.created_at,
          // @ts-expect-error extended fields used by the modal
          scene_ref: data.scene_id,
          subcategory: data.category_collection ?? undefined,
          discover_categories: [data.category_collection].filter(Boolean) as string[],
          workflow_slug: 'product-images',
          workflow_name: 'Product Visuals',
        };
        return { type: 'scene', data: pose };
      }

      // 2. Legacy mock pose fast-path: scene-<poseId>
      if (urlItemId.startsWith('scene-')) {
        const poseId = urlItemId.replace(/^scene-/, '');
        const found = mockTryOnPoses.find((p) => p.poseId === poseId);
        if (found) return { type: 'scene', data: found };
        return null;
      }

      // 3. Preset fast-path: slug or UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(urlItemId);
      const query = supabase.from('discover_presets').select('*');
      const { data, error } = isUuid
        ? await query.eq('id', urlItemId).maybeSingle()
        : await query.eq('slug', urlItemId).maybeSingle();
      if (error || !data) return null;
      return { type: 'preset', data: data as DiscoverPreset };
    },
  });
}
