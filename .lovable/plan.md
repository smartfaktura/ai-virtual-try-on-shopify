

## Make UGC Scenes 9:16 Story Format + Regenerate Previews

### 1. Change Scene Card Aspect Ratio (UI)

**File: `src/pages/Generate.tsx`**

Two changes:

- **Line 1718 (grid layout)**: Add `isSelfieUgc` to the mirror selfie grid condition so UGC scenes use the same taller, narrower column layout (`grid-cols-3 sm:grid-cols-4 lg:grid-cols-5` instead of `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`)

- **Line 1750 (card aspect ratio)**: Change the aspect ratio condition from `isMirrorSelfie ? "aspect-[9/16]" : "aspect-square"` to `(isMirrorSelfie || isSelfieUgc) ? "aspect-[9/16]" : "aspect-square"` so UGC scene previews render as tall story-format cards

### 2. Regenerate All 16 UGC Scene Preview Images

After deploying the UI change, I will call the `generate-scene-previews` edge function with `force_regenerate: true` for the Selfie / UGC Set workflow (`3b54d43a-a03a-49a6-a64e-bf2dd999abc8`) in batches to generate fresh 9:16 preview images for all 16 scenes.

The prompts already specify "9:16 vertical" in the edge function, so the generated images will naturally fit the new taller card format.

### Summary
- 2 line changes in `Generate.tsx`
- Trigger regeneration of all 16 scene previews via edge function calls
