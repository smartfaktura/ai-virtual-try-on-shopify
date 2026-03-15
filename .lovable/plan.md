

## Improve Admin Scene Saving + Category Updates

### Summary
Three changes: (1) rename "Clean Studio" to "Product Studio", (2) add new "Product Editorial" category, (3) redesign the AddSceneModal to include a scene-type toggle (On-Model vs Product) and show only relevant categories for each type.

### Changes

**1. Update `PoseCategory` type** (`src/types/index.ts`)
- Add `'product-editorial'` to the union type

**2. Update `poseCategoryLabels`** (`src/data/mockData.ts`)
- Rename `'clean-studio'` → label `'Product Studio'` (keep the key as `clean-studio` to avoid breaking existing data)
- Add `'product-editorial': 'Product Editorial'`

**3. Update `filterCategoryMap`** (`src/components/app/freestyle/SceneSelectorChip.tsx`)
- Add `'product-editorial'` to the `product` filter array

**4. Redesign `AddSceneModal`** (`src/components/app/AddSceneModal.tsx`)
- Add a **scene type toggle** at the top: "On-Model" vs "Product" (two big selectable cards or radio-style chips)
- Based on selection, show only relevant categories:
  - On-Model: `studio`, `lifestyle`, `editorial`, `streetwear`
  - Product: `clean-studio` (labeled "Product Studio"), `surface`, `flat-lay`, `product-editorial`
- Remove irrelevant categories (`kitchen`, `living-space`, `bathroom`, `botanical`) from the modal since the filter tabs no longer surface them
- Keep outdoor if needed or remove — will remove to match the simplified 3-tab system
- Update `CATEGORIES` constant to be derived from the scene type selection

**5. Update `AddSceneModal` categories display**
- Show human-readable labels from `poseCategoryLabels` instead of raw slugs on the category chips

### Files modified
| File | Change |
|---|---|
| `src/types/index.ts` | Add `product-editorial` to `PoseCategory` |
| `src/data/mockData.ts` | Rename clean-studio label, add product-editorial label |
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Add `product-editorial` to product filter |
| `src/components/app/AddSceneModal.tsx` | Add scene type toggle, filter categories by type, use readable labels |

