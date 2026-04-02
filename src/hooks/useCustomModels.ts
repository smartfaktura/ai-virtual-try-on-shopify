import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ModelProfile } from '@/types';

export interface CustomModel {
  id: string;
  name: string;
  gender: string;
  body_type: string;
  ethnicity: string;
  age_range: string;
  image_url: string;
  optimized_image_url: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  sort_order: number;
}

function buildOptimizedUrl(url: string): string | null {
  const STORAGE_MARKER = '/storage/v1/object/';
  const RENDER_MARKER = '/storage/v1/render/image/';
  if (!url || !url.includes(STORAGE_MARKER) || url.includes(RENDER_MARKER)) return null;
  const transformed = url.replace(STORAGE_MARKER, RENDER_MARKER);
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}width=1536&quality=80`;
}

function toModelProfile(m: CustomModel): ModelProfile {
  return {
    modelId: `custom-${m.id}`,
    name: m.name,
    gender: (m.gender || 'female') as any,
    bodyType: (m.body_type || 'average') as any,
    ethnicity: m.ethnicity,
    ageRange: (m.age_range || 'adult') as any,
    previewUrl: m.image_url,
    optimizedImageUrl: m.optimized_image_url || undefined,
    sourceImageUrl: m.image_url,
  };
}

export function useCustomModels() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['custom-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_models' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as CustomModel[]) ?? [];
    },
    enabled: !!user,
  });

  const models = query.data ?? [];
  const asProfiles = useMemo(() => models.map(toModelProfile), [models]);

  return { ...query, models, asProfiles };
}

/** Fetch ALL models (including inactive) for admin management */
export function useAllCustomModels() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['custom-models-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_models' as any)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as CustomModel[]) ?? [];
    },
    enabled: !!user,
  });

  return { ...query, models: query.data ?? [] };
}

export function useAddCustomModel() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (model: { name: string; gender: string; body_type: string; ethnicity: string; age_range: string; image_url: string }) => {
      const optimized = buildOptimizedUrl(model.image_url);
      const { data, error } = await supabase
        .from('custom_models' as any)
        .insert({ ...model, created_by: user!.id, optimized_image_url: optimized })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CustomModel;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-models'] });
      qc.invalidateQueries({ queryKey: ['custom-models-all'] });
    },
  });
}

export function useUpdateCustomModel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<CustomModel> & { id: string }) => {
      const { error } = await supabase
        .from('custom_models' as any)
        .update(fields as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-models'] });
      qc.invalidateQueries({ queryKey: ['custom-models-all'] });
    },
  });
}

export function useSaveModelSortOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entries: { id: string; sort_order: number }[]) => {
      for (const entry of entries) {
        const { error } = await supabase
          .from('custom_models' as any)
          .update({ sort_order: entry.sort_order } as any)
          .eq('id', entry.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-models'] });
      qc.invalidateQueries({ queryKey: ['custom-models-all'] });
    },
  });
}

export function useDeleteCustomModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_models' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-models'] });
      qc.invalidateQueries({ queryKey: ['custom-models-all'] });
    },
  });
}
