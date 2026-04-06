

# Fix: Missing Bottom & Shoes Outfit Controls

## Problem

The Outfit Lock Panel conditionally hides the **Bottom** and **Shoes** sections based on the detected product category's default config. For categories like `beauty-skincare`, `fragrance`, and `makeup-lipsticks`, these defaults intentionally omit bottom/shoes pieces — so `showBottom` and `showShoes` are `false`.

However, when the user selects on-model scenes (full-body editorial, catalog, etc.), they need full outfit control regardless of product category. A beauty brand shooting a model holding a serum still needs to define what pants and shoes the model wears.

Your session confirms `primaryCategory` resolved to `beauty-skincare`, which hides Bottom and Shoes entirely.

## Fix

### Change 1: Always show Bottom and Shoes when on-model scenes are selected

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

In `OutfitLockPanel`, change the visibility logic from category-default-dependent to always-on when the panel is visible (since the panel only renders when `hasPersonBlock` is true, meaning on-model scenes exist):

```typescript
// BEFORE (lines 1386-1387):
const showBottom = !!defaultConfig.bottom?.garment;
const showShoes = !!defaultConfig.shoes?.garment;

// AFTER:
const showBottom = true;
const showShoes = true;
```

This ensures that whenever the Outfit & Model section is visible (meaning on-model scenes are selected), users always have full control over top, bottom, and shoes — regardless of product category.

### Change 2: Ensure defaults populate for previously-hidden pieces

When `defaultConfig` has no `bottom` or `shoes` (e.g., for beauty categories), the `PieceField` renders empty. Add fallback defaults so users see sensible starting values:

In the same `OutfitLockPanel`, update the outfit initialization logic:

```typescript
// In the useEffect that sets defaults (line 1324-1331):
useEffect(() => {
  const categoryChanged = prevCatRef.current !== cat;
  prevCatRef.current = cat;
  if (!details.outfitConfig || categoryChanged) {
    // Ensure bottom and shoes always have a default
    const config = { ...defaultConfig };
    if (!config.bottom) {
      config.bottom = { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' };
    }
    if (!config.shoes) {
      config.shoes = { garment: 'sneakers', color: 'white', material: 'leather' };
    }
    update({ outfitConfig: config });
  }
}, [defaultConfig]);
```

### Change 3: Update built-in presets to include bottom and shoes for all categories

In `getBuiltInPresets`, ensure the base presets always include bottom/shoes so preset cards work correctly:

```typescript
function getBuiltInPresets(category: string, isMale = false): OutfitPreset[] {
  let base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[category];
  if (!base) return [];
  // Ensure complete outfit for preset generation
  if (!base.bottom) base = { ...base, bottom: { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' } };
  if (!base.shoes) base = { ...base, shoes: { garment: 'sneakers', color: 'white', material: 'leather' } };
  // ... rest of preset generation
}
```

## Files Modified

| File | Change |
|---|---|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Always show Bottom/Shoes when outfit panel is visible; add fallback defaults for missing pieces; ensure presets include full outfit |

