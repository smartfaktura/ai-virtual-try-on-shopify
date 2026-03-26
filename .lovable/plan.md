

# Fix: Progress Bar Starting at 0% — Add Minimum Progress Floor

## Problem
Progress bars across the app (Generate page, WorkflowActivityCard, MultiProductProgressBanner) show **0%** until the first image completes. For a 6-image batch taking ~1-2 minutes, the user stares at 0% for a long time, which feels broken.

## Solution
Add a **minimum progress floor** based on elapsed time, so the bar starts moving immediately and never shows 0% once generation has started.

### Approach: Time-based minimum floor
When `completedProgress` is 0%, use elapsed time against the estimate to show gradual progress up to a cap (e.g., 15%), then hand off to real completion-based progress once images start arriving.

```
displayProgress = max(completedProgress, timeBasedFloor)
timeBasedFloor = min(elapsed / estimatedTotal * 15, 15)  // crawl to 15% max
```

This means:
- At 0s: ~2-3% (immediate visual feedback)
- At 30s of ~90s estimate: ~5%
- At 60s: ~10%
- Once first image completes (e.g., 17% real): real progress takes over
- Never shows "0%"

### Files to change

**1. `src/components/app/MultiProductProgressBanner.tsx`** (Generate page progress)
- Replace raw `generatingProgress` with a computed value that applies the time-based floor
- Change display from `{generatingProgress}%` to the floored value
- Add minimum 2% immediately when component mounts

**2. `src/components/app/WorkflowActivityCard.tsx`** (Workflows page)
- Apply same floor to `progressPct` calculation on line 57
- Use the existing `elapsed` timer already available in the component
- Ensure it never displays "0/5" with 0% bar — show "Starting…" or minimum bar

**3. `src/components/app/QueuePositionIndicator.tsx`** (single-job indicator)
- Already has time-based progress (good) — no changes needed, it already starts moving immediately

### No backend changes needed

