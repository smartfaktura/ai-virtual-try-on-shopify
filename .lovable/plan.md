

# Remove Redundant "Jewelry –" Prefix from Category Labels

The categories are already under the "JEWELRY" super-group header, so repeating "Jewelry –" before each item is redundant. Change labels to just "Rings", "Necklaces", "Earrings", "Bracelets".

## Changes

### 1. `src/hooks/useProductImageScenes.ts` — TITLE_MAP entries
```
'jewellery-necklaces': 'Necklaces',
'jewellery-earrings': 'Earrings',
'jewellery-bracelets': 'Bracelets',
'jewellery-rings': 'Rings',
```

### 2. `src/lib/categoryUtils.ts` — categoryLabels entries
```
'jewellery-necklaces': 'Necklaces',
'jewellery-earrings': 'Earrings',
'jewellery-bracelets': 'Bracelets',
'jewellery-rings': 'Rings',
```

Two files, 8 lines total.

