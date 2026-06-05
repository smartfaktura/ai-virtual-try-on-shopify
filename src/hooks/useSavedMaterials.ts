import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';

export interface SavedMaterial {
  id: string;
  label: string;
  image_url: string;
  created_at: string;
}

export const MAX_SAVED_MATERIALS = 50;

export function useSavedMaterials() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['saved-materials', user?.id],
    queryFn: async (): Promise<SavedMaterial[]> => {
      const { data, error } = await supabase
        .from('user_materials')
        .select('id, label, image_url, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: { label: string; imageUrl: string }) => {
      if (!user) throw new Error('Not signed in');
      const current = query.data?.length || 0;
      if (current >= MAX_SAVED_MATERIALS) {
        throw new Error(`You can save up to ${MAX_SAVED_MATERIALS} swatches`);
      }
      const { data, error } = await supabase
        .from('user_materials')
        .insert({
          user_id: user.id,
          label: (input.label || 'Material').trim().slice(0, 80) || 'Material',
          image_url: input.imageUrl,
        })
        .select('id, label, image_url, created_at')
        .single();
      if (error) throw error;
      return data as SavedMaterial;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-materials', user?.id] });
      toast.success('Swatch saved');
    },
    onError: (err: unknown) => {
      const m = err instanceof Error ? err.message : 'Could not save swatch';
      toast.error(m);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_materials').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-materials', user?.id] });
      toast.success('Removed from saved swatches');
    },
    onError: (err: unknown) => {
      const m = err instanceof Error ? err.message : 'Could not remove swatch';
      toast.error(m);
    },
  });

  const renameMutation = useMutation({
    mutationFn: async (input: { id: string; label: string }) => {
      const label = (input.label || 'Material').trim().slice(0, 80) || 'Material';
      const { error } = await supabase
        .from('user_materials')
        .update({ label })
        .eq('id', input.id);
      if (error) throw error;
      return { id: input.id, label };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-materials', user?.id] });
    },
    onError: (err: unknown) => {
      const m = err instanceof Error ? err.message : 'Could not rename swatch';
      toast.error(m);
    },
  });

  const save = useCallback(
    (input: { label: string; imageUrl: string }) => saveMutation.mutateAsync(input),
    [saveMutation],
  );
  const remove = useCallback((id: string) => removeMutation.mutateAsync(id), [removeMutation]);
  const rename = useCallback(
    (id: string, label: string) => renameMutation.mutateAsync({ id, label }),
    [renameMutation],
  );

  return {
    materials: query.data || [],
    isLoading: query.isLoading,
    save,
    remove,
    rename,
    isSaving: saveMutation.isPending,
  };
}
