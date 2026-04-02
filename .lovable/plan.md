

# Fix Shot Label Badges on Completed View + Improve Model Face Detail

## Issue 1: No shot labels on completed images

The badge code was only added to the **in-progress** gallery (line 519-542). The **completed results** view (line 391-404) still iterates `batchState.aggregatedImages` directly without mapping images to their parent jobs.

**Fix**: Replace the completed results grid (lines 391-406) with the same `imageJobMap` pattern used in the in-progress view, adding the shot label badge to each thumbnail.

### File: `src/pages/CatalogGenerate.tsx` (lines 391-406)
Replace the simple `aggregatedImages.map` with the job-mapping IIFE that builds `imageJobMap` from `batchState.jobs`, and render the shot label badge overlay on each image — identical to the in-progress view.

## Issue 2: Model face losing detail across shots

Seedream receives the model reference image as one of multiple reference URLs, but the prompt's face preservation directive (line 757) is generic. The face gets progressively worse because:
- The prompt says "replicate their face" but doesn't specify photographic detail level
- The `QUALITY_BLOCK` focuses on fabric/product quality, not face/skin quality
- Close-up shots (like `close_up`) lack specific face detail instructions

**Fix**: Strengthen the face preservation directive in `catalogEngine.ts`:
- Add "high-resolution facial detail, sharp facial features, realistic skin texture, detailed eyes" to the model identity directive
- Add "photorealistic face, no blurring, no smoothing, no distortion of facial features" as a separate face quality line

### File: `src/lib/catalogEngine.ts` (line 757)
Expand the CRITICAL model identity block to include explicit face quality requirements: sharp facial features, realistic skin texture, no face smoothing or distortion.

## Summary

| File | Change |
|------|--------|
| `src/pages/CatalogGenerate.tsx` | Add shot label badges to the completed results grid (same pattern as in-progress view) |
| `src/lib/catalogEngine.ts` | Strengthen face preservation prompt with explicit detail/sharpness requirements |

