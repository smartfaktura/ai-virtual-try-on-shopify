import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DiscoverPreset {
  id: string;
  title: string;
  prompt: string;
  image_url: string;
  category: string;
  subcategory: string | null;
  model_name: string | null;
  scene_name: string | null;
  scene_image_url: string | null;
  model_image_url: string | null;
  aspect_ratio: string;
  quality: string;
  tags: string[] | null;
  sort_order: number;
  is_featured: boolean;
  workflow_slug: string | null;
  workflow_name: string | null;
  product_name: string | null;
  product_image_url: string | null;
  discover_categories: string[] | null;
  created_at: string;
  slug: string;
}

export function useDiscoverPresets() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('discover-presets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'discover_presets' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['discover-presets'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discover_presets')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as DiscoverPreset[];
    },
  });
}
