## Changes

### 1. `src/lib/productSpecFields.ts` — Replace jeans fields

Current jeans fields (waist number + length number) don't matter for image generation. Replace with fields that actually affect how the jeans look in generated photos:

```
'jeans': [
  { key: 'waistHeight', label: 'Waist Rise', type: 'select', options: ['Low-rise', 'Mid-rise', 'High-rise'] },
  { key: 'hemLength', label: 'Hem Length', type: 'select', options: ['Cropped (ankle)', 'Regular', 'Full length', 'Extra long'] },
  { key: 'fit', label: 'Fit', type: 'select', options: ['Skinny', 'Slim', 'Straight', 'Regular', 'Wide-leg', 'Bootcut', 'Tapered'] },
],
```

### 2. `src/components/app/product-images/ProductSpecsCard.tsx` — Fix category selector styling

The current category selector is a bare text with a tiny chevron — looks broken per the screenshot. Update the `SelectTrigger` styling to look like a proper small pill/badge:

- Add a subtle border/background so it's recognizable as a dropdown
- Increase from `text-[10px]` to `text-[11px]`
- Add `rounded-full bg-muted/50 border border-border/40 px-2 py-0.5` to give it a pill shape
- Keep the compact sizing but make it clearly interactive
