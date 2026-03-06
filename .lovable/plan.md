

## Fix Multi-Product Try-On Settings Step

Three bugs on the settings step when multiple products are selected:

### 1. Preview shows only one product thumbnail
**`src/components/app/TryOnPreview.tsx`** — Add `products?: Product[]` prop. When provided (multi-product mode), show a stacked/scrollable row of product thumbnails instead of a single `Thumb`. Show count badge like "3 products".

### 2. Button says "Generate 1 Try-On Images" instead of total
**`src/pages/Generate.tsx` line ~3214** — Change from `Generate ${imageCount} Try-On Images` to account for multi-product: `Generate ${parseInt(imageCount) * multiProductCount} Try-On Images`.

### 3. Credit breakdown shows "1 image × 16 credits" ignoring product count
**`src/pages/Generate.tsx` lines ~3195-3196** — Update the credit summary text to show total across all products:
- When multi-product: `"{imageCount} images × {productCount} products × {creditsPerImage} credits"`
- Display `creditCost` (which already correctly multiplies by `multiProductCount` on line 1130)

### Changes

**`src/components/app/TryOnPreview.tsx`**:
- Add optional `products` prop (array of Products for multi-product mode)
- When `products` has >1 items, render a mini stack of product thumbnails with a count badge instead of a single thumbnail
- Update description to mention product count

**`src/pages/Generate.tsx`** (settings step, lines ~3193-3216):
- Fix button label: `Generate ${parseInt(imageCount) * multiProductCount} Try-On Images`
- Fix credit breakdown text to show per-product and total math
- Pass `productQueue` to `TryOnPreview` when in multi-product mode (also update the other TryOnPreview instances on model/pose steps)

