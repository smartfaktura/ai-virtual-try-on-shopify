

## Improve Activity Card: Show "X of Y images" with Workflow Name

### Problem
The activity card currently says "X of Y batches complete" which is confusing — users think in terms of **images**, not batches. For single-job groups it just says "Generating…" with no count context. The screenshot shows "Picture Perspectives — Generating... 2m 50s" with no image count.

### Changes (`src/components/app/WorkflowActivityCard.tsx`)

#### Active groups (processing/queued)
- Replace "X of Y batches/styles complete" with **"X of Y images · Generating…"** for multi-job batches
- For single jobs: show **"1 image · Generating…"** instead of just "Generating…"
- Keep the elapsed timer and Pro model estimate line
- Use "images" universally instead of "batches" (except staging workflows keep "styles")

#### Completed groups
- Replace "All X batches complete · images ready" with **"X of X images complete"**

#### Failed groups  
- Replace "X of Y batches failed" with **"X of Y images failed"**

#### Progress bar
- Always show progress bar for multi-image groups (already does), but also show the fraction as text on the bar like "3/8"

### Specific text changes

| State | Current | New |
|-------|---------|-----|
| Multi-job active | "2 of 8 batches complete · 1m 30s" | "2 of 8 images generated · 1m 30s" |
| Single-job active | "Generating… 45s" | "1 image · Generating… 45s" |
| Single-job queued | "Queued · waiting 10s" | "1 image · Queued · waiting 10s" |
| Multi-job completed | "All 8 batches complete · images ready" | "8 of 8 images complete" |
| Multi-job failed | "3 of 8 batches failed" | "3 of 8 images failed" |
| Staging active | "2 of 5 styles complete · 1m" | "2 of 5 styles generated · 1m" |

### File
| File | Change |
|------|--------|
| `src/components/app/WorkflowActivityCard.tsx` | Update progress text for active, completed, and failed groups to show image counts clearly |

