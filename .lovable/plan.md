## Problem

When multiple products are selected (e.g., blazer + shoes + bag), the `ZaraOutfitPanel` only resolves conflicts based on the **first** product. This means:
- Only the first product's slot shows as locked with its thumbnail
- Other products' slots appear editable when they should be locked
- Users can't see which product fills which slot

## Fix

### Refactor `ZaraOutfitPanel` to resolve ALL products (ProductImagesStep3Refine.tsx)

Replace the single-product resolution logic (lines 1683-1693) with a multi-product approach:

1. Loop through ALL `selectedProductIds` and call `resolveOutfitConflicts` for each
2. Build a `lockedSlotProducts` map: `slot → { product, analysis }` — one entry per unique locked slot
3. Merge all hidden slots across products
4. Compute available slots as anything not locked or hidden
5. When rendering `OutfitSlotCard`, check `lockedSlotProducts.has(slot)` instead of `resolution.lockedSlot === slot`, and pass the **correct** product's thumbnail/name from the map

Lines affected in `ZaraOutfitPanel`:
- **Lines 1683-1693**: Replace single-product resolution with multi-product loop
- **Lines 1712-1714**: Update slot filtering to use multi-lock map
- **Lines 1730-1753**: Use `lockedSlotProducts.get(slot)` for `locked`, `productThumb`, `productName` per garment slot
- **Lines 1771, 1837-1839**: Same for accessory slots
- **Lines 1743**: Adjust "What's underneath?" hint to check `lockedSlotProducts.has('outerwear')`

### Also update `topLevelResolution` (lines 2038-2046)

The top-level resolution used for the `OutfitPresetBar` above the scene list also only checks the first product. Update it to merge all products' resolutions so the preset bar correctly hides/locks slots.

## Files

- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — Multi-product conflict resolution in ZaraOutfitPanel + topLevelResolution
