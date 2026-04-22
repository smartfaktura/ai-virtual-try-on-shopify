
## Build a Product Catalog modal — match Model/Scene Look UX

Bring the Freestyle **Product** chip up to the same standard as Model and Scene Look: a right-side slide-in modal on desktop (mirroring `ModelCatalogModal`), with the existing mobile sheet untouched.

### New file — `src/components/app/freestyle/ProductCatalogModal.tsx`

Right-side `Sheet` (max **1500px**) reusing the exact same layout primitives as `ModelCatalogModal`:

**Header**
- Title: "Select a Product"
- Subtitle: "Pick what to feature in your scene"

**Filter bar** (top, under header)
- Quick chips (left): **All · Recently added** (sorted by `created_at` desc as the only "real" filter — keep it minimal like the Model bar after non-binary removal)
- Sort (right): **Featured · Name A→Z · Newest**
- "Clear all" appears only when a non-default filter is active

**Sidebar** (left, 240px, hidden on <lg)
- **Quick** section: "All products" (count) and "Samples" (3 starter products)
- **Type** section: dynamic list built from unique `product_type` values across the user's products (e.g. Jewelry, Clothing, Beauty…). "Any" rendered in muted/non-active style by default — only an explicit pick lights up, matching the Model modal's calm sidebar.

**Grid** (right, scrollable)
- 2 / 3 / 4 / 5 columns responsive (same breakpoints as Model grid)
- Card: square image with `ShimmerImage`, title + product type, hover lift + border highlight, `Check` badge top-right when selected, sample badge ("Sample") bottom-left for the 3 built-in samples
- Empty user-products state: friendly card with `Package` icon, copy "No products yet — try a sample or add your own", **3 sample tiles** (Diamond Ring / Ribbed Crop Top / Ice Roller — reuse `SAMPLE_PRODUCTS` from current `ProductSelectorChip.tsx`), plus a primary "+ Add Your Own Product" button routing to `/app/products`
- Always-visible **"+ Add new product"** dashed tile at the end of the grid (mirrors the Model modal's "Create Brand Model" tile) — navigates to `/app/products` and closes the sheet

**Footer** (sticky)
- Left: thumbnail + name of the **pending** selection, or "Pick a product to continue."
- Right: `Clear` (only if a product is currently selected), `Cancel`, `Use product` (disabled until a pending pick exists)
- Pending-then-confirm pattern matches Model/Scene Look exactly

### Edit — `src/components/app/freestyle/ProductSelectorChip.tsx`

- Keep file as the chip trigger only; remove the inline `Popover` content.
- Desktop: render `<ProductCatalogModal>` controlled by `open` / `onOpenChange`; trigger button calls `onOpenChange(!open)` on **all viewports** (lesson from the Model fix).
- Mobile: keep existing `MobilePickerSheet` flow with the current inline content.
- The clear-`X` inside the chip keeps `e.stopPropagation()` so it doesn't open the sheet.

### Untouched

- `MobilePickerSheet` and the mobile picker UX
- Sample products list and routing
- `FreestyleSettingsChips.tsx` props/wiring (chip API stays identical)
- All selection logic in the parent Freestyle page
