import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TryOnPose, PoseCategory } from '@/types';

export interface CustomScene {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  optimized_image_url: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  prompt_hint: string;
  prompt_only: boolean;
}

function buildOptimizedUrl(url: string): string | null {
  const STORAGE_MARKER = '/storage/v1/object/';
  const RENDER_MARKER = '/storage/v1/render/image/';
  if (!url || !url.includes(STORAGE_MARKER) || url.includes(RENDER_MARKER)) return null;
  const transformed = url.replace(STORAGE_MARKER, RENDER_MARKER);
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}width=1536&quality=80`;
}

function toTryOnPose(scene: CustomScene): TryOnPose {
  return {
    poseId: `custom-${scene.id}`,
    name: scene.name,
    category: scene.category as PoseCategory,
    description: scene.description,
    promptHint: scene.prompt_hint || scene.description,
    previewUrl: scene.image_url,
    optimizedImageUrl: scene.optimized_image_url || undefined,
    created_at: scene.created_at,
    promptOnly: scene.prompt_only || false,
  };
}

export function useCustomScenes() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['custom-scenes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_scenes' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as CustomScene[]) ?? [];
    },
    enabled: !!user,
  });

  const scenes = query.data ?? [];
  const asPoses = useMemo(() => scenes.map(toTryOnPose), [scenes]);

  return { ...query, scenes, asPoses };
}

export function useAddCustomScene() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (scene: { name: string; description: string; category: string; image_url: string; prompt_hint?: string; prompt_only?: boolean }) => {
      const optimized = buildOptimizedUrl(scene.image_url);
      const { data, error } = await supabase
        .from('custom_scenes' as any)
        .insert({ ...scene, created_by: user!.id, optimized_image_url: optimized, prompt_hint: scene.prompt_hint || '', prompt_only: scene.prompt_only || false })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CustomScene;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-scenes'] }),
  });
}

export function useDeleteCustomScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_scenes' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-scenes'] }),
  });
}
