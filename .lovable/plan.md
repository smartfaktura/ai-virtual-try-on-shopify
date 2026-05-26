
# Generating + Results polish (Product Swap)

Four small, scoped changes — all inside the generating/results view of `src/pages/ProductSwap.tsx`. No backend, no hook changes.

## 1. Real product thumbnails on the generating screen

Today each product chip shows the generic `<Package>` icon. Swap it for the actual product image (32×32 rounded, object-cover) sitting at the left of the chip. The status icon (✓ / spinner / clock) stays at the right edge so users still see progress at a glance.

```text
[ img ]  Red Cat-Eye Glasses    4:5   ⟳
```

Requires the product's `image_url` at chip render time. Plumb it through:
- `SwapJobInfo` in `src/hooks/useProductSwap.ts` gains a `productImageUrl?: string`.
- Hook fills it from the `products[]` it already iterates.
- Generating view reads `job.productImageUrl` and renders an `<img>` (with `getOptimizedUrl` quality-only); fall back to `<Package>` only if the URL is missing.

## 2. Generating screen — light visual tidy

Small refinements (no redesign):
- Bump chip padding slightly and align the thumbnail/text/status on a clean baseline.
- Replace the standalone `<Package>` glyph inside each chip with the new thumbnail.
- Tighten the status pill: status icon moves to the **right** of the row, ratio badge sits beside it.
- Make the ratio label show only when ≠ default (already done) and use a subtle muted chip instead of inline text.
- Active (processing) chip gets a thin animated ring on the thumbnail to make progress feel alive.

That's it — no layout reshuffle, same Sophia/team line, same progress bar, same "Continue in background" link.

## 3. Results grid — drop the product icon overlay

The bottom gradient overlay on each result tile currently shows `<Package> productTitle  ratio`. Remove the Package glyph entirely so the image breathes. Keep the product title (truncated) and ratio chip; the title alone is enough context, and the icon was visual noise on top of the actual photo.

## 4. "Download all" button when there are 2+ results

When `resultUrls.length >= 2`, render a secondary button next to the existing "Swap more products" / "View in Library" CTAs:

```text
[ Sparkles  Swap more products ]   [ ⬇  Download all ]   [ View in Library ]
```

Behavior: triggers each download sequentially (small 150 ms stagger so the browser doesn't drop concurrent downloads). Reuses the same `?download=` trick already used in the lightbox handler — no new dependency, no ZIP bundling for v1 (keeps it instant; per existing project pattern bulk ZIP export is a heavier feature reserved for the asset-export flow).

If there is only 1 result, the button is hidden (the lightbox already has single-image download).

## Out of scope

- No change to the wizard (Steps 1–3) or any generation logic.
- No new design tokens.
- No ZIP packaging (download-all is parallel browser downloads, matching existing patterns).

## Files touched

- `src/pages/ProductSwap.tsx` — generating chips, results overlay, new "Download all" button.
- `src/hooks/useProductSwap.ts` — add `productImageUrl` to `SwapJobInfo` + populate it.

## Effort

~20–30 minutes.

---

One thing I want to confirm before building: by **"also improve"** do you mean only the small visual tidies listed in §2 above, or is there something specific on the generating screen you'd like changed (e.g. team-member line, progress copy, "Continue in background" placement)? If the §2 tidies cover it, I'll proceed.
