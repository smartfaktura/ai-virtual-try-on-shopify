import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO_OVERRIDES_QUERY_KEY } from './useSeoVisualOverrides';

export interface SeoVisualUpsertInput {
  page_route: string;
  slot_key: string;
  scene_id: string;
  preview_image_url: string;
  alt_text?: string | null;
  updated_by: string;
}

export function useAdminSeoVisuals() {
  const qc = useQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: SEO_OVERRIDES_QUERY_KEY });

  const upsertMany = useMutation({
    mutationFn: async (rows: SeoVisualUpsertInput[]) => {
      if (rows.length === 0) return;
      const { error } = await supabase
        .from('seo_page_visuals' as any)
        .upsert(rows as any, { onConflict: 'page_route,slot_key' });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeOne = useMutation({
    mutationFn: async (params: { page_route: string; slot_key: string }) => {
      const { error } = await supabase
        .from('seo_page_visuals' as any)
        .delete()
        .eq('page_route', params.page_route)
        .eq('slot_key', params.slot_key);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { upsertMany, removeOne };
}
