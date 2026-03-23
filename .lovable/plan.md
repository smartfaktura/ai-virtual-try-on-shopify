

# Fix Product Listing Set Slow Loading

## Root Cause

Product Listing Set is the **only workflow** using local `import` from `src/assets/workflows/`:

```ts
import listingProduct from '@/assets/workflows/product-listing-product.png';
import listingResult from '@/assets/workflows/product-listing-result.png';
```

Every other workflow uses `getLandingAssetUrl()` which produces Supabase Storage URLs. This matters because:

1. **No image optimization** - `getOptimizedUrl()` only transforms Supabase Storage URLs. Local imports bypass it entirely, so the full-resolution PNG loads every time (no quality compression, no width resize).
2. **Bundled into JS** - Vite inlines or hashes these into the app bundle, increasing initial load and parse time for every page, not just workflows.
3. **No CDN caching** - Supabase Storage URLs are served from a CDN with proper cache headers. Local assets go through Vite's dev server or bundled output.

## Fix

### `src/components/app/workflowAnimationData.tsx`

Replace the two local imports with `getLandingAssetUrl()` calls, matching the pattern used by every other workflow:

```ts
// Remove:
import listingProduct from '@/assets/workflows/product-listing-product.png';
import listingResult from '@/assets/workflows/product-listing-result.png';

// Replace with:
const listingProduct = getLandingAssetUrl('workflows/product-listing-product.png');
const listingResult = getLandingAssetUrl('workflows/product-listing-result.png');
```

This requires uploading the two files to the `landing-assets` Supabase Storage bucket under `workflows/`. I'll upload them via the storage API.

After this change, `getOptimizedUrl()` in `WorkflowAnimatedThumbnail` (line 727) will correctly apply `width=600&quality=60` to the background, reducing the transferred size significantly.

### Files
- **`src/components/app/workflowAnimationData.tsx`** - replace 2 local imports with `getLandingAssetUrl()` calls
- **Upload**: `src/assets/workflows/product-listing-product.png` and `product-listing-result.png` to Supabase Storage `landing-assets/workflows/`
- Optionally delete the files from `src/assets/workflows/` after confirming they load from storage

