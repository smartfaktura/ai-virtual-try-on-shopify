import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSceneRecipes() {
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['scene-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scene_recipes' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const createRecipe = useMutation({
    mutationFn: async (recipe: any) => {
      const { data, error } = await supabase
        .from('scene_recipes' as any)
        .insert(recipe)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scene-recipes'] });
      toast.success('Scene recipe created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from('scene_recipes' as any)
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scene-recipes'] });
      toast.success('Scene recipe updated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const duplicateRecipe = useMutation({
    mutationFn: async (recipeId: string) => {
      const original = recipes.find((r: any) => r.id === recipeId);
      if (!original) throw new Error('Recipe not found');
      const { id, created_at, updated_at, ...rest } = original;
      const { data, error } = await supabase
        .from('scene_recipes' as any)
        .insert({ ...rest, name: `${rest.name} (copy)`, status: 'draft' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scene-recipes'] });
      toast.success('Scene duplicated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const generatePrompts = useMutation({
    mutationFn: async (sceneRecipeId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-scene-prompts', {
        body: { scene_recipe_id: sceneRecipeId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-outputs'] });
      toast.success('Prompts generated');
    },
    onError: (e: any) => toast.error(`Prompt generation failed: ${e.message}`),
  });

  return { recipes, isLoading, createRecipe, updateRecipe, duplicateRecipe, generatePrompts };
}

export function usePromptOutputs(sceneRecipeId?: string) {
  return useQuery({
    queryKey: ['prompt-outputs', sceneRecipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_outputs' as any)
        .select('*')
        .eq('scene_recipe_id', sceneRecipeId!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!sceneRecipeId,
  });
}
