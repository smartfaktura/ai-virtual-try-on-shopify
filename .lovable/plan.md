

# Fix: Inconsistent Image Counts in Progress Banner

## Problem
The banner shows conflicting numbers: "Generating 2 images for Virtual Try-On Set..." but "Est. ~22-42 sec for 4 images". Two different sources of truth are used — `multiProductJobIds.size` (actual jobs = 2) vs `totalExpectedImages` (calculated formula = 4). The formula over-counts because it multiplies by aspect ratios/framings that may not actually create separate jobs.

## Root Cause
`MultiProductProgressBanner` uses:
- **Header**: `totalJobCount` = `totalJobs` prop (from `multiProductJobIds.size`) — actual enqueued jobs
- **Estimate line**: `totalImages` = `totalExpectedImages` prop — calculated formula that can differ

These two numbers must always match. The actual job count (`multiProductJobIds.size`) is the ground truth since it reflects what was actually enqueued.

## Fix

### File: `src/components/app/MultiProductProgressBanner.tsx`
Unify the image count. Use `totalExpectedImages` as the single source of truth for everything — header, estimate, and completion text. But also ensure the estimate falls back to `totalJobCount` if `totalExpectedImages` isn't provided.

Change line 68:
```
const totalImages = totalExpectedImages || totalJobCount;
```
And change line 93 to also use `totalImages` instead of `totalJobCount`:
```
{completedCount > 0
  ? `${completedCount} of ${totalImages} image${totalImages !== 1 ? 's' : ''} done`
  : workflowName
    ? `Generating ${totalImages} image${totalImages !== 1 ? 's' : ''} for ${workflowName}...`
    : ...}
```

### File: `src/pages/Generate.tsx` (line 3891-3895)
Fix the `totalExpectedImages` calculation. For Virtual Try-On Set (which is a try-on workflow WITH `generation_config`), the current formula `workflowImageCount * multiProductCount` over-counts. The issue is `workflowImageCount` includes `aspectRatioCount * framingCount` but these don't create separate jobs for try-on workflows — they're embedded in each job.

For workflows that use try-on (`activeWorkflow?.uses_tryon`), use the actual try-on job formula instead:
```
totalExpectedImages={
  activeWorkflow?.uses_tryon
    ? multiProductCount * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount
    : (hasWorkflowConfig || isSelfieUgc || isMirrorSelfie)
      ? workflowImageCount * multiProductCount
      : productQueue.length * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount
}
```

This ensures the expected count matches actual enqueued jobs for all workflow types.

## Summary
- 2 files, ~6 lines changed
- Unifies image count display across header and estimate line
- Fixes over-counting for try-on workflows

