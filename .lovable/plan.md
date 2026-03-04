

## Fix Multi-Product Display & Credit Calculation in Mirror Selfie Workflow

### Problems Identified

1. **Product summary in settings step only shows 1 product**: When multiple products are selected, the `TryOnPreview` component on the Model step (line 1967) only receives `selectedProduct` (which is set to `productQueue[0]`). There's no visual indicator of the full queue at the Model step — the multi-product thumbnail row only appears in the Settings step (lines 2313-2323).

2. **No multi-product indicator on Model/Scenes steps**: After selecting 2 products and proceeding, the Model and Scenes steps show only the first product with no banner or indicator that multiple products are queued.

3. **Credit calculation**: The credit math at line 1112-1114 correctly multiplies by `productQueue.length` — so credits ARE calculated for multi-product. However, the cost display on the Model step's `TryOnPreview` only shows single-product cost since it passes `creditCost` which already includes the multiplier, but the breakdown text doesn't mention multiple products.

4. **Max product limit**: `MAX_PRODUCTS_PER_BATCH = 20` from `src/types/bulk.ts` is enforced in `ProductMultiSelect` but Mirror Selfie uses a different product picker (the `userProducts` grid at line 1744) which only allows **single selection** (`setSelectedProductIds(new Set([up.id]))` at line 1751). So Mirror Selfie with try-on actually can't select multiple products through the current UI path — the `uses_tryon` branch forces single selection.

**Root cause**: Mirror Selfie has `uses_tryon: true`, so the product picker renders the single-select try-on grid (line 1743-1778) instead of `ProductMultiSelect`. The "Continue with 2 products" button in the screenshot suggests the user might have selected via a different path, or there's a code path mismatch.

### Plan

**File: `src/pages/Generate.tsx`**

#### 1. Allow multi-select for Mirror Selfie in the product picker
The try-on product picker (lines 1743-1778) forces single selection. For Mirror Selfie specifically, switch to multi-select behavior:
- Change the `onClick` handler for Mirror Selfie to toggle selection (add/remove from set) instead of replacing the entire set
- Show checkboxes on selected items
- Cap at `MAX_PRODUCTS_PER_BATCH` (20)

#### 2. Add multi-product banner to Model & Scenes steps
After the Model step header and before the model grid, add a collapsible summary showing all queued product thumbnails when `isMultiProductMode` is true — similar to the product summary card already in the Settings step (lines 2313-2323).

#### 3. Fix credit breakdown text on all steps
On the Model step's `TryOnPreview` and the Settings cost summary, ensure the breakdown text includes `"N products ×"` prefix when in multi-product mode (already done at line 2899 for settings, but missing on model/pose steps).

#### 4. Ensure "Continue" button text shows count
The button at line 1875 already handles this for non-try-on workflows, but the try-on branch just says "Continue". Update to show `"Continue with N products"` for Mirror Selfie when multiple are selected.

### Technical Details

- Mirror Selfie detection: `const isMirrorSelfie = activeWorkflow?.name === 'Mirror Selfie Set'`
- Product picker branching: line 1743 `activeWorkflow?.uses_tryon` — add `&& !isMirrorSelfie` to fall through to multi-select, OR modify the try-on grid to support multi-select for Mirror Selfie
- Credit calc (line 1112-1114) already works correctly with `multiProductCount`
- The Settings step product summary (lines 2313-2323) already renders all queued products — just needs to be replicated or referenced in Model step

