

## Fix Upscale: Create New Entry, Fix Quality Badge, Fix Image Quality

### Problems
1. **Upscale replaces original** — worker overwrites the source record's `image_url` instead of creating a new DB entry
2. **Image quality is worse** — AI image generation model outputs a lower-quality re-creation (490KB) vs original (1.2MB). The model is being asked to "reproduce" the image, but it generates a new one at lower fidelity
3. **Badge shows "PRO HD"** — should show "2K" or "4K" based on actual resolution
4. **Enhance button disappears** after upscaling — since the original is overwritten with `quality: 'upscaled'`, the button hides

### Changes

**1. `supabase/functions/upscale-worker/index.ts` — Create new record instead of replacing**
- For freestyle sources: INSERT a new row in `freestyle_generations` (copying prompt, aspect_ratio, model_id, scene_id, product_id from the original) with the upscaled `image_url` and `quality` set to `'upscaled_2k'` or `'upscaled_4k'`
- For generation sources: INSERT a new `freestyle_generations` row (treating the upscaled version as a standalone library item) rather than mutating the `results[]` array
- Do NOT update the original record — it stays untouched
- Store resolution in quality field: `'upscaled_2k'` or `'upscaled_4k'` instead of generic `'upscaled'`

**2. `src/components/app/LibraryDetailModal.tsx` — Fix badge and button logic**
- Replace `PRO HD` badge text with actual resolution: check `item.quality` for `'upscaled_2k'` → show "2K", `'upscaled_4k'` → show "4K"
- Keep the Enhance button visible for all items (remove the `!isUpscaled` guard) — users should be able to upscale any image, even re-upscale to a different resolution
- Add a helper: `const upscaleLabel = item.quality === 'upscaled_4k' ? '4K' : item.quality === 'upscaled_2k' ? '2K' : null`

**3. `src/components/app/LibraryImageCard.tsx` — Show resolution badge on cards**
- If `item.quality` starts with `'upscaled_'`, show a small "2K" or "4K" badge in the top-right corner of the card

**4. `src/pages/Jobs.tsx` — Update upscale filter logic**
- Change `i.quality !== 'upscaled'` checks to `!i.quality?.startsWith('upscaled_')` for the batch selection filter

**5. `src/hooks/useLibraryItems.ts` — No changes needed**
- The new inserted rows will automatically appear in the library query since it fetches all freestyle_generations

### Image Quality Note
The fundamental issue is that Gemini 3 Pro Image is a generative model — it creates a *new* image inspired by the input, not a true pixel-level upscale. The output is often lower resolution/quality than the input. This is an inherent limitation. For now, the approach creates a separate entry so the original is preserved. A proper fix would require a dedicated super-resolution model, but that's outside the current scope.

