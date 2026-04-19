// ── DB-backed outfit presets (cross-device sync) + curated category-aware built-ins ──
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { OutfitConfig } from '@/components/app/product-images/types';
import { BUILT_IN_PRESETS, filterPresetsByCategories, pickDefaultPreset } from '@/lib/outfitVocabulary';

export interface UserOutfitPreset {
  id: string;
  name: string;
  config: OutfitConfig;
  category?: string | null;
  gender?: string | null;
  isBuiltIn?: boolean;
  recommended?: boolean;
  createdAt?: string;
}

const toUserPreset = (p: typeof BUILT_IN_PRESETS[number]): UserOutfitPreset => ({
  id: p.id,
  name: p.name,
  config: p.config,
  category: p.category[0] || null,
  isBuiltIn: true,
  recommended: p.recommended,
});

export function useOutfitPresets(categoryFilter?: string[]) {
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

  // Filter built-ins by union of selected product categories. Universal fallbacks always appended.
  const builtIn = useMemo(() => {
    const filtered = filterPresetsByCategories(categoryFilter);
    return filtered.map(toUserPreset);
  }, [categoryFilter]);

  const savePreset = useCallback(async (name: string, config: OutfitConfig, category?: string, gender?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_outfit_presets')
      .insert([{ user_id: user.id, name, config: config as unknown as import('@/integrations/supabase/types').Json, category, gender }])
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

  // Pick a sensible default preset for the current categories (recommended + neutral palette).
  const pickDefault = useCallback((categories?: string[]): UserOutfitPreset | null => {
    const p = pickDefaultPreset(categories ?? categoryFilter);
    return p ? toUserPreset(p) : null;
  }, [categoryFilter]);

  return {
    builtIn,
    userPresets,
    allPresets: [...builtIn, ...userPresets],
    loading,
    savePreset,
    deletePreset,
    refresh,
    pickDefault,
  };
}
