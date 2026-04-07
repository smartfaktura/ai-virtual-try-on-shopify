

# Fix Style & Outfit card border consistency

## Problem
The Style & Outfit card has `className="border-none shadow-sm"` while all other section cards use plain `<Card>` (which renders with the default border and no explicit shadow). This creates a visible inconsistency.

## Change

**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx` — line 1620

Replace:
```tsx
<Card className="border-none shadow-sm">
```
With:
```tsx
<Card>
```

This makes it match Choose model, Background style, and Additional note cards exactly.

