# Refine Step 5 generating state

Scope: `src/components/app/product-images/ProductImagesStep5Generating.tsx` only. Make the loading view feel calmer and more premium.

## Changes

1. **Drop the bottom "About X–Y minutes... Safe to leave..." info row**
   - Remove the `Info` icon + `bottomCopy` paragraph (and the now-unused `lowMin` / `highMin` / `bottomCopy` logic).
   - Replace with a single muted line under the percentage: `Safe to leave — results land in your library`. No icon, no time estimate, no period (per memory rule on single-sentence subtitles).

2. **Finishing phase: drop scene thumbnails entirely**
   - In the `finishing` phase, only the Sparkles icon shows (already implemented) — confirm no thumbnail row sneaks in.
   - Also hide scene thumbnails during `finishing` headline — currently correct, just verify after edit.

3. **Minor polish for premium feel**
   - Tighten spacing: keep `space-y-8` but reduce the visual chrome — no other structural changes.
   - Remove `Info` import once unused.

## Out of scope
- No changes to progress math, phase logic, team messages, per-product progress, slow warning, or view-results button.
- No changes to other pages using similar copy (TextToProduct stays as-is).
