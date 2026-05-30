import { supabase } from '@/integrations/supabase/client';

export interface PreAnalyzedItem {
  file: File;
  previewUrl: string;
  title: string;
  suggestedCategory: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('Read failed'));
    r.readAsDataURL(file);
  });
}

async function analyzeOne(file: File): Promise<{ title: string; category: string } | null> {
  try {
    const base64 = await fileToBase64(file);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-product-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ imageUrl: base64 }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data?.kind === 'not_product') return null;
    return {
      title: data.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      category: data.userCategory || data.category || '',
    };
  } catch {
    return null;
  }
}

/**
 * Analyzes uploaded files in parallel. Calls onProgress(id, result) as each
 * file finishes so the caller can update an on-grid placeholder card.
 * Returns the final array in the same order as input.
 */
export async function analyzeUploadedFiles(
  files: File[],
  onProgress?: (index: number, result: PreAnalyzedItem) => void,
  concurrency = 3,
): Promise<PreAnalyzedItem[]> {
  const items: PreAnalyzedItem[] = files.map(f => ({
    file: f,
    previewUrl: URL.createObjectURL(f),
    title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    suggestedCategory: '',
  }));

  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      const result = await analyzeOne(items[idx].file);
      if (result) {
        items[idx] = {
          ...items[idx],
          title: result.title || items[idx].title,
          suggestedCategory: result.category,
        };
      }
      onProgress?.(idx, items[idx]);
    }
  });
  await Promise.all(runners);
  return items;
}
