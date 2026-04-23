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
  preview_image_url: string | null;
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
    previewUrl: scene.preview_image_url || scene.image_url,
    optimizedImageUrl: scene.optimized_image_url || undefined,
    created_at: scene.created_at,
    promptOnly: scene.prompt_only || false,
  };
}

export function useCustomScenes(opts?: { enabled?: boolean }) {
  const { user } = useAuth();
  const enabled = opts?.enabled ?? true;

  const query = useQuery({
    queryKey: ['custom-scenes'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_custom_scenes');
      if (error) throw error;
      return (data as unknown as CustomScene[]) ?? [];
    },
    enabled: enabled && !!user,
  });

  const scenes = query.data ?? [];
  const asPoses = useMemo(() => scenes.map(toTryOnPose), [scenes]);

  return { ...query, scenes, asPoses };
}

export function useAddCustomScene() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (scene: { name: string; description: string; category: string; image_url: string; prompt_hint?: string; prompt_only?: boolean; discover_categories?: string[] }) => {
      const optimized = buildOptimizedUrl(scene.image_url);
      const { data, error } = await supabase
        .from('custom_scenes' as any)
        .insert({ ...scene, created_by: user!.id, optimized_image_url: optimized, prompt_hint: scene.prompt_hint || '', prompt_only: scene.prompt_only || false, discover_categories: scene.discover_categories || [] })
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

export function useUpdateCustomScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; prompt_hint?: string; prompt_only?: boolean; name?: string; category?: string; discover_categories?: string[]; preview_image_url?: string | null }) => {
      const { id, ...updates } = params;
      const { error } = await supabase.from('custom_scenes' as any).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-scenes'] }),
  });
}
