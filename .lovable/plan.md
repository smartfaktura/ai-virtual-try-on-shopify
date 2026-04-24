1. Update `src/components/home/HomeHero.tsx` so the hero marquee stops using width-based image transforms. For every hero card, switch `getOptimizedUrl(...)` to quality-only optimization, because the current `width: 420` request is causing server-side crop/zoom on these larger showcase images.

2. Replace the broken original-photo source with the uploaded `Original-2.jpg` added to the project assets, then import and use that local file in the hero card. This avoids the missing-image issue currently visible on `/home`.

3. Change the original card styling to match the other cards instead of using the special cream container and bottom arrow caption. Keep it visually consistent with the rest of the grid, and add a small top-right badge on the image such as `Original`.

4. Keep the existing scene list, labels, marquee structure, and workflow logic unchanged. This is an asset/rendering-only fix: no backend, no generation flow, no database changes.

Technical details
- Root cause of the zoom: `getOptimizedUrl(src, { width: 420, ... })` in `HomeHero.tsx` is using a width transform on storage images. In this codebase, full-bleed/carousel images should use quality-only optimization to avoid render-end cropping.
- Root cause of the broken original card: the current original image points to a remote storage path instead of the uploaded file the user wants displayed.
- Planned component adjustments:
  - import uploaded image from `src/assets/...`
  - use `getOptimizedUrl(src, { quality: ... })` for remote scene previews only
  - render original image directly from local asset
  - replace bottom `↑ Original photo` caption with a top-right label badge
  - remove the special `object-contain + cream panel` treatment so the original card follows the same card style as the others

After approval, I’ll apply exactly those UI-only changes.