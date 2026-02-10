import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DiscoverSubmission {
  id: string;
  user_id: string;
  image_url: string;
  source_generation_id: string | null;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  aspect_ratio: string;
  quality: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}

export function useDiscoverSubmissions() {
  const { user } = useAuth();

  const { data: mySubmissions = [], isLoading } = useQuery({
    queryKey: ['discover-submissions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discover_submissions' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DiscoverSubmission[];
    },
    enabled: !!user?.id,
  });

  const pendingCount = mySubmissions.filter(s => s.status === 'pending').length;

  return { mySubmissions, pendingCount, isLoading };
}

export function useSubmitToDiscover() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (submission: {
      image_url: string;
      source_generation_id?: string;
      title: string;
      prompt: string;
      category: string;
      tags: string[];
      aspect_ratio: string;
      quality: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Check pending limit (max 3)
      const { count } = await supabase
        .from('discover_submissions' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if ((count ?? 0) >= 3) {
        throw new Error('You can have at most 3 pending submissions. Wait for review before submitting more.');
      }

      const { error } = await supabase
        .from('discover_submissions' as any)
        .insert({
          user_id: user.id,
          ...submission,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Submitted for review! You\'ll see it in Discover once approved.');
      qc.invalidateQueries({ queryKey: ['discover-submissions'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

// Admin hooks
export function useAdminSubmissions() {
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin-discover-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discover_submissions' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DiscoverSubmission[];
    },
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return { submissions, pendingCount, isLoading };
}

export function useApproveSubmission() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (submission: DiscoverSubmission) => {
      // 1. Insert into discover_presets
      const { error: insertError } = await supabase
        .from('discover_presets' as any)
        .insert({
          title: submission.title,
          prompt: submission.prompt,
          image_url: submission.image_url,
          category: submission.category,
          tags: submission.tags,
          aspect_ratio: submission.aspect_ratio,
          quality: submission.quality,
          sort_order: 0,
          is_featured: false,
        });
      if (insertError) throw insertError;

      // 2. Mark submission as approved
      const { error: updateError } = await supabase
        .from('discover_submissions' as any)
        .update({ status: 'approved' })
        .eq('id', submission.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Submission approved and added to Discover!');
      qc.invalidateQueries({ queryKey: ['admin-discover-submissions'] });
      qc.invalidateQueries({ queryKey: ['discover-presets'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useRejectSubmission() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { error } = await supabase
        .from('discover_submissions' as any)
        .update({ status: 'rejected', admin_note: note || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Submission rejected');
      qc.invalidateQueries({ queryKey: ['admin-discover-submissions'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
