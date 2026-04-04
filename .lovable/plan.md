

# Fix: Show All Models + Fix Product Thumbnails in Review

## Issue 1: Only Brand Models Shown

The model picker in Step 3 (Refine) receives `globalModels` from `useCustomModels()`, which only fetches admin-uploaded custom models from the database. The standard library models (`mockModels` — 50+ models used in Freestyle) are not included.

**Fix**: In `src/pages/ProductImages.tsx`, import `mockModels` from `@/data/mockData` and merge them with `customModels` when passing `globalModels` to Step 3:

```typescript
import { mockModels } from '@/data/mockData';

// Combine mock library models + admin custom models
const allLibraryModels = useMemo(
  () => [...mockModels, ...globalModelProfiles],
  [globalModelProfiles]
);
```

Then pass `allLibraryModels` as `globalModels` to `ProductImagesStep3Refine`.

## Issue 2: Product Thumbnails in Review Look Bad

In `ProductImagesStep4Review.tsx` (line 111), product thumbnails use `object-cover` in `aspect-square` containers. Products with non-square images get cropped/zoomed. The `getOptimizedUrl` with `width: 160` may also distort.

**Fix**: Change `object-cover` to `object-contain` and add padding so the product is fully visible:

```typescript
<div className="aspect-square rounded-lg overflow-hidden bg-white border border-border/40 p-1">
  <ShimmerImage
    src={p.image_url}
    alt={p.title}
    className="w-full h-full object-contain"
  />
</div>
```

Remove the `getOptimizedUrl` wrapper for these small thumbnails — they're already tiny, and the optimization transform may be causing the zoomed appearance.

## Files to Update

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Import `mockModels`, merge with custom models, pass as `globalModels` |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | Change `object-cover` to `object-contain`, add `p-1`, remove `getOptimizedUrl` |

