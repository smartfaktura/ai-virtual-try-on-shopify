

# Fix: Selfie/UGC Workflow Credit Calculation

## Problem
The Selfie/UGC workflow sets `generationMode = 'virtual-try-on'` (because `uses_tryon` is true), so the credit calculation at line 1995 takes the virtual-try-on branch:

```
parseInt(imageCount) * 6 * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount
```

But `tryOnSceneCount = Math.max(1, selectedPoses.size)` — Selfie/UGC doesn't use `selectedPoses` (the try-on scene picker). It uses `selectedVariationIndices` from the workflow variation system. So `selectedPoses.size` is likely 0 or stale, making the scene count wrong.

The correct branch for Selfie/UGC is the `hasWorkflowConfig` one: `workflowImageCount * workflowCostPerImage`, which properly accounts for `selectedVariationIndices × models × ratios × framings`.

## Fix

**File**: `src/pages/Generate.tsx`, line 1995

Add `&& !isSelfieUgc && !isMirrorSelfie` to the virtual-try-on condition so these workflows fall through to the `hasWorkflowConfig` branch:

```typescript
const singleProductCreditCost = isUpscale ? 0 : (
  generationMode === 'virtual-try-on' && !isSelfieUgc && !isMirrorSelfie
    ? parseInt(imageCount) * 6 * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount
    : (hasWorkflowConfig
      ? workflowImageCount * workflowCostPerImage
      : parseInt(imageCount) * 6 * tryOnSceneCount)
);
```

This ensures Selfie/UGC uses `workflowImageCount` (which already includes `selectedVariationIndices.size × workflowModelCount × aspectRatioCount × framingCount`) multiplied by 6 credits, matching the actual generation matrix.

## Files Modified
- `src/pages/Generate.tsx` — 1 line edit

