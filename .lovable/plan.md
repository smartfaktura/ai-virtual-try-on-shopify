

# Fix Generation State Contamination Between Rapid Generations

## Problem
When a user starts a new generation immediately after a previous one, the old polling loop is never cancelled. Two polling loops run simultaneously — both calling `setCompletedJobs()` — causing the counter to show results from the previous generation (e.g., "39 of 24 images completed", 163% progress).

**Root cause in `handleGenerate`** (ProductImages.tsx line 508):
- Resets `completedJobs`, `expectedJobCount`, etc.
- Does NOT cancel the previous `pollingRef.current` timer
- Does NOT clear the old `jobMap`
- `startPolling` creates a new loop, but the old one is still firing

## Fix

### File: `src/pages/ProductImages.tsx`

**At the start of `handleGenerate` (after the `canAfford` check, ~line 510), add a full reset:**

```typescript
// Cancel any in-flight polling from a previous generation
if (pollingRef.current) { clearTimeout(pollingRef.current); pollingRef.current = null; }
setJobMap(new Map());
```

This ensures:
1. The old polling loop is stopped before the new one starts
2. The old jobMap is cleared so `totalJobs` (which reads `jobMap.size`) shows 0 until the new jobs are enqueued
3. No stale `completedJobs` values leak from the previous poll cycle

**Also clamp the display values in `ProductImagesStep5Generating.tsx` to prevent >100% even if a race condition slips through:**

Line 83: Cap `pct` at 100:
```typescript
const pct = effectiveTotal > 0 ? Math.min(100, Math.round((completedJobs / effectiveTotal) * 100)) : 0;
```

Line 151: Cap `completedOk` display:
```typescript
`${Math.min(completedOk, effectiveTotal)} of ${effectiveTotal} image${effectiveTotal !== 1 ? 's' : ''} completed`
```

## Files Changed
- `src/pages/ProductImages.tsx` — cancel old polling + clear jobMap at start of `handleGenerate`
- `src/components/app/product-images/ProductImagesStep5Generating.tsx` — clamp display values as safety net

