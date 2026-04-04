

# Fix: State Cleanup Between Generations + Stale Recommendations

## Problems Found

### 1. No state reset between generations
When clicking "Generate More" on the results page (line 717), only `results` and `jobMap` are cleared. These generation tracking states are NOT reset:
- `completedJobs` (stays at previous count)
- `enqueuedCount` / `expectedJobCount`
- `completedJobIds` / `failedJobIds`

Additionally, when navigating back to step 1 from results, `selectedSceneIds` and `details` persist from the previous generation, causing stale pre-selections.

### 2. Stale "Recommended" categories in Step 2
In `ProductImagesStep2Scenes.tsx` line 166, `expandedCategories` is initialized via `useState(() => new Set(relevantCatIds))`. This initializer only runs on first mount. When products change (bag replaces fragrance), the `recommendedCollections` useMemo updates correctly, but the expanded accordion state stays stale. More importantly, since Step2 is lazy-loaded and conditionally rendered (`step === 2`), React may keep it mounted within the Suspense boundary (lines 646-721 render all steps 2-6 inside one Suspense).

The fix: sync `expandedCategories` with `relevantCatIds` via a `useEffect`.

### 3. Last generation failures
Edge function logs show Gemini blocked image generation with `blockReason: "OTHER"` for multiple jobs. The system correctly refunded credits and marked jobs as failed. This is a content moderation false positive from Gemini, not a code bug. The polling/timeout logic handled it correctly.

## Plan

### File 1: `src/pages/ProductImages.tsx`

**A. Add a `resetGenerationState` function** that clears all generation-related state:
```typescript
const resetGenerationState = useCallback(() => {
  setJobMap(new Map());
  setCompletedJobs(0);
  setResults(new Map());
  setExpectedJobCount(0);
  setEnqueuedCount(0);
  setCompletedJobIds(new Set());
  setFailedJobIds(new Set());
  if (pollingRef.current) clearTimeout(pollingRef.current);
}, []);
```

**B. Fix "Generate More" handler** (line 717):
Change from partial reset to full reset:
```typescript
onGenerateMore={() => { resetGenerationState(); setStep(2); }}
```

**C. Add a "Start Fresh" option on results** that also clears product/scene selections:
```typescript
// Could also be added alongside "Generate More"
```

### File 2: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**Sync expanded categories when products change** - add a `useEffect` after line 166:
```typescript
useEffect(() => {
  setExpandedCategories(new Set(relevantCatIds));
}, [relevantCatIds]);
```

This ensures when the user selects a bag (after previously generating for fragrance), the expanded/recommended categories update to show bags-accessories instead of fragrance.

## Files to Update

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Add `resetGenerationState`, fix "Generate More" handler |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Add `useEffect` to sync `expandedCategories` with `relevantCatIds` |

## Note on Generation Failures
The last generation failed because Gemini's content moderation blocked the prompts (`blockReason: "OTHER"`). The system handled this correctly: credits were refunded and jobs marked as failed. No code fix needed for this -- it's a model-side content filter issue.

