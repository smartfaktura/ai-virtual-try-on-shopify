

## Fix: Adding Workflows Should Increase Credits, Not Decrease

### The Bug

The `calculateDropCredits` function splits `imagesPerDrop` (e.g., 25) evenly across ALL selected workflows. When you add Flat Lay (4 credits/image) to three model-based workflows (12 credits/image each), the images get redistributed:

- **Before Flat Lay**: 3 workflows, ~8 images each at 12cr = 288 credits
- **After Flat Lay**: 4 workflows, ~6 images each = 3x6x12 + 6x4 = 240 credits (DECREASED)

Adding a workflow should never decrease the total cost. The core issue is that `imagesPerDrop` represents a shared pool being split, rather than each workflow generating its own set of images.

### The Fix

Change the calculation so `imagesPerDrop` means "images per workflow per drop" -- each selected workflow generates that many images independently. This matches the user expectation: selecting more workflows means more images and more credits.

**File: `src/lib/dropCreditCalculator.ts`**

Remove the splitting logic (lines 47-48). Instead, each workflow gets the full `imagesPerDrop` count:

```typescript
const breakdown: CreditBreakdown[] = workflows.map((wf) => {
  const costPerImage = getCostPerImage(wf.workflowId, wf.hasModel, wf.hasCustomScene);
  return {
    workflowId: wf.workflowId,
    workflowName: wf.workflowName,
    imageCount: imagesPerDrop,
    costPerImage,
    subtotal: imagesPerDrop * costPerImage,
  };
});
```

This way:
- 3 model workflows x 25 images x 12cr = 900 credits
- Add Flat Lay: 3x25x12 + 25x4 = 1,000 credits (correctly increases)

**File: `src/components/app/CreativeDropWizard.tsx`**

Update the "Estimated Cost" label from "X credits / drop" to show both per-workflow and total clearly. Also rename `imagesPerDrop` label in Step 4 to clarify it means "images per workflow" (e.g., "Images per workflow per drop").

### Files Modified
- `src/lib/dropCreditCalculator.ts` -- remove image splitting, each workflow gets full count
- `src/components/app/CreativeDropWizard.tsx` -- update labels for clarity
