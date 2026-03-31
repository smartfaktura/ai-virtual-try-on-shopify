

## Add Time Estimate to Batch Progress View

The batch progress section (Product Listing Set with 9 variations) is missing the time estimate because it only shows "X of Y done · Z images ready" — the estimate only appears inside `QueuePositionIndicator`, which requires `activeJob` to be non-null. When jobs are queued but none are processing yet, `activeJob` is null so no estimate appears.

### Fix

**File: `src/pages/Generate.tsx` (~line 4221-4222)**

Add a time estimate line below the progress bar, similar to `MultiProductProgressBanner`. Calculate based on total jobs × per-job estimate (12s for Pro/high quality, 4s for standard since jobs run in parallel).

```
// After the Progress bar (line 4222), add:
<div className="flex items-center justify-between text-xs text-muted-foreground">
  <span>Est. ~{lowEst}-{highEst} {unit} for {totalJobs} {variationLabel}s</span>
  <span>{Math.round(doneCount / totalJobs * 100)}%</span>
</div>
```

The estimate calculation:
- `estimatePerImage = (quality === 'high') ? 12 : 4`
- `totalEstSeconds = batchState.totalJobs * estimatePerImage`
- Format as seconds if < 60s, otherwise minutes (matching MultiProductProgressBanner logic)

This ensures the batch progress view always shows a time estimate, regardless of whether `activeJob` is available.

