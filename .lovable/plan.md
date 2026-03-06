

## Unify Product Selection Style for Non-Try-On Workflows

Apply the same clean product grid UI used in try-on workflows to non-try-on workflows (Product Listing Set, Flat Lay Set, etc.).

### Problem
Non-try-on workflows use the old `ProductMultiSelect` component with a different card style, while try-on workflows have a nicer UI with search toolbar, grid/list toggle, circular checkmarks, and cleaner cards.

### Changes in `src/pages/Generate.tsx`

**Lines 2089-2103** — Replace the `ProductMultiSelect` fallback with the same UI pattern used for try-on workflows (lines 1911-2087):

- Same search toolbar with `Search` icon input, Select All, Clear buttons
- Same grid/list view toggle
- Same selection badge row
- Same grid card style: circular checkmarks that appear on hover, clean image + title layout
- Same "Add New" dashed card at the end
- Reuse the same `tryOnSearchQuery` state (or add a parallel one) and `productViewMode` toggle

The key difference: map `userProducts` through `mapUserProductToProduct` for selection tracking (since non-try-on uses `Product` type), but render using the same visual layout.

This replaces the `ProductMultiSelect` component usage entirely for this page, keeping it consistent across all workflow types.

