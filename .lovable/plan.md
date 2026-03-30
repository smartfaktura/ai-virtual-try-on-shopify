

## Fix: Incorrect Progress Counts in Multi-Job Batch Generation

### Problem
The screenshot shows "41 of 8 images done" and "60 images" in the subtitle — three different numbers for the same batch. Two distinct bugs:

1. **Wrong total**: `totalExpectedImages` for `uses_tryon` workflows (including Selfie/UGC Set) uses `multiProductCount * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount` but **omits `selectedVariationIndices`** and `angleMultiplier`. This produces a much smaller number than the actual jobs created.

2. **Wrong completed count**: `completedCount` = `multiProductResults.size` counts completed *keys* in the result map, but the polling loop uses composite keys (`${productId}_${modelId}_${varIdx}_${ratio}_${framing}`), so `completedCount` can exceed `totalImages` when the total is wrong.

3. **Estimation confusion**: The estimate line says "Est. ~1-2 min for 8 images" but the subtitle says "60 images" — the estimate uses the wrong `totalImages` value, making it look broken.

### Fix

**1. Simplify `totalExpectedImages` — derive from actual job count**

Instead of re-computing the matrix formula (which is error-prone and duplicates logic), use `multiProductJobIds.size` as the single source of truth for total images. The job map already contains exactly one entry per expected image, since each job produces one image in the matrix workflows.

In `Generate.tsx` (line 4179-4185), replace the complex formula:
```tsx
totalExpectedImages={multiProductJobIds.size}
```

This is always correct because the job creation loop creates exactly one job per image in the matrix.

**2. Guard completed count to never exceed total**

In `MultiProductProgressBanner.tsx` (line 93-94), clamp `completedCount`:
```tsx
const safeCompleted = Math.min(completedCount, totalImages);
```

Use `safeCompleted` in the display string to prevent "41 of 8" even if there's a counting mismatch.

**3. Fix the subtitle formula to match**

In `Generate.tsx` (line 4150), the subtitle already computes correctly for try-on. But for consistency, also use `multiProductJobIds.size` when available:
```tsx
// When jobs are already enqueued, use actual count
const actualImageCount = multiProductJobIds.size > 0 ? multiProductJobIds.size : /* existing formula */;
```

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Replace `totalExpectedImages` prop with `multiProductJobIds.size`; sync subtitle count |
| `src/components/app/MultiProductProgressBanner.tsx` | Clamp `completedCount` to never exceed `totalImages` |

### Impact
- Progress will always show correct "X of Y images done" matching the actual number of queued jobs
- Estimation will use the correct total for time calculations
- No more impossible states like "41 of 8"

