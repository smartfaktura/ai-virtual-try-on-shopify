import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { poseCategoryLabels } from '@/data/mockData';

export interface SceneCategory {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  created_by: string;
  created_at: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function useSceneCategories() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['scene-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scene_categories' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as unknown as SceneCategory[]) ?? [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const customCategories = query.data ?? [];

  // Merge built-in + custom into a single label map
  const allCategoryLabels: Record<string, string> = { ...poseCategoryLabels };
  customCategories.forEach(c => {
    allCategoryLabels[c.slug] = c.label;
  });

  // All category slugs in order: built-in first, then custom
  const allCategorySlugs: string[] = [
    ...Object.keys(poseCategoryLabels),
    ...customCategories
      .filter(c => !(c.slug in poseCategoryLabels))
      .map(c => c.slug),
  ];

  return {
    ...query,
    customCategories,
    allCategoryLabels,
    allCategorySlugs,
  };
}

export function useAddSceneCategory() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (name: string) => {
      const slug = slugify(name);
      if (!slug) throw new Error('Invalid category name');
      const { data, error } = await supabase
        .from('scene_categories' as any)
        .insert({ slug, label: name.trim(), created_by: user!.id, sort_order: 999 })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as SceneCategory;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scene-categories'] }),
  });
}

export function useDeleteSceneCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scene_categories' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scene-categories'] }),
  });
}

export { slugify };
