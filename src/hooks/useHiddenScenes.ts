import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TryOnPose } from '@/types';

export function useHiddenScenes() {
  const queryClient = useQueryClient();

  const { data: hiddenIds = [], isLoading } = useQuery({
    queryKey: ['hidden-scenes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hidden_scenes' as any)
        .select('scene_id');
      if (error) throw error;
      return (data as any[]).map((r: any) => r.scene_id as string);
    },
    staleTime: 5 * 60 * 1000,
  });

  const hideScene = useMutation({
    mutationFn: async ({ sceneId, userId }: { sceneId: string; userId: string }) => {
      const { error } = await supabase
        .from('hidden_scenes' as any)
        .insert({ scene_id: sceneId, hidden_by: userId } as any);
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

  return { hiddenIds, isLoading, hideScene, unhideScene, filterVisible };
}
