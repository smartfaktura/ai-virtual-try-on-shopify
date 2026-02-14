

## Batch Generation: Max 4 Images per Job, Auto-Split for Larger Selections

### Overview

Set a hard limit of **4 images per single generation job**. When a user selects more than 4 total images (scenes x angles), the system automatically splits the request into multiple jobs, enqueues them sequentially, and tracks progress across all jobs.

This keeps each job well within the edge function timeout (~60s per job vs 300s limit) and delivers a smoother experience.

### Example

User selects 8 scenes, front-only angle = 8 images total:
- Job 1: scenes 1-4 (4 images)
- Job 2: scenes 5-8 (4 images)

User selects 6 scenes, all angles (x3) = 18 images total:
- Job 1: scene 1 (3 images)
- Job 2: scene 2 (3 images)
- Job 3: scene 3 (3 images)
- Job 4: scene 4 (3 images)
- Job 5: scene 5 (3 images)
- Job 6: scene 6 (3 images)

### Changes

#### 1. Edge Function: Lower Max to 4

**File: `supabase/functions/generate-workflow/index.ts`**
- Change `maxImages = 20` to `maxImages = 4` (line 423)
- This is a safety ceiling; the frontend already splits before enqueuing

#### 2. New Hook: `src/hooks/useGenerationBatch.ts`

Creates and manages multiple queue jobs from a single user action:

- Accepts the full payload + list of selected variation indices
- Calculates `scenesPerChunk = floor(4 / angleMultiplier)` (e.g., 4 for front-only, 1 for all-angles)
- Splits `selectedVariationIndices` into chunks
- Calls `enqueue-generation` for each chunk sequentially (prevents credit race conditions)
- Tracks all job IDs and polls them
- Reports batch-level progress: "2 of 4 batches complete"
- Aggregates all result images into a single array when all jobs finish
- Handles partial failures (some jobs fail, others succeed)

#### 3. Frontend: Split and Track in Generate Page

**File: `src/pages/Generate.tsx`**

- Import and use `useGenerationBatch` hook
- In `handleWorkflowGenerate()`:
  - If `workflowImageCount <= 4`, enqueue as a single job (current behavior, no change)
  - If `workflowImageCount > 4`, use the batch hook to split and enqueue multiple jobs
- Update the "generating" step UI:
  - Show "Batch 2 of 4 complete..." progress for multi-job generations
  - Show total images generated so far: "8 of 18 images ready"
  - Keep existing team avatar messages rotating
- Update results step to merge images from all batch jobs

#### 4. Free User Scene Limit (3 scenes max)

**File: `src/pages/Generate.tsx`**

- Read user plan from credits context (`plan` field)
- For `free` plan: cap scene selection at 3
- Show upgrade nudge text: "Free plan: up to 3 scenes. Upgrade for more."
- Disable "Select All" for free users or cap at 3
- Paid users: no scene cap (but each job still max 4 images)

### Chunk Size Logic

```text
MAX_IMAGES_PER_JOB = 4
angleMultiplier = front: 1, front-side: 2, front-back: 2, all: 3

scenesPerChunk = floor(4 / angleMultiplier)
  - front only:   4 scenes/job (4 images)
  - front+side:   2 scenes/job (4 images)
  - front+back:   2 scenes/job (4 images)
  - all angles:   1 scene/job  (3 images)
```

### User Experience Flow

1. User selects 8 scenes + front angle, clicks "Generate"
2. Toast: "Creating 2 generation batches..."
3. Credits deducted for all batches upfront
4. Generating screen shows: "Batch 1 of 2 -- 4 images ready"
5. When all complete, results screen shows all 8 images together
6. If a batch fails, partial results are shown with a warning

### Files Summary

| File | Change |
|------|--------|
| `supabase/functions/generate-workflow/index.ts` | `maxImages = 4` |
| `src/hooks/useGenerationBatch.ts` (new) | Batch orchestration hook |
| `src/pages/Generate.tsx` | Auto-split logic, batch progress UI, free user cap |

