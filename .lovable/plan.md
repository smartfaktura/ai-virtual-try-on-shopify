

# Per-Product Scene Assignment in Product Visuals

## Problem
Currently, scene selection is a **single shared pool** — every selected scene is applied to every product during generation. If a user selects shoes + a dress, both get "Sole Detail" and "Full Length Flow" scenes, producing nonsensical images.

## Solution: Per-Product Scene Picker (Tab-Based)

When multiple products from **different categories** are selected, Step 2 (Shots) switches to a **tabbed layout** where each product (or category group) has its own scene selection. When all products share the same category, the current shared picker remains.

### Data Model Change

Replace the flat `selectedSceneIds: Set<string>` with a per-product map:

```text
// New state shape
perProductScenes: Map<string, Set<string>>
// key = product ID, value = selected scene IDs for that product

// Backward compat: derive flat set for steps 3-5
allSelectedSceneIds = union of all per-product sets
```

### UI Changes (Step 2 — `ProductImagesStep2Scenes.tsx`)

1. **Single category**: Keep current shared picker (no change).
2. **Multiple categories**: Show product tabs at the top (thumbnail + name). Each tab shows only the recommended category for that product, plus "Explore more" for other categories.
3. A summary bar below tabs shows: `"Product A → 4 shots · Product B → 6 shots"`.

### Generation Changes (`ProductImages.tsx`)

The generation loop (lines 405-543) already iterates `for (const product of selectedProducts)` then `for (const scene of selectedScenes)`. Change the inner loop to use only the scenes assigned to that specific product:

```text
for (const product of selectedProducts) {
  const productScenes = perProductScenes.get(product.id) || allSelectedSceneIds;
  const scenesForProduct = selectedScenes.filter(s => productScenes.has(s.id));
  for (const scene of scenesForProduct) { ... }
}
```

### Credit Calculation (`sceneVariations.ts`)

Update `computeTotalImages` to accept the per-product map and sum per-product scene counts instead of `products.length × scenes.length`.

### Affected Files

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Replace `selectedSceneIds` state with `perProductScenes` map; derive flat set for downstream; update generation loop and credit calc call |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Add tabbed UI for multi-category; accept `perProductScenes` prop; emit per-product changes |
| `src/components/app/product-images/ProductImagesStickyBar.tsx` | Update scene count display to show per-product summary when in multi-category mode |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | Show per-product scene breakdown in review |
| `src/lib/sceneVariations.ts` | Update `computeTotalImages` to accept per-product scene map |
| `src/components/app/product-images/types.ts` | No change needed — `SceneSelection` type already exists but we'll use the simpler Map approach |

### UX Details

- **Tab design**: Horizontal scroll strip with product thumbnails (40×40 rounded) + product name + badge showing selected count
- **"Apply to all" shortcut**: Button to copy current product's scene selection to all other products
- **Smart defaults**: When switching to multi-category mode, auto-assign recommended scenes per product category
- **Single category shortcut**: If all products share the same category, skip tabs entirely — use current shared picker

