

## Fix: Wrong Credit Cost for Virtual Try-On Workflows

### Bug
Line 1361 in `Generate.tsx`:
```typescript
const singleProductCreditCost = hasWorkflowConfig 
  ? workflowImageCount * perImageCredits 
  : parseInt(imageCount) * perImageCredits * tryOnSceneCount;
```

When a try-on workflow has `generation_config` (making `hasWorkflowConfig = true`), it uses the workflow branch (`workflowImageCount = selectedVariationIndices.size * angleMultiplier`). But try-on doesn't use variation indices — it uses `selectedPoses`. So the cost picks up stale/default `selectedVariationIndices` data, producing a wrong number (32 instead of 8).

### Fix

**`src/pages/Generate.tsx` (line ~1361)**
- Add a try-on check before the workflow check:
```typescript
const singleProductCreditCost = 
  (generationMode === 'virtual-try-on' && !isSelfieUgc)
    ? parseInt(imageCount) * perImageCredits * tryOnSceneCount
    : hasWorkflowConfig 
      ? workflowImageCount * perImageCredits 
      : parseInt(imageCount) * perImageCredits * tryOnSceneCount;
```

This ensures try-on always uses `tryOnSceneCount` (from `selectedPoses.size`) regardless of whether the workflow has a `generation_config`.

### Files
1. **`src/pages/Generate.tsx`** — Fix the credit cost ternary (1 line change)

