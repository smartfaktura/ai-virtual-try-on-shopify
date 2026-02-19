

## Fix: Accurate Model Label in Activity Cards

### Root Cause
Two issues found:

1. **"Pro Model" badge and hint are hardcoded** in `WorkflowActivityCard.tsx` — every processing job shows "Pro Model" regardless of actual quality or model used.

2. **Try-On always uses Pro model** on the backend (required for identity preservation), which is correct. But the user selected "Standard" quality, so the UI should explain *why* Pro model is being used.

### Generation Timeline (your last job)
| Step | Time |
|------|------|
| Job created | 14:57:52 |
| Processing started | 14:57:52 (instant, no queue wait) |
| AI generation call | ~171 seconds (Pro model) |
| Completed | 15:00:43 |

The entire ~3 minutes was spent on the AI image generation itself. The Pro model (`gemini-3-pro-image-preview`) is inherently slower than Standard — this is expected behavior, not a bug. Try-On forces Pro model for identity preservation regardless of quality setting.

### Changes

#### 1. Make Model Badge Dynamic in WorkflowActivityCard
**File: `src/components/app/WorkflowActivityCard.tsx`**

The batch group already carries `job_type` and quality info from the queue payload. Use it to determine the correct label:

- If `job_type === 'tryon'`: Show "Pro Model" badge (always Pro for identity)
- If quality is `'high'`: Show "Pro Model" badge
- Otherwise: Show "Standard" badge or no model badge at all

Replace the hardcoded "Pro model — est. ~60-120s per image" text (line 101-104) with dynamic text:
- Pro model jobs: "Pro model — est. ~60-120s per image"
- Standard model jobs: "Standard model — est. ~15-30s per image"

Replace the hardcoded "Pro Model" badge (lines 123-129) with a conditional:
- Only show "Pro Model" when the job actually uses Pro model
- Show nothing or "Standard" for standard quality non-try-on jobs

#### 2. Pass Quality/Job Type Through BatchGroup
**File: `src/lib/batchGrouping.ts`**

Ensure the `BatchGroup` type carries `job_type` and `quality` from the queue jobs so `WorkflowActivityCard` can read them. If not already present, add these fields to the group.

#### 3. Update QueuePositionIndicator Pro Model Hint
**File: `src/components/app/QueuePositionIndicator.tsx`**

The `getProModelHint` function (line 35-38) currently returns "Using Pro model" only when meta is null. Fix it to check actual quality and model presence:
- Show hint when `meta.quality === 'high'` or `meta.hasModel` (which forces Pro)
- Remove the null-meta fallback that incorrectly assumes Pro

### Files to Edit
- `src/components/app/WorkflowActivityCard.tsx` — dynamic model badge and timing hint
- `src/lib/batchGrouping.ts` — pass quality/job_type to batch groups (if not already)
- `src/components/app/QueuePositionIndicator.tsx` — fix Pro model hint logic

