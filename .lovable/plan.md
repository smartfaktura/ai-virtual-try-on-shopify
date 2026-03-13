

## Fix Interior/Exterior Staging: Button Text, Style Count, Progress Tracking

### Problems Found

1. **Button text hardcoded**: Line 3716 says `'Generate 1 Image'` for all interior design cases regardless of how many styles are selected.

2. **Style count hardcoded**: Line 3370 always shows `"1 style selected"` instead of the actual count.

3. **Generating progress**: The batch progress (lines 3912-3932) shows "Image X of Y" but for interior staging it should say "Style X of Y" or "Scene X of Y generating...". The single-job path (lines 3934-3943) has no scene-level progress at all since 3 styles are sent as 1 job.

4. **Activity card**: `WorkflowActivityCard.tsx` line 92 shows `"X of Y batches complete"` — should say "styles" for interior staging. Time estimate (line 104-105) shows per-image but doesn't account for multiple styles in a single job.

### Changes

**`src/pages/Generate.tsx`** (4 fixes):

1. **Line 3370** — Fix hardcoded "1 style selected":
   - Change to `{selectedVariationIndices.size} style{selectedVariationIndices.size !== 1 ? 's' : ''} selected`

2. **Line 3716** — Fix button text:
   - Change from `'Generate 1 Image'` to:
   - `Generate ${selectedVariationIndices.size} Staging Image${selectedVariationIndices.size !== 1 ? 's' : ''}`

3. **Lines 3912-3931** — Batch progress: replace "Image" / "batches" with "Style" when `isInteriorDesign`:
   - `Style ${completed + 1} of ${total} generating...`
   - `All ${total} styles complete`

4. **Lines 3858-3861** — Generating title: already correct ("Creating Interior / Exterior Staging...")

**`src/components/app/WorkflowActivityCard.tsx`** (2 fixes):

1. **Line 86-92** — Activity status text: detect interior staging from `workflow_name` containing "Interior" or "Staging" and show "X of Y styles complete" instead of "X of Y batches complete"

2. **Lines 100-106** — Time estimate: for interior staging batches, show total estimate based on style count (e.g., "est. ~2-4 min for 3 styles")

