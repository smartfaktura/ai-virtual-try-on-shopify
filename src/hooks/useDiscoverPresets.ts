import { useQuery } from '@tanstack/react-query';
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
