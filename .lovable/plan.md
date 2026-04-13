

# Add Image Variations (1–4) to Freestyle Generation

## What
Add a "variations" selector (1–4 images) to the Freestyle prompt panel. When a user picks e.g. 3 variations, the system generates 3 images in one job, charging credits accordingly.

## Areas That Need Changes

### 1. `src/pages/Freestyle.tsx` — State & Logic
- Add `variationCount` state (default 1, max 4)
- Update `creditCost` calculation: multiply per-image cost by `variationCount`
- Update `hasEnoughCredits` check to use total cost
- Update `queuePayload.imageCount` from hardcoded `1` to `variationCount`
- Update `enqueue()` call: pass `imageCount: variationCount`
- Pass `variationCount` and `onVariationCountChange` to `FreestylePromptPanel`

### 2. `src/components/app/freestyle/FreestylePromptPanel.tsx` — UI
- Accept new props: `variationCount`, `onVariationCountChange`
- Add a compact variation picker (1–4 buttons) next to the Generate button in the bottom bar
- Update credit cost display to show `creditCost` (which is already the total) and tooltip to say e.g. "6 × 3 = 18 credits"

### 3. `supabase/functions/enqueue-generation/index.ts` — Credit Calculation (Already Correct)
- The `calculateCreditCost` function already multiplies `perImage × imageCount` — no change needed here
- The edge function already accepts `imageCount` up to 4 via `Math.min(body.imageCount || 1, 4)` — no change needed

### 4. `supabase/functions/generate-freestyle/index.ts` — Already Supports Multiple Images
- Already loops `for (let i = 0; i < effectiveImageCount; i++)` and handles batch consistency text — no change needed

### 5. No Database Changes Required

## Summary
The backend already fully supports 1–4 images per freestyle job. The only changes are in the **frontend**: adding state for variation count, a UI picker, and updating the credit cost display to reflect the total.

