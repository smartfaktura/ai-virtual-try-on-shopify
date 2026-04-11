

# Fix: Product Reference Thumbnails & Upload UX

## Changes

### 1. Fix image cropping — use `object-contain` instead of `object-cover`

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

Three places where reference preview images use `object-cover` need to change to `object-contain` with a subtle background:

- **Line 1874** (single-product reference preview, 24×24 box): `object-cover` → `object-contain`
- **Line 1921** (multi-product reference preview, 14×14 box): `object-cover` → `object-contain`

Add `bg-muted/30` to the container so the contain-fit image has a clean background rather than empty white space.

### 2. Improve multi-product upload UX

In the multi-product grid (lines 1910–1932), improve clarity:

- Make product cards slightly larger (from `w-14 h-14` to `w-16 h-16` for upload/preview areas)
- Add a clear "Upload" text label below the upload icon in the empty state button
- Add a colored status indicator: green check badge text "Done" vs muted "Missing" for products without a reference
- Improve the overall card layout with a subtle card border per product so each one feels like a distinct upload target

### 3. Single-product upload button improvement

- Add more descriptive CTA text: "Upload {trigger.label}" with a secondary hint "or drag & drop"
- Make the upload area slightly taller for better click target

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Change `object-cover` → `object-contain` on reference previews; improve upload button UX with labels and status indicators |

