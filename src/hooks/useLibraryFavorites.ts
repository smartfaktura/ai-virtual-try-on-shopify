import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLibraryFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds = new Set<string>() } = useQuery({
    queryKey: ['library-favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data, error } = await supabase
        .from('library_favorites')
        .select('image_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return new Set((data ?? []).map(r => r.image_id));
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (imageId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (favoriteIds.has(imageId)) {
        const { error } = await supabase
          .from('library_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', imageId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('library_favorites')
          .insert({ user_id: user.id, image_id: imageId });
        if (error) throw error;
      }
    },
    onMutate: async (imageId) => {
      await queryClient.cancelQueries({ queryKey: ['library-favorites', user?.id] });
      const prev = queryClient.getQueryData<Set<string>>(['library-favorites', user?.id]);
      queryClient.setQueryData<Set<string>>(['library-favorites', user?.id], (old) => {
        const next = new Set(old);
        if (next.has(imageId)) next.delete(imageId);
        else next.add(imageId);
        return next;
      });
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['library-favorites', user?.id], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['library-favorites', user?.id] });
    },
  });

  const bulkFavorite = useMutation({
    mutationFn: async (imageIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      const toAdd = imageIds.filter(id => !favoriteIds.has(id));
      if (toAdd.length === 0) return;
      const { error } = await supabase
        .from('library_favorites')
        .upsert(toAdd.map(id => ({ user_id: user.id, image_id: id })), { onConflict: 'user_id,image_id' });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['library-favorites', user?.id] });
    },
  });

  return { favoriteIds, toggleFavorite, bulkFavorite };
}
