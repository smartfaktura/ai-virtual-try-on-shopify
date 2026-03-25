

# Add Time Estimate and Progress to Brand Model Loading State

## Problem
The current `BrandedLoadingState` shows rotating tips and team avatars but no time estimate, elapsed timer, or progress bar — making it feel like a black box.

## Solution
Enhance `BrandedLoadingState` to include:
1. **Elapsed timer** counting up from generation start
2. **Estimated time range** (~30-50 seconds for single model, ~60-90 seconds for 3 public variations)
3. **Progress bar** that fills smoothly based on elapsed vs estimate (caps at 95% to avoid false "done")
4. Accept a `isPublicMode` prop to adjust the estimate (3 variations take longer)

## File: `src/pages/BrandModels.tsx`

### Changes to `BrandedLoadingState`
- Add `isPublicMode?: boolean` prop
- Add `elapsed` state with a 1-second interval timer
- Calculate estimate: **~40s** for single model, **~90s** for 3 public variations
- Show `"Est. ~30-50 sec"` or `"Est. ~1-2 min"` text
- Show elapsed as `"Xs elapsed"` in mono font
- Add a `<Progress>` bar below the tips that fills based on `elapsed / estimate`, capped at 95%
- Show overtime message if elapsed exceeds estimate

### Pass prop from `UnifiedGenerator`
- Pass `isPublicMode={makePublic}` when rendering `<BrandedLoadingState />`

