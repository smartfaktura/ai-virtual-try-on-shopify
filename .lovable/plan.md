

# Fix: Mirror Selfie Set — Multi-Model + Loading State

## Issues

### 1. Only 1 model generates when 2 are selected
`handleWorkflowGenerate` checks `isSelfieUgc` (line 1064) to enable multi-model iteration, but Mirror Selfie Set uses `isMirrorSelfie` — a separate flag. The multi-model loop never activates for Mirror Selfie.

**Same issue exists in multi-product path** (line 941).

### 2. Loading state missing elapsed time, estimates, and proper image counts
Mirror Selfie with 3 scenes + 1 model uses the `startBatch` path (line 1138), which renders the **batch progress** section (lines 3895-3949). This section lacks:
- Elapsed timer
- Time estimate
- Rotating team member
- It says "0 of 3 done" (referring to jobs), not images

The richer `MultiProductProgressBanner` (with elapsed time, estimates, team member) only shows when `hasMultipleJobs` is true — which requires `multiProductJobIds.size > 1`. The batch path doesn't populate `multiProductJobIds`.

### 3. Subtitle says "variations" but should say total images
"Generating 3 variations" is technically correct but confusing. With 2 models × 3 scenes = 6 images, it should reflect that.

---

## Plan

### File 1: `src/pages/Generate.tsx`

**A. Fix multi-model for Mirror Selfie** (lines 941, 1064)
Change both occurrences of:
```
isSelfieUgc && selectedModels.size > 0
```
to:
```
(isSelfieUgc || isMirrorSelfie) && selectedModels.size > 0
```

**B. Route Mirror Selfie multi-model to multi-job path**
Line 1138 condition: `ratiosToGenerate.length === 1 && framingsToGenerate.length === 1 && !useMultiModelLoop`
Currently `useMultiModelLoop` checks `modelsToGenerate.length > 1`, which now works since fix A makes `modelsToGenerate` include all selected models for Mirror Selfie. No change needed here — fix A is sufficient to make this work.

**C. Fix subtitle text** (line 3860)
When `hasMultipleJobs` or multiple models, show total image count instead of "variations":
```
`Generating ${multiProductJobIds.size || selectedVariationIndices.size} images of "${productTitle}"...`
```

**D. Add `workflowName` prop to MultiProductProgressBanner** (line 3882)
Pass `workflowName={activeWorkflow?.name}` so the banner can show contextual text.

### File 2: `src/components/app/MultiProductProgressBanner.tsx`

**E. Accept and use `workflowName` prop**
- Add `workflowName?: string` to props
- Update initial status text (line 88-90):
  - If `workflowName`: `"Generating X images for {workflowName}..."`
  - Else if `totalProducts > 1`: `"Generating X images for Y products"`
  - Else: `"Generating X images..."`

---

## Summary
- 2 files, ~10 lines changed
- Mirror Selfie multi-model generation fixed by including `isMirrorSelfie` in the model iteration condition
- Progress banner shows workflow name for context
- Subtitle shows total image count instead of confusing "variations" label

