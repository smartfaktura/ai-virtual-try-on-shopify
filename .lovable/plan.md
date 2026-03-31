

## Fix Seedream Stretch + Scene Reference Issues

### Problem 1: Stretched Images
Seedream doesn't support `4:5` or `5:4` ratios, so they get mapped to `3:4` / `4:3`. The `actualAspectRatio` is stored in the DB, but the frontend card rendering may still use the originally-requested ratio for the CSS `aspect-ratio`, causing visible stretching.

### Problem 2: Scene References Ignored
Seedream's image API (`/api/v3/images/generations`) receives images as a flat `body.image` array with no role distinction. Unlike Gemini, which gets interleaved `[SCENE REFERENCE]` labels, Seedream has no way to know which image is a scene vs. a product vs. a model. The text-based `IMAGE ROLES` directive appended to the prompt is a best-effort workaround but Seedream fundamentally treats all input images the same — as generic style references.

### Proposed Fix

**1. Stretch fix — Frontend aspect ratio resolution** (`src/components/app/LibraryImageCard.tsx`, `src/components/app/RecentCreationsGallery.tsx`)
- When rendering image cards, check for `actualAspectRatio` on the item and use it instead of the requested ratio for CSS `aspect-ratio` styling
- This ensures the card matches what Seedream actually generated (3:4) instead of what was requested (4:5)

**2. Stretch fix — Seedream ratio mapping** (`supabase/functions/generate-freestyle/index.ts`, `supabase/functions/generate-workflow/index.ts`)
- Add native `4:5` and `5:4` to the Seedream ratio map — Seedream 4.5 may now support these. If not, the API will error and the fallback chain handles it gracefully
- This eliminates the root cause of the mismatch

**3. Scene reference improvement** (`supabase/functions/generate-freestyle/index.ts`)
- Enhance `convertContentToSeedreamInput` to embed scene context more explicitly in the prompt text itself (e.g., "Set the scene in an environment matching this reference: [detailed scene description]") rather than relying on the image role system
- Consider using the `describe-image` function to convert the scene image to a textual description before passing to Seedream, giving it concrete environment details it can act on

### Files to Change
- `supabase/functions/generate-freestyle/index.ts` — Update Seedream ratio map + enhance scene prompt handling
- `supabase/functions/generate-workflow/index.ts` — Update Seedream ratio map
- `src/components/app/LibraryImageCard.tsx` — Use `actualAspectRatio` for rendering
- `src/components/app/RecentCreationsGallery.tsx` — Same aspect ratio fix

