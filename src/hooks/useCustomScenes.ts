import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TryOnPose, PoseCategory } from '@/types';

export interface CustomScene {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
}

function toTryOnPose(scene: CustomScene): TryOnPose {
  return {
    poseId: `custom-${scene.id}`,
    name: scene.name,
    category: scene.category as PoseCategory,
    description: scene.description,
    promptHint: scene.description,
    previewUrl: scene.image_url,
  };
}

export function useCustomScenes() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['custom-scenes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_scenes' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as CustomScene[]) ?? [];
    },
    enabled: !!user,
  });

  const asPoses = (query.data ?? []).map(toTryOnPose);

  return { ...query, scenes: query.data ?? [], asPoses };
}

export function useAddCustomScene() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (scene: { name: string; description: string; category: string; image_url: string }) => {
      const { data, error } = await supabase
        .from('custom_scenes' as any)
        .insert({ ...scene, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CustomScene;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-scenes'] }),
  });
}

export function useDeleteCustomScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_scenes' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-scenes'] }),
  });
}
