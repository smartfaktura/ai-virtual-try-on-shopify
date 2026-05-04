
## Changes in `src/components/app/product-images/ProductSpecsCard.tsx`

1. **Line 141**: Remove `toast.success('Product details saved')` — no toast on save.
2. **Line 361**: Change `disabled={saving || !hasUnsavedChanges}` to `disabled={saving}` so the button is always clickable (not grayed out after saving).
