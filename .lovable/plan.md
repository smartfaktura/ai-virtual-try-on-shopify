

# Fix Creative Drops Workflow Preview Images

## Problem
The Creative Drops wizard shows broken/alt-text images for workflows like "Virtual Try-On Set" and "Mirror Selfie Set" because `WORKFLOW_FALLBACK_IMAGES` only maps 3 of 7+ workflows. The `/app/workflows` page uses animated thumbnails with proper background images defined in `workflowAnimationData.tsx`.

## Fix

**File: `src/components/app/CreativeDropWizard.tsx`**

Expand `WORKFLOW_FALLBACK_IMAGES` to include all workflows, using the same background images from `workflowAnimationData.tsx` but with `getOptimizedUrl()` applied for small thumbnails (w-14 = 56px, so ~120px width at 2x):

```tsx
const WORKFLOW_FALLBACK_IMAGES: Record<string, string> = {
  'Virtual Try-On Set': getOptimizedUrl(getLandingAssetUrl('workflows/workflow-tryon-result.png'), { width: 120, quality: 60 }),
  'Product Listing Set': getOptimizedUrl(getLandingAssetUrl('workflows/workflow-product-listing.jpg'), { width: 120, quality: 60 }),
  'Selfie / UGC Set': getOptimizedUrl(getLandingAssetUrl('workflows/ugc-result-1.jpg'), { width: 120, quality: 60 }),
  'Flat Lay Set': getOptimizedUrl(getLandingAssetUrl('workflows/workflow-flat-lay.jpg'), { width: 120, quality: 60 }),
  'Mirror Selfie Set': getOptimizedUrl('https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/...mirror_selfie...', { width: 120, quality: 60 }),
  'Picture Perspectives': getOptimizedUrl('/images/perspectives/front.png', { width: 120, quality: 60 }),
};
```

The exact URLs will be pulled from the existing `workflowAnimationData.tsx` background fields. Images that are local paths (not Supabase URLs) won't be optimized by `getOptimizedUrl` (it only transforms Supabase URLs), so those will pass through unchanged.

Also apply the same optimization to the image `src` in the wizard (lines 785 and 877) by wrapping the URL with `getOptimizedUrl(..., { width: 120, quality: 60 })` to ensure small, fast-loading thumbnails.

## Summary
- One file changed: `CreativeDropWizard.tsx`
- Add missing workflow entries to `WORKFLOW_FALLBACK_IMAGES` using the same source images as the Workflows page
- Apply `getOptimizedUrl` with width constraint for small thumbnails

