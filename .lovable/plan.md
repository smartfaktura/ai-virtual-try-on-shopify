

# Fix: Mirror Selfie Image Count Doesn't Include Model Count

## Problem
With 2 scenes × 2 models × 1 product selected, the settings panel shows "2 images · 12 credits" instead of "4 images · 24 credits". The model count is completely missing from the credit/image calculation for workflows.

## Root Cause

**`src/pages/Generate.tsx` line 1885:**
```
workflowImageCount = hasWorkflowConfig
  ? selectedVariationIndices.size * angleMultiplier * aspectRatioCount * framingCount
  : parseInt(imageCount);
```
This formula doesn't multiply by model count. For Mirror Selfie/Selfie UGC with 2 models selected, it should be × 2.

**Line 1894 (credit cost):** Uses `workflowImageCount * workflowCostPerImage` — also missing model multiplier.

**`WorkflowSettingsPanel.tsx` line 776:** Displays `workflowImageCount * multiProductCount` — no model count shown.

## Changes

### File 1: `src/pages/Generate.tsx` (line 1885)

Add a `workflowModelCount` for workflows that use multi-model (Mirror Selfie, Selfie/UGC):

```typescript
const workflowModelCount = (isSelfieUgc || isMirrorSelfie) && selectedModels.size > 1
  ? selectedModels.size : 1;
const workflowImageCount = hasWorkflowConfig
  ? selectedVariationIndices.size * angleMultiplier * aspectRatioCount * framingCount * workflowModelCount
  : parseInt(imageCount);
```

This fixes both the image count display and the credit cost calculation (since `creditCost` derives from `workflowImageCount`).

### File 2: `src/components/app/generate/WorkflowSettingsPanel.tsx` (lines 778-784)

Pass `workflowModelCount` as a new prop and include it in the breakdown text:

```
{workflowModelCount > 1 ? `${workflowModelCount} models × ` : ''}
{selectedVariationIndices.size} scenes ...
```

Add `workflowModelCount: number` to the props interface and pass it from Generate.tsx.

## Summary
- 2 files, ~8 lines changed
- Multiplies model count into `workflowImageCount` for Mirror Selfie and Selfie/UGC workflows
- Updates cost summary breakdown to show model count

