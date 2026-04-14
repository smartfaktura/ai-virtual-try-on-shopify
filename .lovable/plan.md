
Fix the remaining zoomed/cropped thumbnails in the Short Film References step by updating the selected-reference preview row, not the library dialog.

What’s actually wrong
- The library pickers were already corrected, but the small previews shown after selection in `src/components/app/video/short-film/ReferenceUploadPanel.tsx` still use one generic thumbnail template for every role:
  - fixed `h-16 w-16`
  - `object-cover`
  - `getOptimizedUrl(..., { width: 128, quality: 60 })`
- That combination crops products and models in the References step, which is why they still look zoomed even after the picker fixes.

Implementation plan

1. Update selected reference thumbnails in `ReferenceUploadPanel.tsx`
- Replace the current single preview `<img>` block inside `sectionRefs.map(...)` with role-specific rendering.

2. Match product preview behavior to product flows
- For `product` references:
  - keep a square card
  - remove forced width from `getOptimizedUrl`
  - use a white/muted background
  - switch from `object-cover` to `object-contain`
- This mirrors how product previews are shown in the product image flows, which avoids “zoomed in” crops for packshots and accessories.

3. Match model preview behavior to model flows
- For `model` references:
  - use a portrait thumbnail (`aspect-[3/4]`) or a compact variant of the model card styling
  - keep `object-cover`
  - remove forced width from `getOptimizedUrl`
- This matches how models are framed elsewhere and prevents face crops caused by stuffing model images into the same square crop as products.

4. Keep other roles sensible
- `scene`, `style`, `logo` can stay compact, but should also avoid unnecessary width forcing.
- Scene refs without URLs should keep the existing placeholder treatment.

5. Preserve current UX
- Keep remove button behavior, names under thumbnails, wrapping layout, and upload/dropzone behavior unchanged.
- Only change thumbnail framing/rendering so the step remains visually stable.

Recommended code shape
- Add a small helper like `renderReferencePreview(ref, section)` or a tiny local component to avoid inline conditional clutter.
- Use role-based classes such as:
  - product: square + `object-contain`
  - model: `aspect-[3/4]` + `object-cover`
  - fallback: square + `object-cover`

Files to change
- `src/components/app/video/short-film/ReferenceUploadPanel.tsx`

Expected result
- Product thumbnails in `/app/video/short-film` → References will stop looking zoomed and will match product preview behavior.
- Model thumbnails in the same step will use proper portrait framing instead of being cramped into the same square crop.
- The “selected references” area will finally match the rest of the app, not just the picker dialogs.
