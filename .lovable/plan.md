

## Add Fallback Preview Images for Workflows in Creative Drop Wizard

### Problem
Three workflows (Product Listing Set, Selfie / UGC Set, Flat Lay Set) have no `preview_image_url` in the database, so they show empty gray boxes in the wizard's Step 3.

### Solution
Add a fallback image map in the wizard that uses the existing landing asset images (same ones used on the Workflows page) when `preview_image_url` is null.

### Technical Details

**File: `src/components/app/CreativeDropWizard.tsx`**

1. Import `getLandingAssetUrl` from `@/lib/landingAssets`
2. Add a constant map of workflow name to fallback image URL:
   - `'Product Listing Set'` -> `getLandingAssetUrl('workflows/workflow-product-listing.jpg')`
   - `'Selfie / UGC Set'` -> `getLandingAssetUrl('workflows/workflow-selfie-ugc.jpg')`
   - `'Flat Lay Set'` -> `getLandingAssetUrl('workflows/workflow-flat-lay.jpg')`
3. Update the workflow card rendering (around line 345-348) to use `wf.preview_image_url || fallbackMap[wf.name]` as the image source, and always render the `<img>` tag (removing the conditional `{wf.preview_image_url && ...}`)

This is a one-file, ~10-line change. No database changes needed.
