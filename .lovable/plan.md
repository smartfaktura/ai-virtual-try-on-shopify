

## Enable Multi-Product Selection for Virtual Try-On Workflows

### Problem
Currently, the Virtual Try-On product grid only allows selecting one product at a time (unless it's Mirror Selfie). The multi-product queue infrastructure already exists in the codebase — it just needs to be wired up for try-on workflows.

### Changes

**`src/pages/Generate.tsx`** — Three areas to modify:

**1. Product grid (lines ~1746-1803)**: Remove the `isMirrorSelfie` guard so ALL `uses_tryon` workflows allow multi-select with checkboxes. Paid users can select up to `MAX_PRODUCTS_PER_BATCH` (20); free users limited to 1.

**2. Product step "Continue" handler (lines ~1824-1838)**: When multiple try-on products are selected, set up `productQueue` (same as Mirror Selfie already does), then proceed to brand-profile → model → scene flow as normal with the first product.

**3. Job completion handler (lines ~808-866)**: When a try-on job completes in multi-product mode, auto-advance to the next product by calling `handleTryOnConfirmGenerate()` (not `handleWorkflowGenerate()`). Same pattern for failure handler (lines ~869-912).

This means:
- The product grid shows checkboxes and a "X selected" badge for all try-on workflows (not just Mirror Selfie)
- User picks model + scene once, then the system runs try-on for each product sequentially
- Progress banner shows "Product X of Y" (already built)
- Results aggregate into one gallery with product-name labels (already built)

