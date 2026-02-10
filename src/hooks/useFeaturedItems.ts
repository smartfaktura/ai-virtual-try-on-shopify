import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FeaturedItem {
  id: string;
  item_type: string;
  item_id: string;
  featured_by: string;
  sort_order: number;
  created_at: string;
}

export function useFeaturedItems() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['featured-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_items' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as FeaturedItem[]) ?? [];
    },
    enabled: !!user,
  });

  const featuredMap = new Map<string, FeaturedItem>();
  for (const fi of query.data ?? []) {
    featuredMap.set(`${fi.item_type}:${fi.item_id}`, fi);
  }

  const isFeatured = (itemType: string, itemId: string) => featuredMap.has(`${itemType}:${itemId}`);

  return { ...query, featuredItems: query.data ?? [], featuredMap, isFeatured };
}

export function useToggleFeatured() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ itemType, itemId, currentlyFeatured }: { itemType: string; itemId: string; currentlyFeatured: boolean }) => {
      if (currentlyFeatured) {
        const { error } = await supabase
          .from('featured_items' as any)
          .delete()
          .eq('item_type', itemType)
          .eq('item_id', itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('featured_items' as any)
          .insert({ item_type: itemType, item_id: itemId, featured_by: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['featured-items'] }),
  });
}
