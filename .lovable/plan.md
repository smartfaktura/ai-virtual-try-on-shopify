
## Fix Upscale Feature: Function, UI, and State Management

### Issues Found

1. **Generation images never marked as upscaled in database** -- The edge function only updates `freestyle_generations` records. For generation images, no DB update happens, so:
   - The image URL in `generation_jobs.results` array never changes
   - The `quality` field is never set to `"upscaled"`
   - On page reload, the original image shows again
   - The "Enhance to PRO HD" button always reappears

2. **Item ID mismatch** -- Library items for generation jobs use composite IDs like `73ae96a7-...-0` (job ID + result index). The edge function receives this but can't match it to any DB row. Need to parse the real job ID and result index.

3. **Button styling** -- Orange/amber gradient doesn't feel premium. Needs to match download button size (h-12) and use a different color scheme.

4. **No loading feedback** -- Just shows "Enhancing..." with a spinner. Should show rotating VOVV.AI team messages.

5. **No separator** -- Buttons section needs visual separation.

---

### Changes

#### 1. Fix Edge Function (`supabase/functions/upscale-image/index.ts`)

- Parse composite `sourceId` for generation type: split `"jobId-index"` to get the actual job UUID and result index
- After uploading the upscaled image, update `generation_jobs`:
  - Replace the specific URL in the `results` JSONB array
  - Set `quality` to `"upscaled"`
- Keep the existing freestyle update logic

#### 2. Redesign Button and Add Loading Messages (`src/components/app/LibraryDetailModal.tsx`)

**Button redesign:**
- Change from amber/orange gradient to a violet/indigo gradient (`from-violet-500 to-indigo-600`) -- premium feel, distinct from the dark download button
- Same height as download button (`h-12` instead of `h-14`)
- Remove the "AI-powered upscale" subtitle -- keep it clean with just "Enhance to PRO HD" and "4 CR" badge
- Add a separator line between the Download button and secondary actions

**Loading messages:**
- Add rotating status messages during enhancement: "VOVV.AI team is enhancing...", "Adding extra detail...", "Almost there...", etc.
- Cycle every 4 seconds while `upscaling` is true

**Already upscaled handling:**
- The `isUpscaled` check already works (`item.quality === 'upscaled' || !!upscaledUrl`), but generation items never get `quality: 'upscaled'` -- the edge function fix above resolves this

---

### Technical Details

**Edge function sourceId parsing:**
```text
// sourceId for generation: "73ae96a7-d484-4290-ba50-e92290375ad8-0"
// Need to extract: jobId = "73ae96a7-d484-4290-ba50-e92290375ad8", index = 0
// Split on last hyphen to get UUID and index
```

**Generation jobs DB update:**
```text
// Fetch current results array
// Replace results[index] with the new upscaled URL
// Update quality to "upscaled"
```

### Files to Edit

| File | Change |
|------|--------|
| `supabase/functions/upscale-image/index.ts` | Parse composite sourceId, update generation_jobs results array and quality |
| `src/components/app/LibraryDetailModal.tsx` | Violet button, same h-12 size, separator, rotating loading messages, remove subtitle |
