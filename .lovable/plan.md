## Goal
Replace the Material Swap success view (post-generation) with a layout matching `/app/generate/product-images` (Step 6 Results). Remove the redundant product thumbnail and the "RE-RENDER…" eyebrow.

## Changes — `src/pages/MaterialSwap.tsx` (success branch only, lines ~415–595)

Only touches the `genAllDone && genCompletedCount > 0` state. The generating/in-progress view stays unchanged.

1. **Header (drop the floating product image + eyebrow)**
   - Remove the 24×24 product thumbnail block (lines 420–424).
   - Remove the uppercase product-title eyebrow (lines 426–428).
   - Remove the `RE-RENDER THE EXACT PRODUCT…` text (this is the prompt body bleeding through — it should not be shown).
   - New header:
     - `h1`: `Your visuals are ready` (text-2xl sm:text-3xl font-semibold tracking-tight)
     - subtitle: `{N} image{s} generated successfully` (text-sm text-muted-foreground)

2. **Results grid** — match Product Images Step 6:
   - Group under a single row: product name + `Badge` showing `{N} images` (uses existing `productTitle`).
   - Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3`.
   - Each tile: rounded-xl border card, image fills using `aspectRatio` from `job.ratio` (replace `:` with `/`), `ShimmerImage` with `object-contain`, hover scale.
   - Bottom strip: scene/material label + small ratio badge when mixed ratios.
   - Top-right hover download button (existing per-tile download, keep current `buildFileName` naming).
   - Click opens existing `ImageLightbox` (unchanged).

3. **Actions card** — wrap action buttons in a `Card` / `CardContent` flex row, matching Step 6:
   - `Generate More` (outline + `RefreshCw` icon) — same handler as today.
   - `Download All (N)` (outline + `Archive` icon, `Loader2` while running) — same `downloadDropAsZip` call.
   - `View in Library` (outline + `Download` icon) — same handler.
   - Keep failed-count helper line above the card when `genFailedCount > 0`.

4. **SEO title**: change to `Your visuals are ready` for the success state (was `Your re-skinned product`). Generating-state title unchanged.

5. **Imports**: add `Card`, `CardContent`, `Badge`, `ShimmerImage`, `RefreshCw`, `Archive`, `Loader2`; drop unused after refactor (e.g., the standalone `productUrl` thumbnail no longer needed in success view — keep import if still used elsewhere in the file).

## Out of scope
- Generating/progress view, materials/upload steps, prompt logic, pricing, backend, lightbox component.
- Product Images page itself — only Material Swap is touched.
