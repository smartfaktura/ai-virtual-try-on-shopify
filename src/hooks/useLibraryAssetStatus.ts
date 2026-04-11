import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AssetStatus = 'draft' | 'brand_ready' | 'ready_to_publish';

export function useLibraryAssetStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: statusMap = new Map<string, AssetStatus>() } = useQuery({
    queryKey: ['library-asset-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Map<string, AssetStatus>();
      const { data, error } = await supabase
        .from('library_asset_status')
        .select('image_id, status')
        .eq('user_id', user.id);
      if (error) throw error;
      const m = new Map<string, AssetStatus>();
      for (const r of data ?? []) {
        m.set(r.image_id, r.status as AssetStatus);
      }
      return m;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const setStatus = useMutation({
    mutationFn: async ({ imageId, status }: { imageId: string; status: AssetStatus }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('library_asset_status')
        .upsert({ user_id: user.id, image_id: imageId, status, updated_at: new Date().toISOString() }, { onConflict: 'user_id,image_id' });
      if (error) throw error;
    },
    onMutate: async ({ imageId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['library-asset-status', user?.id] });
      const prev = queryClient.getQueryData<Map<string, AssetStatus>>(['library-asset-status', user?.id]);
      queryClient.setQueryData<Map<string, AssetStatus>>(['library-asset-status', user?.id], (old) => {
        const next = new Map(old);
        next.set(imageId, status);
        return next;
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['library-asset-status', user?.id], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['library-asset-status', user?.id] });
    },
  });

  const setStatusMany = useMutation({
    mutationFn: async ({ imageIds, status }: { imageIds: string[]; status: AssetStatus }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('library_asset_status')
        .upsert(
          imageIds.map(id => ({ user_id: user.id, image_id: id, status, updated_at: new Date().toISOString() })),
          { onConflict: 'user_id,image_id' }
        );
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['library-asset-status', user?.id] });
    },
  });

  const getStatus = (imageId: string): AssetStatus => statusMap.get(imageId) ?? 'draft';

  return { statusMap, getStatus, setStatus, setStatusMany };
}
