import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TryOnPose } from '@/types';
import { mockTryOnPoses } from '@/data/mockData';

export function useHiddenScenes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: hiddenIds = [], isLoading } = useQuery({
    queryKey: ['hidden-scenes'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_hidden_scene_ids');
      if (error) throw error;
      return (data as any[]).map((r: any) => r.scene_id as string);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get hidden built-in scenes with their names for the restore section
  const hiddenBuiltInScenes = mockTryOnPoses.filter(p => hiddenIds.includes(p.poseId));

  const hideScene = useMutation({
    mutationFn: async (sceneId: string) => {
      const { error } = await supabase
        .from('hidden_scenes' as any)
        .insert({ scene_id: sceneId, hidden_by: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hidden-scenes'] }),
  });

  const unhideScene = useMutation({
    mutationFn: async (sceneId: string) => {
      const { error } = await supabase
        .from('hidden_scenes' as any)
        .delete()
        .eq('scene_id', sceneId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hidden-scenes'] }),
  });

  const filterVisible = <T extends TryOnPose>(poses: T[]): T[] =>
    poses.filter(p => !hiddenIds.includes(p.poseId));

  return { hiddenIds, hiddenBuiltInScenes, isLoading, hideScene, unhideScene, filterVisible };
}
