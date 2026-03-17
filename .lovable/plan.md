

## Unify Product Selection UI Across All Workflows

### Problem
Non-try-on workflows (Product Listing Set, Flat Lay, Mirror Selfie, Upscale, etc.) use the old `ProductMultiSelect` component when showing sample products — which has a different style (square checkboxes, category enforcement, 4-column grid) compared to the try-on workflow's cleaner UI (circular checkmarks, grid/list toggle, 6-column grid, "Add New" card). The category restriction also blocks selecting products from different categories, which the user wants removed.

### Plan

**1. Replace the sample-products block (lines ~2210-2223 in Generate.tsx)**

Instead of rendering `<ProductMultiSelect>`, render the same try-on-style grid inline — adapted for sample products (mock `Product` type → needs image/title mapping). This block should include:
- Search bar + Select All + Clear + Grid/List toggle (same toolbar as try-on)
- Selected count badge
- Grid view: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6` with circular checkmarks
- List view: compact rows with circular selection indicators
- "Upload Product" card at the end (dashed border, like the try-on "Add New" card)
- Keep the SAMPLES badge + label above the toolbar

The sample products from `mockProducts` use `Product` type (with `product.images[0].url`), so the grid cards need to handle that format (vs `user_products` which use `image_url`).

**2. Replace the has-products non-try-on block (lines ~2404-2562)**

This block already uses the try-on style — confirm it's consistent. It currently duplicates the try-on grid code. No changes needed here since it already matches.

**3. Remove category enforcement**

Remove `enforceSameCategory` logic entirely from the sample products flow. The `ProductMultiSelect` component itself can remain in the codebase (it may be used elsewhere), but the Generate page will no longer use it for workflows. Users should be able to freely mix product categories.

### Files to modify
- `src/pages/Generate.tsx` — Replace the sample-products empty-state block (lines 2210-2223) with the try-on-style grid that renders `sampleProducts` using the same card layout, search, grid/list toggle, and "Upload Product" card.

