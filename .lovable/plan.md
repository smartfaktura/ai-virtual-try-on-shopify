
# Fix: IMAGE_LABEL_MAP scope error crashing jacket generations

## Problem
The latest generation failed with `IMAGE_LABEL_MAP is not defined`. This happened because the code I added (and the existing single-reference code) tries to write to `IMAGE_LABEL_MAP` from the variation loop, but `IMAGE_LABEL_MAP` is defined *inside* the `generateImage` function — it's not in scope at the call site.

The old single-reference code had the same latent bug but only triggered when `customLabel` was truthy (which rarely happened). The new multi-reference code triggers it on every call.

## Fix

**In `supabase/functions/generate-workflow/index.ts`:**

1. Stop writing to `IMAGE_LABEL_MAP` from outside `generateImage`. Instead, pass `promptLabel` as a property on each reference image object.

2. Inside `generateImage` (~line 778), check for `img.promptLabel` first before falling back to `IMAGE_LABEL_MAP`:
   ```
   const labelText = img.promptLabel 
     ? `[PRODUCT EXTRA ANGLE] ${img.promptLabel}`
     : IMAGE_LABEL_MAP[img.label] || `[${img.label.toUpperCase()}] Reference image:`;
   ```

3. Remove the `IMAGE_LABEL_MAP` writes from both the multi-reference block and the single-reference block (lines ~1321 and ~1331).

This also fixes the pre-existing bug for single extra references with custom labels (e.g. atomizer, interior detail triggers for bags/fragrances).

**Files changed:** `supabase/functions/generate-workflow/index.ts` only, then redeploy.
