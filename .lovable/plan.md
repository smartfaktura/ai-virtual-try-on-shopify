

## Fix "Skip waiting & view results so far" showing with zero results

### Problem
The button on the Step 5 generating screen appears after 60 seconds whenever generation isn't done — even when **zero** images have actually completed. Clicking it sends the user to results with nothing to show.

Current logic (`ProductImagesStep5Generating.tsx`, line 98):

```ts
const showCancelButton =
  (elapsed >= 30 && halfComplete && completedJobs < effectiveTotal)
  || (elapsed >= 60 && completedJobs < effectiveTotal);
```

The second branch ignores `completedOk` entirely, so it shows the button even when nothing usable exists.

### Fix
Require **at least one successful (non-failed) completion** before the button can appear, and tighten the copy so the label always matches reality.

### Changes (single file: `src/components/app/product-images/ProductImagesStep5Generating.tsx`)

1. **Gate visibility on real results**
   ```ts
   const hasAnyResults = completedOk >= 1;
   const showCancelButton =
     hasAnyResults &&
     completedJobs < effectiveTotal &&
     (
       (elapsed >= 30 && halfComplete) ||  // fast path: 50%+ done
       elapsed >= 60                        // slow path: at least 1 result + 60s
     );
   ```

2. **Always show an accurate count in the label**
   - When `nearComplete` (≥90%): `View {N} completed results` (default variant)
   - Otherwise: `View {N} result{s} so far` (outline variant)
   - Drop the misleading generic "Skip waiting & view results so far" wording entirely — the count is always shown.

3. **No changes** to:
   - Slow warning (`elapsed >= 180`) — still useful even with 0 results
   - Failed-jobs summary
   - Phase headlines, progress bar, team messages

### Result
- 0 completed → button hidden, user keeps waiting (with slow warning after 3 min if applicable)
- 1+ completed and slow → button appears with honest count: "View 1 result so far"
- Near done → "View 7 completed results"

No DB or other component changes.

