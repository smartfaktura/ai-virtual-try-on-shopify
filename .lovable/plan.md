# Refine Step 5 generating state

Scope: `src/components/app/product-images/ProductImagesStep5Generating.tsx` only.

## Changes

1. **Reframe the bottom info line — keep the time estimate, drop the noise**
   - Remove the `Info` icon and the wordy "Safe to leave — results appear in your library" tail.
   - Replace with a single, quiet centered line in `text-xs text-muted-foreground`:
     - Multi-image batch: `Estimated ~{lowMin}–{highMin} min`  (or `~{lowMin} min` when low === high)
     - Single image: `Estimated under a minute`
   - No period (single-sentence subtitle rule). No icon. Centered, sits where the old info row was.
   - Show a smaller, even quieter second line `Safe to leave — we'll save results to your library` only after `elapsed >= 20s` so it doesn't crowd the initial render.

2. **Finishing phase: keep the scene thumbnails (not the sparkle)**
   - Currently the `finishing` branch swaps the thumbnails row for a Sparkles bubble. Remove that branch so scene thumbnails stay visible across all phases (queuing / generating / finishing).
   - Drop the `Sparkles` import if no longer used.

3. **Polish**
   - Remove `Info` import once unused.
   - Keep all existing spacing, progress math, team message, per-product progress, slow warning, and view-results button untouched.

## Out of scope
- No logic changes to phases, estimate math (reuse existing `lowMin`/`highMin`), or other pages.
