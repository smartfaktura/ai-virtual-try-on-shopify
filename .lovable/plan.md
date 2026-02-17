

## Show Pro Model Indicator + Realistic Time Estimates for Workflow Generations

### Problem

The WorkflowActivityCard on the Workflows page only shows raw elapsed time (e.g., "Generating... 30s") with no context about expected duration. Since workflow generations use the Pro model (which takes 60-120 seconds per image), users see "30s" and think something is wrong when the generation hasn't finished yet.

### Solution

Add a "Pro Model" badge and a realistic time estimate to the WorkflowActivityCard so users know longer times are expected.

### Changes

**1. `src/components/app/WorkflowActivityCard.tsx`**

- Add a "Pro Model" badge (small purple/violet badge) next to the "Processing" status badge for processing jobs
- Add a subtitle line under the elapsed timer: "Pro model -- estimated ~60-120s per image"
- The estimate scales with the number of jobs in the batch group (e.g., 4 jobs = "~4-8 min total")

**2. `src/components/app/QueuePositionIndicator.tsx`**

- Update the `estimateSeconds` default fallback from `45` to `90` (better reflects Pro model reality)
- When `meta` is absent (workflow jobs don't pass meta), use 90s as baseline instead of 45s
- Add a complexity hint for when no meta is available: "Using Pro model for best quality"

### Visual Result

```text
Before:
  [Spinner] Workflow generation -- Ring        PROCESSING
            Generating... 34s

After:
  [Spinner] Workflow generation -- Ring        PRO MODEL  PROCESSING
            1 of 4 batches complete -- ~60-120s per image
```

### Technical Notes

- The "Pro Model" badge uses the existing Badge component with a custom violet color class
- Time estimate is hardcoded to ~60-120s per image since all workflow generations use the Pro model
- No database or edge function changes needed

