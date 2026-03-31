import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PreviewState {
  [cacheKey: string]: { url: string | null; loading: boolean; error?: string };
}

export function useCatalogPreviews() {
  const [previews, setPreviews] = useState<PreviewState>({});

  const generatePreview = useCallback(async (description: string, cacheKey: string, type: 'pose' | 'background' = 'pose') => {
    // Already loading or loaded
    if (previews[cacheKey]?.url || previews[cacheKey]?.loading) return;

    setPreviews(prev => ({ ...prev, [cacheKey]: { url: null, loading: true } }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-catalog-preview', {
        body: { description, cacheKey, type },
      });

      if (error) throw error;

      setPreviews(prev => ({ ...prev, [cacheKey]: { url: data.url, loading: false } }));
    } catch (e) {
      console.error('Preview generation failed:', e);
      setPreviews(prev => ({
        ...prev,
        [cacheKey]: { url: null, loading: false, error: 'Failed' },
      }));
    }
  }, [previews]);

  const getPreview = useCallback((cacheKey: string) => previews[cacheKey], [previews]);

  return { generatePreview, getPreview, previews };
}
