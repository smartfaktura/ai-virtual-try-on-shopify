

## Bug: Virtual Try-On credit cost inflated when accessed via workflow

### Root Cause

Line 1558 in `Generate.tsx`:
```typescript
const singleProductCreditCost = isUpscale ? 0 
  : (hasWorkflowConfig ? workflowImageCount * 8 : parseInt(imageCount) * 8 * tryOnSceneCount);
```

When you access Virtual Try-On via the workflow route (`/app/generate/virtual-try-on-set`), `activeWorkflow` is set and `hasWorkflowConfig` is `true`. This causes the cost to use `workflowImageCount` (which is `selectedVariationIndices.size * angleMultiplier`) instead of the correct try-on formula (`imageCount * 8 * tryOnSceneCount`).

The workflow likely has 4 variations auto-selected, so: `4 * 1 * 8 = 32` instead of the correct `1 * 8 * 1 = 8`.

### Fix

In `src/pages/Generate.tsx` line 1558, exclude virtual try-on from the workflow cost path:

```typescript
const singleProductCreditCost = isUpscale ? 0 
  : (generationMode === 'virtual-try-on' 
      ? parseInt(imageCount) * 8 * tryOnSceneCount
      : (hasWorkflowConfig ? workflowImageCount * 8 : parseInt(imageCount) * 8 * tryOnSceneCount));
```

This ensures virtual try-on always uses `imageCount × scenes × 8 credits`, regardless of whether it was accessed via a workflow or directly.

