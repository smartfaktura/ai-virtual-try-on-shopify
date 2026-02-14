import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DiscoverPreset {
  id: string;
  title: string;
  prompt: string;
  image_url: string;
  category: string;
  model_name: string | null;
  scene_name: string | null;
  aspect_ratio: string;
  quality: string;
  tags: string[] | null;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

export function useDiscoverPresets() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('discover-presets-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'discover_presets' },
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
