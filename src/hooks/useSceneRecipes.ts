import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
      toast.success('Draft scene created');
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
    mutationFn: async ({ sceneRecipeId, injectTokens = false }: { sceneRecipeId: string; injectTokens?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('generate-scene-prompts', {
        body: { scene_recipe_id: sceneRecipeId, inject_tokens: injectTokens },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-outputs'] });
      queryClient.invalidateQueries({ queryKey: ['scene-recipes'] });
      toast.success('Prompts generated — scene moved to Ready');
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

export function usePublishScene() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const publishToProductImages = useMutation({
    mutationFn: async ({ recipe, promptOutput }: { recipe: any; promptOutput: any }) => {
      const sceneId = `trend-${recipe.id.slice(0, 8)}`;
      const { error } = await supabase
        .from('product_image_scenes')
        .insert({
          scene_id: sceneId,
          title: recipe.name,
          description: recipe.short_description || '',
          prompt_template: promptOutput?.master_scene_prompt || '',
          scene_type: recipe.scene_type || 'lifestyle',
          preview_image_url: recipe.preview_image_url,
          is_active: true,
          sort_order: 999,
        });
      if (error) throw error;

      // Mark recipe as published
      await supabase
        .from('scene_recipes' as any)
        .update({ status: 'published' })
        .eq('id', recipe.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scene-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['product-image-scenes'] });
      toast.success('Added to Product Images scenes');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const publishToFreestyle = useMutation({
    mutationFn: async ({ recipe, promptOutput }: { recipe: any; promptOutput: any }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('custom_scenes' as any)
        .insert({
          name: recipe.name,
          description: recipe.short_description || '',
          category: recipe.category || 'lifestyle',
          image_url: recipe.preview_image_url || '',
          prompt_hint: promptOutput?.master_scene_prompt || '',
          prompt_only: true,
          created_by: user.id,
        });
      if (error) throw error;

      // Mark recipe as published
      await supabase
        .from('scene_recipes' as any)
        .update({ status: 'published' })
        .eq('id', recipe.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scene-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['custom-scenes'] });
      toast.success('Added to Freestyle scenes');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { publishToProductImages, publishToFreestyle };
}
