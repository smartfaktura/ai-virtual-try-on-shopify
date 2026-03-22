

# Fix Incorrect Image Count in Generation Subtitle

## Problem

When generating with a `uses_tryon` workflow (like "Virtual Try-On Set"), the subtitle says "Generating 4 images" but only 1 image is actually being generated. This happens because the subtitle logic on line 3914 hits the `hasWorkflowConfig` branch and shows `selectedVariationIndices.size` (which is 4 — set when the workflow's variation config initialized). But for try-on workflows, image count is determined by the model×scene×ratio×framing matrix, not by variation indices.

## Fix

### `src/pages/Generate.tsx` (line 3912-3918)

Add a check for `activeWorkflow?.uses_tryon` **before** the `hasWorkflowConfig` branch in the subtitle logic. For try-on workflows, compute the actual image count as `tryOnModelCount * tryOnSceneCount * aspectRatioCount * framingCount * multiProductCount`, and show a try-on-specific subtitle like:

```
"Dressing Charlotte in "Racer Knitted Crop Top""
```

This reuses the existing try-on subtitle format from line 3915 but ensures it fires for all try-on workflows (including ones with `hasWorkflowConfig`).

**Before:** `hasWorkflowConfig` check catches try-on workflows and shows variation count (4)
**After:** `uses_tryon` check fires first and shows the correct model×scene count (1)

One line change in the conditional chain.

