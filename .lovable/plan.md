

## Investigation: Why Selfie/UGC Set (3 images) Is Slow vs Perspectives (20 images)

### Root Cause

The two features use fundamentally different architectures:

**Perspectives (fast, 20 images):** Each angle is enqueued as a **separate job** via `enqueue-generation` with `jobType: 'freestyle'`. Each job generates exactly 1 image in its own edge function invocation. 20 jobs run with natural parallelism through the queue system — multiple can be dispatched concurrently by `process-queue`.

**Workflow / Selfie UGC Set (slow, 3 images):** All 3 images are generated **sequentially inside a single edge function call** (`generate-workflow`). Each image uses `google/gemini-3-pro-image-preview` (forced because `body.model?.imageUrl` is present) with a 150s per-image timeout + 2 retries. Worst case: 3 images × 150s = 450s, which far exceeds the ~150s platform runtime limit. Even in the happy path, if each image takes ~50s, that's 150s total — right at the edge.

Additionally, each generated image is a base64 blob that gets uploaded to storage inline, adding more time per image.

### Fix: Split Workflow Jobs Into 1-Image-Per-Job (Like Perspectives)

Refactor `generate-workflow` so that when it receives a multi-image request, **each variation is enqueued as a separate queue job** — the same pattern Perspectives uses. This way:
- Each image gets its own edge function invocation with a full runtime budget
- Multiple images can generate in parallel via `process-queue`
- No single function call needs to survive long enough for all images

### Implementation

**1. Change enqueue flow on the client side (`Generate.tsx` / `useGenerationBatch.ts`)**
- When a workflow has N variations selected, enqueue N separate jobs (1 image each) instead of 1 job with N images
- Each job payload includes a single `selected_variations: [i]` entry
- Use `batch_id` to group them for the UI (same pattern as Perspectives)

**2. Simplify `generate-workflow/index.ts`**
- Remove the sequential loop over multiple variations (it will only ever process 1 variation per invocation)
- Keep the wall-clock guard as a safety net but it should rarely trigger now
- Remove `maxImages` slicing since each job is 1 image

**3. Update progress/polling**
- The existing `MultiProductProgressBanner` and queue polling already handle multiple jobs per batch
- Credit calculation stays the same (N credits for N jobs)

**4. Keep backward compatibility**
- If `selected_variations` has multiple entries (legacy), still process them sequentially with the existing loop
- New enqueue path always sends 1 variation per job

### Files Changed
- `src/pages/Generate.tsx` — split workflow enqueue into per-variation jobs
- `src/hooks/useGenerationBatch.ts` — ensure batch splitting works for workflow type
- `supabase/functions/generate-workflow/index.ts` — minor cleanup, no functional changes needed since it already handles `selected_variations` of any size

### Impact
- 3-image Selfie/UGC Set will complete in ~50s (parallel) instead of ~150s+ (sequential)
- Eliminates timeout risk for workflow generation entirely
- Same architecture as Perspectives, which already proves this pattern works at 20 images

