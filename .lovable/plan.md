

# Fix Upload Card Style & Text in Product Images Step 1

## Problems Identified
1. **Upload card has a different border style** — uses `border-primary/30` (colored dashed-like) while product cards use `border-transparent`. This makes it stand out awkwardly.
2. **Upload card background** uses `bg-primary/5` tint in the image area, while product cards have plain image areas with `object-cover`.
3. **Text is generic** — "Upload product image / Drop, click, or paste" should be changed to "Create from Product Image / Upload, drop, click or paste" per user request.

## Changes — `src/pages/ProductImages.tsx`

### 1. Fix upload card border & background (lines 1104-1137)
- Change border from `border-primary/30 hover:border-primary hover:bg-primary/5` to `border-dashed border-border hover:border-primary/40` — matching the "Add New" card style
- Change the image-area background from `bg-primary/5` to `bg-muted/30` — neutral like product cards
- Make the upload icon and text use `text-muted-foreground` instead of `text-primary` for a subtler look, with hover to primary

### 2. Update text (lines 1134-1137)
- Change "Upload product image" to "Create from Product Image"
- Change "Drop, click, or paste" to "Upload, drop, click or paste"

### Summary
Single file edit to `src/pages/ProductImages.tsx`. Align the upload card visually with product cards and update the copy.

