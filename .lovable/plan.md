

## Updated plan: optimize only model & scene images

### What to optimize (1536px, quality 80)
- `modelImage` — AI model reference (pose/body only)
- `sceneImage` — environment/mood reference

### What stays full resolution (untouched)
- `productImage` — product details, text, labels
- `sourceImage` — user's own product photo
- `referenceAngleImage` — user's product from a specific angle (perspective mode)

### Changes

**1. Database migration**
```sql
ALTER TABLE public.custom_models ADD COLUMN optimized_image_url text;
ALTER TABLE public.custom_scenes ADD COLUMN optimized_image_url text;
```

**2. `src/hooks/useCustomModels.ts`**
- Add `optimized_image_url` to interface and `toModelProfile()` output
- In `useAddCustomModel`, compute optimized render URL on save and store it

**3. `src/hooks/useCustomScenes.ts`**
- Same: add field, compute on save

**4. `supabase/functions/generate-freestyle/index.ts`**
- Add `optimizeImageForAI()` helper (1536px, quality 80)
- In `buildContentArray()`: wrap `modelImage` and `sceneImage` only
- `productImage`, `sourceImage`, `referenceAngleImage` — **no optimization**
- Add `max_tokens: 8192` to API request body
- Add fallback: if Pro model returns null, retry once with `gemini-3.1-flash-image-preview`

**5. `supabase/functions/generate-tryon/index.ts`**
- Same helper, wrap only model and scene URLs
- Product stays full-res

### Helper (added to both edge functions)
```typescript
function optimizeImageForAI(url: string): string {
  const STORAGE_MARKER = '/storage/v1/object/';
  const RENDER_MARKER = '/storage/v1/render/image/';
  if (!url || !url.includes(STORAGE_MARKER) || url.includes(RENDER_MARKER)) return url || '';
  const transformed = url.replace(STORAGE_MARKER, RENDER_MARKER);
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}width=1536&quality=80`;
}
```

### Flow for new models/scenes
1. Admin uploads image → stored at full resolution
2. On save, hook computes optimized render URL → saved to `optimized_image_url`
3. Generation hooks prefer `optimized_image_url`, fall back to `image_url`
4. Edge function has runtime `optimizeImageForAI()` as safety net for old records

