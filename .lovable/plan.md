

## Simplify Products Step -- Show All Products Directly

### Change

Remove the "All Products" / "Choose Specific" toggle buttons from Step 2. Instead, always show the full product grid with a search box. Users click products to select which ones to include in the drop.

### Technical Details

**File: `src/components/app/CreativeDropWizard.tsx`**

1. **Remove `productsScope` state** (line 64) -- no longer needed since we always show the grid
2. **Remove the toggle buttons** (lines 280-295) and the "All products" placeholder card (lines 297-303)
3. **Always show** the search input + product grid (currently lines 306-345), but without the wrapping conditional
4. **Update validation** (line 132): change from `productsScope === 'all' || selectedProductIds.size > 0` to just `selectedProductIds.size > 0` -- user must select at least one product
5. **Update save mutation** (lines 154-156): always send `products_scope: 'selected'` and `selected_product_ids: Array.from(selectedProductIds)`
6. **Update review step** to show selected product count instead of "All products"

The search box and selection grid remain exactly as they are today in the "Choose Specific" branch -- they just become the default and only view for this step.

