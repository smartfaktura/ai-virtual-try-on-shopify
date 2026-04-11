

# Make "New" Card Clear About Upload Action

## Problem
The "New" card in the product grid (line 1091-1098 of `ProductImages.tsx`) shows a generic Package icon and just says "New" — unclear what it does.

## Fix — `src/pages/ProductImages.tsx` (lines 1091-1098)

Replace the current card content:
- **Icon**: Change `Package` → `Upload` (already imported)
- **Label**: "New" → **"Upload Image"**
- **Subtitle**: Add small text below: **"or paste / import URL"**
- **Visual**: Add a dashed inner border box inside the aspect-square to create a recognizable "drop zone" look, matching the pattern already used in `ProductImagesStep1Products.tsx`

The card structure stays the same (aspect-square button, opens `AddProductModal`). Only the icon, text, and inner styling change — ~10 lines.

