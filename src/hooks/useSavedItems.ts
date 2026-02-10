import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface SavedItem {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  created_at: string;
}

export function useSavedItems() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-discover-items', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('saved_discover_items' as any)
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data ?? []) as unknown as SavedItem[];
    },
    enabled: !!userId,
  });

  const isSaved = (itemType: string, itemId: string) =>
    savedItems.some((s) => s.item_type === itemType && s.item_id === itemId);

  const toggleSave = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      const existing = savedItems.find((s) => s.item_type === itemType && s.item_id === itemId);
      if (existing) {
        const { error } = await supabase
          .from('saved_discover_items' as any)
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_discover_items' as any)
          .insert({ user_id: userId, item_type: itemType, item_id: itemId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-discover-items'] });
    },
  });

  return { savedItems, isSaved, toggleSave, userId };
}
