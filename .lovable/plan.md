

# Fix Catalog Product Selection — Match Workflow Pattern

## Problem
The catalog product step uses `ProductMultiSelect` (shared component with checkboxes, category enforcement logic, and `object-contain` thumbnails). This looks different from the workflow product grid which has a cleaner, more visual card-based layout with grid/list toggle, shimmer images, circular check indicators, "Add New" card, and load-more pagination.

## Solution
Rewrite `CatalogStepProducts.tsx` to replicate the exact product selection pattern from `Generate.tsx` (lines 2919–3103), adapted for multi-select catalog use.

### Changes to `src/components/app/catalog/CatalogStepProducts.tsx`

Remove `ProductMultiSelect` import entirely. Build inline product grid matching the workflow pattern:

- **Toolbar**: Search input + Select All / Clear buttons + Grid/List view toggle (using `LayoutGrid` / `List` icons)
- **Selection badge**: `"{n} selected (max 50)"`
- **Grid view** (`grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3`):
  - Each card: `ShimmerImage` with `aspect-square object-cover`, circular check indicator (top-left, appears on hover or when selected), title + product type below
  - "Add New" dashed card at the end (opens `AddProductModal`)
  - Load more button when products exceed page size (22 per page)
- **List view**: Compact rows with 40×40 thumbnail, title, type, circular check
- **Empty state**: Package icon + "No products yet" + "Add Products" button
- **Data source**: Query `user_products` directly (already done in `CatalogGenerate.tsx`), pass raw `userProducts` data instead of the mapped `Product[]`

### Changes to `src/pages/CatalogGenerate.tsx`

- Pass the raw `userProducts` array (with `image_url` field) to `CatalogStepProducts` instead of the mapped `Product[]` type
- Or keep the mapped type but ensure `image_url` is available for `ShimmerImage`
- Add `AddProductModal` state + render
- Add `visibleProductCount` state + `PRODUCTS_PER_PAGE` constant

### Dependencies
- Import `ShimmerImage` from `@/components/ui/shimmer-image`
- Import `getOptimizedUrl` from `@/lib/imageOptimization`
- Import `AddProductModal` from `@/components/app/AddProductModal`
- Import `cn` from `@/lib/utils`
- Import `LayoutGrid`, `List`, `Check`, `Package` from lucide

### Key visual details copied from workflow
- Circular check: `w-5 h-5 rounded-full border-2` with primary fill when selected, transparent on hover when not
- Card border: `border-2 border-transparent` → `border-primary ring-2 ring-primary/30` when selected
- Image: `object-cover` (not `object-contain`) with `ShimmerImage` for loading shimmer
- Title: `text-[10px] font-medium line-clamp-2`
- Product type: `text-[9px] text-muted-foreground`

## Files

| Action | File |
|--------|------|
| Rewrite | `src/components/app/catalog/CatalogStepProducts.tsx` |
| Update | `src/pages/CatalogGenerate.tsx` (add AddProductModal, visibleProductCount state, pass image_url) |

