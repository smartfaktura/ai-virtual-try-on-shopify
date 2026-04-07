import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWatchAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['watch-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watch_accounts' as any)
        .select('*')
        .order('priority_order', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const addAccount = useMutation({
    mutationFn: async (account: {
      display_name: string;
      username: string;
      category: string;
      source_mode: string;
      profile_image_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('watch_accounts' as any)
        .insert(account)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-accounts'] });
      toast.success('Account added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from('watch_accounts' as any)
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watch-accounts'] }),
    onError: (e: any) => toast.error(e.message),
  });

  const syncAccount = useMutation({
    mutationFn: async ({ id, username }: { id: string; username: string }) => {
      const { data, error } = await supabase.functions.invoke('fetch-instagram-feed', {
        body: { username, account_id: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['watch-posts'] });
      toast.success('Account synced');
    },
    onError: (e: any) => toast.error(`Sync failed: ${e.message}`),
  });

  return { accounts, isLoading, addAccount, updateAccount, syncAccount };
}

export function useWatchPosts(accountId?: string) {
  return useQuery({
    queryKey: ['watch-posts', accountId],
    queryFn: async () => {
      const query = supabase
        .from('watch_posts' as any)
        .select('*')
        .order('posted_at', { ascending: false })
        .limit(12);
      if (accountId) query.eq('watch_account_id', accountId);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!accountId,
  });
}

export function useAllWatchPosts(accountIds: string[]) {
  return useQuery({
    queryKey: ['watch-posts-all', accountIds.sort().join(',')],
    queryFn: async () => {
      if (!accountIds.length) return {};
      const { data, error } = await supabase
        .from('watch_posts' as any)
        .select('*')
        .in('watch_account_id', accountIds)
        .order('posted_at', { ascending: false });
      if (error) throw error;
      const grouped: Record<string, any[]> = {};
      for (const post of (data || []) as any[]) {
        const key = (post as any).watch_account_id;
        if (!grouped[key]) grouped[key] = [];
        if (grouped[key].length < 12) grouped[key].push(post);
      }
      return grouped;
    },
    enabled: accountIds.length > 0,
  });
}
