

## Add "New Product" Link to Product Selector Popover

### What
When the product selector popover has existing products, there's no way to navigate to the products page to add a new one. Currently, only the empty state shows an "Add your first product" link.

### Change
Add a subtle link at the bottom of the product grid in `ProductSelectorChip.tsx` that navigates to `/app/products`. This will appear after the product grid whenever products exist, giving users a quick path to manage or add products.

### Design
- A small `+ Add new product` link below the product grid, styled consistently with the existing empty-state link (text-xs, text-primary, hover:underline)
- Separated from the grid with a thin top border for visual clarity
- Closes the popover on click

### Technical Details

**File**: `src/components/app/freestyle/ProductSelectorChip.tsx`

After the product grid `div` (line 130, after the closing `</div>` of the grid), add:

```tsx
<div className="border-t border-border mt-2 pt-2">
  <Link
    to="/app/products"
    onClick={() => onOpenChange(false)}
    className="flex items-center justify-center gap-1 text-xs text-primary hover:underline font-medium py-1"
  >
    + Add new product
  </Link>
</div>
```

This goes inside the existing `<>...</>` fragment that wraps the search input and grid (lines 76-131), right before the closing `</>`.

One file changed, ~6 lines added.
