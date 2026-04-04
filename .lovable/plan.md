

# Copy Catalog Floating Bar & Product Selection to Product Images

## 2 Changes

### 1. Replace sticky bar with catalog-style floating card

**Current**: `ProductImagesStickyBar` uses `sticky bottom-0` with full-width border-top — looks like a plain footer, not a floating card.

**Target pattern** (from `CatalogStepShots.tsx` line 116-144):
```
sticky bottom-4 z-10
  └─ rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 sm:p-4 shadow-lg
```

**Fix**: Restyle `ProductImagesStickyBar.tsx` to match this exact pattern:
- Outer: `sticky bottom-4 z-10` (not `bottom-0`, not full-width negative margins)
- Inner: `rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 sm:p-4 shadow-lg`
- Keep the same content layout (summary + credits + buttons) but wrap in the card style
- Remove the `-mx-4 sm:-mx-6 lg:-mx-8` negative margins — let it float naturally within content

**File**: `ProductImagesStickyBar.tsx`

### 2. Replace product selection with CatalogStepProducts pattern

**Current**: `ProductImagesStep1Products` is a simpler custom implementation with basic search/filter and plain cards.

**Target** (`CatalogStepProducts.tsx`): Rich UI with underline tabs (My Products / Import URL / Upload CSV), numbered selection badges, grid/list view toggle, "Select All / Clear" buttons, selection order tracking, and `object-cover` images with proper card styling (rounded-2xl, shimmer, gradient overlay).

**Fix**: Replace the body of `ProductImagesStep1Products.tsx` to reuse the `CatalogStepProducts` component directly, passing the same props. The `CatalogStepProducts` already accepts `products`, `selectedProductIds`, `onProductSelectionChange`, `maxProducts`, `onAddProduct`, etc.

In `ProductImages.tsx`, render `CatalogStepProducts` instead of `ProductImagesStep1Products` for step 1, mapping the existing props. Set `maxProducts` to a reasonable limit (e.g. 20). The `onNext` and `canProceed` remain handled by the parent sticky bar, so pass a no-op or the existing `handleNext` for `onNext`.

**Files**: `ProductImages.tsx` — swap step 1 component. `ProductImagesStep1Products.tsx` can be deleted or kept as unused.

## Summary

| File | Change |
|------|--------|
| `ProductImagesStickyBar.tsx` | Restyle to `sticky bottom-4` floating card with `rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg` |
| `ProductImages.tsx` | Replace Step 1 with `CatalogStepProducts` component import |

