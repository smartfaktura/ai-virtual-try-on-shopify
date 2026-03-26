

# Fix Seedream 4:5 Stretch — Crop to Requested Ratio

## Problem
When a user selects **4:5**, Seedream generates at **3:4** (the closest supported ratio). The image is stored as-is and displayed in a 4:5 container, causing visible stretching.

## Solution
After downloading a Seedream-generated image, detect if the requested ratio differs from the Seedream ratio (e.g. 4:5 → 3:4). If so, **center-crop** the image to the exact requested dimensions before uploading to storage.

## Implementation

### File: `supabase/functions/generate-freestyle/index.ts`

1. **Track when Seedream maps to a different ratio** — add a `seedreamMappedRatio` field to `ProviderResult` so downstream code knows the actual generated ratio differs from the requested one.

2. **Add a crop helper function** — using canvas-free approach in Deno:
   - Fetch the Seedream image bytes
   - Decode dimensions from the PNG/JPEG header
   - Calculate the crop rect to go from 3:4 → 4:5 (trim equal strips from top and bottom)
   - Use sharp-compatible Deno image processing or a simple pixel-buffer crop
   
   **Simpler alternative (recommended)**: Since Deno edge functions don't have native image manipulation, the most reliable approach is to **re-encode via the Lovable AI gateway** — send the Seedream output to Gemini with a simple "Output this exact image at 4:5 aspect ratio" instruction. However, this adds cost and latency.

   **Simplest fix**: Instead of server-side cropping, store the **actual generated ratio** alongside the image URL and let the frontend apply CSS `object-fit: cover` with the correct container ratio. This avoids any server-side image processing.

3. **Recommended approach — store actual ratio metadata**:
   - In the `ProviderResult`, include `actualAspectRatio` when Seedream maps to a different ratio
   - When saving to `freestyle_generations`, store the actual ratio used
   - The frontend already uses `object-cover` for display, so the image won't stretch — it'll crop visually in the browser

### Changes needed:

**`supabase/functions/generate-freestyle/index.ts`**:
- Modify `seedreamAspectRatio()` to also return whether a mapping occurred
- After Seedream success, attach `actualAspectRatio` to the result
- When saving to `freestyle_generations`, store the actual Seedream ratio in the `ratio` column instead of the user-requested ratio (so the image displays at its true proportions)

**`src/components/app/freestyle/FreestyleGallery.tsx`** (if needed):
- Ensure images use `object-cover` (already the case per memory context) — no change expected

### Scope
- 1 backend file: `supabase/functions/generate-freestyle/index.ts`
- Possibly 1 frontend file if gallery ratio handling needs adjustment
- No database changes

