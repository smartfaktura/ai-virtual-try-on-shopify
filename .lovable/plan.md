

# Fix: Wrong Image Count in Progress Banner Estimate

## Problem
The estimate line shows "Est. ~1-1 min for 2 images" when generating 8 images. Two issues:

1. **Wrong total**: `totalExpectedImages` is calculated as `productQueue.length * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount` — but for workflows, `tryOnSceneCount` and `tryOnModelCount` are both 1 (they only count for `virtual-try-on` mode), so the total is wrong.
2. **Bad format**: When `estLowMin === estHighMin`, it shows "~1-1 min" which looks broken.

## Changes

### File 1: `src/pages/Generate.tsx` (line 3891)
Use `workflowImageCount * multiProductCount` for workflows instead of the try-on formula:

```
totalExpectedImages={
  hasWorkflowConfig || isSelfieUgc || isMirrorSelfie
    ? workflowImageCount * multiProductCount
    : productQueue.length * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount
}
```

### File 2: `src/components/app/MultiProductProgressBanner.tsx` (line 107)
Fix the "~1-1 min" display — when low equals high, show just one value:

```
Est. ~{estLowMin === estHighMin ? `${estLowMin}` : `${estLowMin}-${estHighMin}`} min for {totalImages} images
```

Also, for short estimates under 1 minute, show seconds instead of "~1 min":
```
const totalEstSeconds = totalImages * estimatePerImage;
if (totalEstSeconds < 60) → show "Est. ~X-Y seconds"
else → show "Est. ~X-Y min"
```

