
## Fix: Show All Selected Products in Flat Lay Settings Step

### Problem
When multiple products are selected in the Flat Lay wizard, the "Selected Product" card in the Surfaces step only displays the first product. The user selected several products but only sees one (e.g., "Ziedas su deimantais").

### Solution
Replace the single-product summary card with a multi-product display when `isFlatLay` and multiple products are selected.

### Changes

#### File: `src/pages/Generate.tsx` (lines ~1531-1558)

**Current behavior:** Shows a single product card with one thumbnail, title, and vendor.

**New behavior for Flat Lay:**
- Show header "Selected Products (X)" instead of "Selected Product"
- Display a horizontal scrollable row of product thumbnails (small cards with image + title)
- Each card shows the product image and truncated title
- "Change" button still navigates back to product selection step

**Layout:**
- Row of compact product cards: `flex gap-2 overflow-x-auto`
- Each card: 56x56px thumbnail + product title below, rounded border
- If only 1 product selected, keep current single-product layout

**Conditional logic:**
```text
if (isFlatLay && selectedFlatLayProductIds.size > 1) {
  // Show multi-product row with all selected flat lay products
  const flatLayProducts = userProducts.filter(up => selectedFlatLayProductIds.has(up.id));
  // Render horizontal row of small product cards
} else {
  // Existing single product display
}
```

### No other files need changes
The multi-product data is already stored in `selectedFlatLayProductIds` and passed correctly to the generation payload. This is purely a UI display fix.
