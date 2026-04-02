import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ModelProfile } from '@/types';

export interface UserModel {
  id: string;
  user_id: string;
  name: string;
  gender: string;
  body_type: string;
  ethnicity: string;
  age_range: string;
  image_url: string;
  source_image_url: string;
  credits_used: number;
  created_at: string;
  is_active: boolean;
}

function toModelProfile(m: UserModel): ModelProfile {
  return {
    modelId: `user-${m.id}`,
    name: m.name,
    gender: (m.gender || 'female') as any,
    bodyType: (m.body_type || 'average') as any,
    ethnicity: m.ethnicity,
    ageRange: (m.age_range || 'adult') as any,
    previewUrl: m.image_url,
    sourceImageUrl: m.source_image_url || m.image_url,
  };
}

export function useUserModels() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['user-models', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_models' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as UserModel[]) ?? [];
    },
    enabled: !!user,
  });

  const models = query.data ?? [];
  const asProfiles = useMemo(() => models.map(toModelProfile), [models]);

  return { ...query, models, asProfiles };
}

export function useGenerateUserModel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const { data, error } = await supabase.functions.invoke('generate-user-model', {
        body: { imageUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { model: UserModel; new_balance: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-models'] });
    },
  });
}

export function useGenerateUserModelFromDescription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (description: Record<string, any>) => {
      const { data, error } = await supabase.functions.invoke('generate-user-model', {
        body: { mode: 'generator', description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { model: UserModel; new_balance: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-models'] });
    },
  });
}

export function useDeleteUserModel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_models' as any)
        .update({ is_active: false } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-models'] });
    },
  });
}
