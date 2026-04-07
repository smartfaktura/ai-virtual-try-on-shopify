

# Fix Style & Outfit card background

The Style & Outfit card on line 1620 has `bg-secondary/5` which adds a grey tint. The other section cards don't have this extra background class — they just use the default white Card background.

## Change

**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx` — line 1620

Replace:
```
<Card className="border-none shadow-sm bg-secondary/5">
```
With:
```
<Card className="border-none shadow-sm">
```

This removes the grey tint so the card matches the other white sections.

