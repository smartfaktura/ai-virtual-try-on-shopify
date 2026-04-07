import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useReferenceAnalysis(watchPostId?: string) {
  const queryClient = useQueryClient();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['reference-analysis', watchPostId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reference_analyses' as any)
        .select('*')
        .eq('watch_post_id', watchPostId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!watchPostId,
  });

  const analyzePost = useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase.functions.invoke('analyze-trend-post', {
        body: { watch_post_id: postId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.analysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reference-analysis'] });
    },
    onError: (e: any) => toast.error(`Analysis failed: ${e.message}`),
  });

  const updateAnalysis = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from('reference_analyses' as any)
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reference-analysis'] });
      toast.success('Analysis updated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { analysis, isLoading, analyzePost, updateAnalysis };
}
