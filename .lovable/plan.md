# Refine Step 5 generating state

Scope: `src/components/app/product-images/ProductImagesStep5Generating.tsx` only.

## Changes

1. **Reframe the bottom info line — keep the time estimate, drop the noise**
   - Remove the `Info` icon and the wordy "Safe to leave — results appear in your library" tail.
   - Replace with a single, quiet centered line in `text-xs text-muted-foreground`:
     - Multi-image batch: `Estimated ~{lowMin}–{highMin} min`  (or `~{lowMin} min` when low === high)
     - Single image: `Estimated under a minute`
   - No period (single-sentence subtitle rule). No icon. Lighter tracking, centered, sits just below the progress block area as today.
   - Keep "Safe to leave" sentiment as a second, even smaller muted line: `Safe to leave — we'll save results to your library` — only show it once `elapsed >= 20s` so it doesn't crowd the initial state.

2. **Finishing phase: no scene thumbnails, just the sparkle**
   - Already correct in code (Sparkles icon shown when `phase === 'finishing'`). Verify no regression after edits — no other change needed here.

3. **Polish**
   - Remove `Info` import once unused.
   - Keep all existing spacing, progress math, team message, per-product progress, slow warning, and view-results button untouched.

## Out of scope
- No logic changes to phases, estimates math (reuse existing `lowMin`/`highMin`), or other pages.
