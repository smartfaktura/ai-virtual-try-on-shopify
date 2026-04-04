

# Product Images — Pagination, Thumbnail Fix, Scene Cleanup, Scroll Reset

## 4 Changes

### 1. Paginate Products (25 initial + Load More)
**File**: `src/components/app/product-images/ProductImagesStep1Products.tsx`

- Add `visibleCount` state initialized to 25
- Reset `visibleCount` to 25 when search or typeFilter changes
- Slice `filtered` to `filtered.slice(0, visibleCount)` for the grid
- Show a "Load more" button below the grid when `filtered.length > visibleCount`
- Button text: "Show more (X remaining)"
- Increment by 25 on click

### 2. Fix Context Strip Thumbnails
**File**: `src/components/app/product-images/ProductContextStrip.tsx`

The `getOptimizedUrl` with `width: 64` produces broken renders at 32×32px. Fix by using the raw `image_url` directly — the browser handles downscaling fine at this size. Also add `loading="eager"` for these nav thumbnails.

### 3. Scene Data Cleanup
**File**: `src/components/app/product-images/sceneData.ts`

- **Remove** `on-surface` ("Styled Surface") from `GLOBAL_SCENES`
- **Fix** `detail-coverage` ("Multi-Angle Coverage"): rename to "Front Angle", update description to "Clean front-facing product angle.", and remove `angleSelection` from `triggerBlocks` — each scene generates one angle, not multiple. Individual angle scenes (back-angle, side-profile, top-down) already exist separately.

### 4. Scroll to Top on Step Change
**File**: `src/pages/ProductImages.tsx`

Add a `useEffect` that watches `step` and calls `window.scrollTo({ top: 0, behavior: 'smooth' })` whenever the step changes. This ensures users always see the top of each wizard section.

## Files Modified

| File | Changes |
|------|---------|
| `ProductImagesStep1Products.tsx` | Add pagination (25 + load more), reset on filter change |
| `ProductContextStrip.tsx` | Remove `getOptimizedUrl`, use raw `image_url` |
| `sceneData.ts` | Remove Styled Surface, rename Multi-Angle → Front Angle |
| `ProductImages.tsx` | Add scroll-to-top effect on step change |

