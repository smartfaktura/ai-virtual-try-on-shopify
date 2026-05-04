
## Problem

All dimension fields are hardcoded to `cm` (metric). US market users expect inches. The user wants a toggle to switch between cm and inches.

## Solution

Add a small `cm | in` toggle at the top of the Product Details card. When toggled, all dimension fields update their displayed unit labels and placeholders to the selected system. The serialized value always includes the unit so the AI knows the scale.

### Changes

**`src/lib/productSpecFields.ts`**
- Add a `placeholderImperial?: string` property to `SpecField` for inch-equivalent placeholders.
- Add imperial placeholders to every field that currently has a `cm` unit. Fields with `mm`, `g`, `ml`, or no unit stay unchanged (eyewear mm, watches mm, weight g, volume ml are universal).
- Export a helper `getImperialUnit(metricUnit)` that maps `cm` -> `in`, leaving `mm`/`g`/`ml` unchanged.
- Update jewelry chain length select options to include both units: `'35cm / 14" (choker)'` etc.
- Update jewelry bracelet length options similarly.

**`src/components/app/product-images/ProductSpecsCard.tsx`**
- Add a `unitSystem` state: `'metric' | 'imperial'`, default `'metric'`.
- Render a small segmented toggle (`cm | in`) next to the "Product Details" header, right of the "OPTIONAL" label.
- When rendering each field: if `field.unit === 'cm'`, display `in` instead when imperial is selected, and use `field.placeholderImperial` for the placeholder.
- The serialized spec string stores the active unit (e.g., `Width: 12 in` vs `Width: 30 cm`) so the AI prompt gets the correct scale info.

### Categories reviewed

| Category | Has cm fields | Imperial placeholder needed |
|----------|--------------|---------------------------|
| Bags, Backpacks, Wallets | Yes (W/H/D) | Yes |
| Belts, Scarves | Yes (L/W) | Yes |
| Hats | Yes (circumference) | Yes |
| Shoes/Boots/Heels | Yes (heel height) | Yes |
| Jewelry (earrings, pendants) | Yes (drop/width) | Yes |
| Fragrance, Beauty, Makeup | Yes (bottle height) | Yes |
| Food (package size) | Yes | Yes |
| Beverages (container height) | Yes | Yes |
| Home Decor, Furniture | Yes (W/H/D) | Yes |
| Supplements | Yes (container height) | Yes |
| Pet Accessories | Yes (L/W) | Yes |
| Eyewear | mm -- unchanged | No |
| Watches | mm -- unchanged | No |
| Apparel (size/fit selects) | No cm fields | No |
| Footwear (EU size input) | No cm unit | No |
| Tech (freeform) | No unit | No |
| Jeans (waist/length numbers) | No unit | No |

### UI Detail

The toggle is a tiny pair of buttons styled like a segmented control:
```
[cm] [in]
```
Placed inline after the "OPTIONAL" badge, before the collapse chevron. Approximately 60px wide, matching the existing muted text style.

### Files changed
1. `src/lib/productSpecFields.ts` -- add `placeholderImperial` to SpecField, add imperial placeholders to all cm-unit fields
2. `src/components/app/product-images/ProductSpecsCard.tsx` -- add unit toggle state and swap unit/placeholder based on selection
