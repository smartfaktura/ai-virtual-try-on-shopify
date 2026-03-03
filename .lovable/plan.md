

## Fix: Batch Progress Missing Time Estimates

### Problem
When generation splits into multiple batches (e.g., 3 jobs), the UI shows only a bare "Batch 0 of 3 / 0 images ready" with a plain progress bar. There's no time estimate, no elapsed timer, no team messages — all the rich feedback from `QueuePositionIndicator` is hidden because it's only rendered for single-job generations (lines 2888-2896 are gated by `!batchState || batchState.totalJobs <= 1`).

### Fix

**`src/pages/Generate.tsx`** — Enhance batch progress section (lines 2874-2886):

1. **Add time estimate** — Calculate total estimated time based on batch count × per-job estimate (~70-100s for Pro model). Show "Est. ~3-6 min" and elapsed timer, matching the single-job indicator style.

2. **Show active job indicator** — Find the currently processing job from `batchState.jobs` and display a mini `QueuePositionIndicator` for it below the batch progress bar. This gives users the familiar spinning loader, elapsed time, and team messages for the job currently in progress.

3. **Better batch label** — Change "Batch 0 of 3" to "Image 1 of 3 generating..." with a completed count, so users understand progress in terms of results, not abstract batches.

4. **Add rotating team member** — Reuse the team avatar row from `QueuePositionIndicator` so the batch view feels equally polished.

### Implementation detail

```tsx
{/* Batch progress - enhanced */}
{batchState && batchState.totalJobs > 1 && (
  <div className="w-full max-w-md space-y-3">
    {/* Batch header with time estimate */}
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">
        Image {batchState.completedJobs + 1} of {batchState.totalJobs}
        {!batchState.allDone && ' generating...'}
      </span>
      <span className="text-muted-foreground">{batchState.readyImages} images ready</span>
    </div>
    <Progress value={...} className="h-2" />
    
    {/* Time estimate + elapsed (new) */}
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Est. ~{lowEst}-{highEst} seconds per image</span>
      <span>·</span>
      <span className="font-mono">{elapsed}s elapsed</span>
    </div>
    
    {/* Active job QueuePositionIndicator (new) */}
    {activeJob && <QueuePositionIndicator job={activeJob} />}
    
    {/* Failed count */}
    {batchState.failedJobs > 0 && <p className="text-xs text-amber-600">...</p>}
  </div>
)}
```

Also remove the `(!batchState || batchState.totalJobs <= 1)` gate so the `QueuePositionIndicator` can render alongside batch progress when an `activeJob` exists.

### Files changed — 1
- `src/pages/Generate.tsx`

