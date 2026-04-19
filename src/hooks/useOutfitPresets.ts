// ── DB-backed outfit presets (cross-device sync) ──
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { OutfitConfig } from '@/components/app/product-images/types';
import { BUILT_IN_PRESETS } from '@/lib/outfitVocabulary';

export interface UserOutfitPreset {
  id: string;
  name: string;
  config: OutfitConfig;
  category?: string | null;
  gender?: string | null;
  isBuiltIn?: boolean;
  createdAt?: string;
}

const builtInAsPresets: UserOutfitPreset[] = BUILT_IN_PRESETS.map(p => ({
  id: p.id,
  name: p.name,
  config: p.config,
  isBuiltIn: true,
}));

export function useOutfitPresets() {
  const [userPresets, setUserPresets] = useState<UserOutfitPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_outfit_presets')
      .select('id, name, config, category, gender, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setUserPresets(data.map(r => ({
        id: r.id,
        name: r.name,
        config: (r.config || {}) as OutfitConfig,
        category: r.category,
        gender: r.gender,
        createdAt: r.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const savePreset = useCallback(async (name: string, config: OutfitConfig, category?: string, gender?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_outfit_presets')
      .insert({ user_id: user.id, name, config: config as unknown as Record<string, unknown>, category, gender })
      .select()
      .single();
    if (error) return null;
    await refresh();
    return data;
  }, [refresh]);

  const deletePreset = useCallback(async (id: string) => {
    await supabase.from('user_outfit_presets').delete().eq('id', id);
    await refresh();
  }, [refresh]);

  return {
    builtIn: builtInAsPresets,
    userPresets,
    allPresets: [...builtInAsPresets, ...userPresets],
    loading,
    savePreset,
    deletePreset,
    refresh,
  };
}
