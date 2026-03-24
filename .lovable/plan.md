

# Fix Category-to-Scene Mapping Accuracy

## Problem
The `CATEGORY_SCENE_MAP` has inaccurate mappings. For example, `jewelry` maps to `surface` which includes scenes like "Wooden Kitchen Surface" and "Wooden Table" — completely wrong for jewelry. Several other categories have similar mismatches.

## Analysis of Current Scene Categories Available

| Scene Category | Example Scenes | Good For |
|---|---|---|
| `clean-studio` | White Studio, Gradient Backdrop, Minimalist Platform, Shadow Play, Color Backdrop, Raw Concrete, Warm Wood Grain, Linen & Fabric | Everything — universal |
| `surface` | Marble Surface, Wooden Table, Linen Textile, Terrazzo Surface | Beauty, food, home — NOT jewelry/fashion |
| `flat-lay` | Styled Flat Lay | Accessories, cosmetics |
| `editorial` | Warehouse Loft (on-model) | Fashion only |
| `studio` / `lifestyle` / `streetwear` | On-model poses | Fashion only |
| `living-space` | Japandi Shelf, Mid-Century Console | Home & decor |
| `botanical` | Botanical Arrangement | Beauty, fragrances, supplements |
| `bathroom` | Bathroom scenes | Beauty, fragrances |
| `kitchen` | Kitchen scenes | Food |
| `outdoor` | Stone Path, etc. | Sports, home |

## Corrected Mappings

```typescript
const CATEGORY_SCENE_MAP: Record<string, string[]> = {
  fashion:     ['studio', 'lifestyle', 'editorial', 'streetwear'],
  beauty:      ['clean-studio', 'botanical', 'bathroom', 'surface'],
  fragrances:  ['clean-studio', 'botanical', 'bathroom'],
  jewelry:     ['clean-studio', 'flat-lay'],                        // FIXED: removed 'surface' (no wooden tables for rings)
  accessories: ['clean-studio', 'flat-lay', 'surface'],             // surface ok for bags/sunglasses
  home:        ['living-space', 'clean-studio', 'botanical', 'outdoor'],
  food:        ['surface', 'kitchen', 'clean-studio'],
  electronics: ['clean-studio'],                                     // FIXED: removed 'surface' (no rustic wood for tech)
  sports:      ['lifestyle', 'streetwear', 'outdoor', 'clean-studio'],  // FIXED: added clean-studio fallback
  supplements: ['clean-studio', 'botanical', 'surface'],
};
```

Key fixes:
- **Jewelry**: Only `clean-studio` + `flat-lay` — marble/wood kitchen surfaces make no sense for rings and necklaces
- **Electronics**: Only `clean-studio` — tech products need clean, modern backgrounds
- **Sports**: Added `clean-studio` as fallback so there are enough scenes to fill 8 slots

## Changes

### `src/components/app/freestyle/FreestyleQuickPresets.tsx`
- Update the `CATEGORY_SCENE_MAP` object with corrected mappings (lines 11-22)

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — fix category-to-scene mappings

