
## Fix: Flat Lay Loading Message Shows All Products

### Problem
The loading message says `Generating 1 variations of "DAVID JONES kuprine CM8309"` -- it only shows the count from `selectedVariationIndices.size` (which may be 1 if only 1 surface was picked) and only the first product's title, ignoring the other selected flat lay products.

### Solution
Update line 2107 in `src/pages/Generate.tsx` to show a flat-lay-specific message when multiple products are selected.

### Changes

**File: `src/pages/Generate.tsx` (line ~2105-2109)**

Replace the workflow subtitle with flat-lay-aware text:
- If `isFlatLay` and multiple products selected: show "Arranging X products on Y surfaces" (e.g., "Arranging 3 products on 2 surfaces")
- Otherwise: keep existing message

The updated logic:

```text
isFlatLay && selectedFlatLayProductIds.size > 1
  ? `Arranging ${selectedFlatLayProductIds.size} products on ${selectedVariationIndices.size} surface${selectedVariationIndices.size !== 1 ? 's' : ''}`
  : hasWorkflowConfig
    ? `Generating ${selectedVariationIndices.size} variation${selectedVariationIndices.size !== 1 ? 's' : ''} of "${selectedProduct?.title || scratchUpload?.productInfo.title}"`
    : `Creating ${imageCount} images of "${selectedProduct?.title}"`
```

### Single file change
Only `src/pages/Generate.tsx` needs updating -- one line change in the generating step subtitle.
