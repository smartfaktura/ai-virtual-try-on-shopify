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
  created_by: string;
  is_active: boolean;
  created_at: string;
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
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as CustomModel[]) ?? [];
    },
    enabled: !!user,
  });

  const asProfiles = (query.data ?? []).map(toModelProfile);

  return { ...query, models: query.data ?? [], asProfiles };
}

export function useAddCustomModel() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (model: { name: string; gender: string; body_type: string; ethnicity: string; age_range: string; image_url: string }) => {
      const { data, error } = await supabase
        .from('custom_models' as any)
        .insert({ ...model, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CustomModel;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-models'] }),
  });
}

export function useDeleteCustomModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_models' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-models'] }),
  });
}
