## Fixes for `/app/product-swap`

Frontend only — `src/pages/ProductSwap.tsx`.

### 1. Scene step — card caption (no more "Library · May 30")

Currently when a job has no product title we fall back to the date. Replace with product name + image format.

- Add `ratio` to the `generation_jobs` select; add `aspect_ratio` to the `freestyle_generations` select.
- Extend `LibraryPickerItem` with `subtitle: string` (e.g. `"1:1"`, `"4:5"`, or `"Freestyle"` when no ratio).
- Title resolution:
  - Jobs: prefer `user_products.title` → `product_name` → `workflows.name` → `scene_name` → `"Generated image"`. Never the date.
  - Freestyle: `"Freestyle"` (or first 40 chars of prompt as today).
- Subtitle = aspect-ratio string (e.g. `1:1`, `4:5`, `16:9`); when missing, show workflow/source label (`Freestyle`, workflow name) so the second line is never blank.
- Render the existing second `<p>` slot with the new `subtitle` instead of the non-breaking-space placeholder.

### 2. Products step — consistent thumbnails (match `/app/generate/product-images`)

Currently `aspect-square bg-muted flex items-center justify-center p-2` + `object-contain` makes cards look random (cutouts on grey, letterboxed photos, etc.). ProductImages uses a clean full-bleed `object-cover` thumbnail — apply the same so every card looks uniform.

- Replace the inner wrapper with `aspect-square bg-muted overflow-hidden` (no padding, no flex centering).
- `ShimmerImage` becomes `w-full h-full object-cover` (drop `max-w-full max-h-full object-contain`).
- Keep the existing 52px caption strip, `CheckCircle` overlay, and selection ring untouched.
- "No image" fallback stays but stretches full-bleed (`w-full h-full flex items-center justify-center`).

### Out of scope

- No DB, hook, search, or grid-layout changes.
- Library picker thumbnails (scenes) keep `object-cover` as today — only the caption text changes.
