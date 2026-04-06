import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedColor {
  id: string;
  hex: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
  label: string;
  created_at: string;
}

const MAX_SAVED = 6;

export function useUserSavedColors() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['user-saved-colors', user?.id];

  const { data: colors = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_saved_colors' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as SavedColor[];
    },
  });

  const saveColor = useMutation({
    mutationFn: async (params: { hex: string }) => {
      if (colors.length >= MAX_SAVED) throw new Error('Limit reached');
      const { error } = await supabase
        .from('user_saved_colors' as any)
        .insert({ user_id: user!.id, hex: params.hex, label: params.hex } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const saveGradient = useMutation({
    mutationFn: async (params: { from: string; to: string }) => {
      if (colors.length >= MAX_SAVED) throw new Error('Limit reached');
      const { error } = await supabase
        .from('user_saved_colors' as any)
        .insert({ user_id: user!.id, gradient_from: params.from, gradient_to: params.to, label: 'Gradient' } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteColor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_saved_colors' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    colors,
    isLoading,
    canSave: colors.length < MAX_SAVED,
    saveColor: saveColor.mutate,
    saveGradient: saveGradient.mutate,
    deleteColor: deleteColor.mutate,
    isSaving: saveColor.isPending || saveGradient.isPending,
  };
}
