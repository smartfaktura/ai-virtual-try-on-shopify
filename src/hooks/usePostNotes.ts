import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePostNotes(watchPostId?: string) {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['post-notes', watchPostId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_notes' as any)
        .select('*')
        .eq('watch_post_id', watchPostId!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!watchPostId,
  });

  const saveNotes = useMutation({
    mutationFn: async (values: any) => {
      if (notes?.id) {
        const { error } = await supabase
          .from('post_notes' as any)
          .update(values)
          .eq('id', notes.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_notes' as any)
          .insert({ watch_post_id: watchPostId, ...values });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-notes', watchPostId] });
      toast.success('Notes saved');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { notes, isLoading, saveNotes };
}
