

# Fix Jewelry Group: Consistent Spelling + Better Grouping

## Issues Found

1. **Inconsistent spelling**: The super-group header says "Jewelry & Watches" (American) but the category labels say "Jewellery – Rings", "Jewellery – Necklaces" etc. (British). Need to pick one.
2. **Watches & Eyewear orphaned**: They sit under "Jewelry & Watches" but display as standalone rows without the "Jewellery –" prefix, looking disconnected from the group.

## Fix

### 1. Standardize spelling to "Jewelry" (American English)
Update the display labels in two files:
- `src/hooks/useProductImageScenes.ts` — change "Jewellery – Necklaces" → "Jewelry – Necklaces" etc.
- `src/lib/categoryUtils.ts` — same changes

### 2. Rename the super-group to "Jewelry, Watches & Eyewear"
In `ProductImagesStep2Scenes.tsx`, change the group label to make it clear that watches and eyewear belong here:
```
{ label: 'Jewelry, Watches & Eyewear', ids: [...] }
```

This is a 3-file, ~10-line cosmetic fix.

## Files
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — rename group label
- `src/hooks/useProductImageScenes.ts` — fix 4 labels (Jewellery → Jewelry)
- `src/lib/categoryUtils.ts` — fix 4 labels (Jewellery → Jewelry)

