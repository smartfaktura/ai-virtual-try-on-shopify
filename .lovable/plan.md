# Material Swap — Success page polish

Scope: visual + naming improvements on the done-state of `/app/material-swap`. No backend or pipeline changes.

## Changes (all in `src/pages/MaterialSwap.tsx`)

1. **Primary CTA**
   - Rename `Try more materials` → `Generate more`
   - Remove the `Sparkles` icon from the button (no leading icon)

2. **Success header polish** (the `genAllDone && genCompletedCount > 0` block, ~lines 410–426)
   - Replace the tiny 64×64 product thumb on top with a larger 96×96 rounded-2xl tile with subtle border + soft shadow, centered
   - If `productTitle` exists, show it as a small uppercase tracking-wider eyebrow above the H1 (e.g. `LAYLA ARMCHAIR`)
   - Keep H1 `Your re-skinned product` but make subtitle clearer: `{n} new material{s} ready — same shape, lighting and scene`
   - Tighten vertical rhythm (space-y-2 inside the text block, space-y-5 around it)

3. **Result grid polish**
   - Cards: rounded-2xl, thinner border, hover lift via `hover:-translate-y-0.5 hover:shadow-lg`
   - Caption bar: replace the dark gradient overlay with a clean caption strip *below* the image (white/card bg, single line with material label + ratio chip on right) — matches the rest of the app's editorial look
   - Add a small download icon button in the top-right corner of each card (appears on hover) that downloads that single image with proper filename (see step 4)

4. **Filename naming** — use `downloadSingleImage` from `@/lib/dropDownload`
   - Filename pattern: `{productTitle}_{materialLabel}.{ext}` sanitized (replace non-alphanumeric with `_`, collapse repeats)
   - Fallbacks: if no `productTitle` → `material-swap_{materialLabel}`; if no `materialLabel` → `{productTitle}_material_{idx+1}`; if neither → `material-swap_{idx+1}`
   - Apply to:
     - new per-card hover download button (step 3)
     - existing lightbox `onDownload` (replace the manual `?download=` anchor with `downloadSingleImage(url, builtName)`)
   - ZIP download (`Download all`) — keep existing `downloadDropAsZip` but pass `scene_name: job.materialLabel` (already correct) and ensure `product_title` is the actual `productTitle` (already correct). No code change needed here beyond verifying the values; the per-file naming inside the zip already produces `{Product}_{Material}_{n}.ext`.

5. **Secondary action**
   - Keep `View in Library` as outline pill, unchanged
   - Keep `Download all (n)` as outline pill, unchanged copy

## Out of scope
- Step 1/2/3 UI, hook, pricing, prompt, routing, backend
- No new dependencies; only `downloadSingleImage` which already exists in `@/lib/dropDownload`
