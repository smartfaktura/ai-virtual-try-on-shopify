

# Hide Clear Button When No Products Selected

## Problem
On the product-images flow (Step 1), the "Clear" button is always visible even when nothing is selected — it's unnecessary clutter on mobile.

## Change

### File: `src/pages/ProductImages.tsx` (line 1027)

Wrap the Clear button in a conditional so it only renders when `selectedProductIds.size > 0`:

```tsx
// Before
<Button ...>Clear</Button>

// After
{selectedProductIds.size > 0 && (
  <Button ...>Clear</Button>
)}
```

### Files
- `src/pages/ProductImages.tsx` — 1 line wrapped in conditional

