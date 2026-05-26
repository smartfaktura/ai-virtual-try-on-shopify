Move the **Enhance to 2K / 4K** button to the **last position** in the action list and rename it to **Enhance to 4K** in both modals.

### Files
- `src/components/app/LibraryDetailModal.tsx` — move the Enhance button below "Generate Video" (after Swap Product → Generate Video → Enhance). Rename label to `Enhance to 4K` (keep the "Re-enhance (currently …)" variant when already upscaled).
- `src/components/app/product-images/ResultDetailModal.tsx` — move the Enhance button to be the last action (after Generate Video). Rename to `Enhance to 4K`.

No other behavior changes.