## Fix blurry images in "Built for every…" grid on category pages

### Why it looks bad
The grid on `/ai-product-photography/activewear` (and the other 9 category pages — same component) renders each tile in a 4-column grid. On desktop (~1314 CSS px) each tile is ~280 CSS px wide, which is ~560 device px on retina.

The current code requests a **480px-wide, server-cropped** version as the base `src`:
```
getOptimizedUrl(resolved, { width: 480, height: 640, quality: 80, resize: 'cover' })
```
That's below the rendered device size, so browsers upscale → soft / blurry. It also re-crops on the server, which the project memory explicitly warns against ("Never use `width` param — causes server-side crop zoom").

The `srcSet` caps at 640px, which is also too low for retina at 240–280 CSS px.

### Plan
Edit only `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`, lines 146–149:

1. Replace the base `src` to be quality-only (no `width`, no `resize`) so the original aspect-correct image is the fallback:
   ```
   getOptimizedUrl(resolved, { quality: 82 })
   ```
2. Bump the `srcSet` widths so retina tiles get a sharp source. Keep the 3:4 aspect (matches the `aspect-[3/4]` container) so no extra crop happens beyond what the original asset already is:
   ```
   getResizedSrcSet(resolved, { widths: [480, 720, 960, 1200], aspect: [3, 4], quality: 82 })
   ```
3. Update `sizes` to reflect actual layout (3 cols on mobile, 4 cols on ≥sm, max ~280px on lg):
   ```
   sizes="(min-width: 1024px) 280px, (min-width: 640px) 24vw, 32vw"
   ```

Nothing else changes — no layout, copy, or other components touched. This matches the "Image Optimization No-Crop" memory: quality-only for the displayed src, widths only via `srcSet` for retina selection.

### Out of scope
- Hero collage tiles, motion grid, feed showcase — already addressed in prior turns.
- Underlying asset quality (these are catalog images; nothing to do at source).