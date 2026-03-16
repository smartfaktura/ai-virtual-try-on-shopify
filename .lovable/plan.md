

## Fix: Add `workflow_slug` and `workflow_name` to tryon enqueue payloads

### Problem
The tryon-specific enqueue paths in `Generate.tsx` are missing `workflow_slug` and `workflow_name` fields that were added to the standard workflow paths. This means:
1. Retry links for tryon jobs on the Workflows page will fall back to the ugly `?workflow=UUID` pattern
2. The GlobalGenerationBar won't display the workflow name for tryon jobs

### Changes

**File: `src/pages/Generate.tsx`**

1. **`enqueueTryOnForProduct` function (~line 1058)** — Add `workflow_name` and `workflow_slug` to the payload:
```
workflow_id: activeWorkflow?.id || null,
workflow_name: activeWorkflow?.name || null,    // ADD
workflow_slug: activeWorkflow?.slug || null,     // ADD
product_id: product.id || null,
product_name: product.title,
```

2. **Single-scene tryon enqueue (~line 1155)** — Add the same fields plus `product_name`:
```
workflow_id: activeWorkflow?.id || null,
workflow_name: activeWorkflow?.name || null,    // ADD
workflow_slug: activeWorkflow?.slug || null,     // ADD
product_id: selectedProduct?.id || null,
product_name: selectedProduct?.title || productData.title,  // ADD (was missing)
brand_profile_id: selectedBrandProfileId || null,
```

Two small additions in the same file, bringing the tryon paths in line with the workflow paths.

