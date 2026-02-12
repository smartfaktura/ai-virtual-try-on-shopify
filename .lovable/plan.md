

## Eliminate Generation Timeouts: Decouple Queue from Generation

### The Problem

Currently, `process-queue` does two things in one call:
1. Claims a job from the queue
2. Calls the generation function (e.g., `generate-product`) and **waits** for it to finish

Since edge functions have a ~100s hard limit, and AI image generation can take 30-90s per image (especially with retries), the worker frequently times out before it can record the result. This leaves jobs stuck in "processing" status until the 5-minute cleanup catches them -- causing a bad user experience.

### The Fix: Fire-and-Forget Dispatch

Split the responsibility so each function does one thing:

```text
BEFORE (coupled):
  process-queue: claim job --> call generate-product --> WAIT --> save result
                              (times out here ^)

AFTER (decoupled):
  process-queue: claim job --> fire HTTP call to generate-product --> move on
  generate-product: do AI work --> update generation_queue directly when done
```

### Changes

**1. `supabase/functions/process-queue/index.ts`**
- Change from `await callGenerationFunction(...)` to a fire-and-forget `fetch()` (no await on the response body)
- Remove all result-handling, credit-refund, and generation_jobs insert logic from this function
- The function becomes a lightweight dispatcher that just claims jobs and kicks off generation functions
- Pass `job_id` and `credits_reserved` in the payload so the generation function can update the queue

**2. `supabase/functions/generate-product/index.ts`** (and similarly for `generate-tryon`, `generate-freestyle`, `generate-workflow`)
- At the end of generation, write results directly to `generation_queue` (set status to "completed" or "failed")
- On success: insert into `generation_jobs` for the library
- On failure: refund credits via `refund_credits` RPC
- On partial success: refund unused credits
- Detect queue calls via the `x-queue-internal` header (already exists) and `job_id` in payload

**3. Client-side (`src/hooks/useGenerationQueue.ts`)**
- No changes needed -- it already polls `generation_queue` status, so it will pick up completions naturally

### Why This Fixes Timeouts

- `process-queue` finishes in under 5 seconds (just claim + dispatch)
- Each generation function has its own full 100s budget to complete AI work
- Even if a generation function times out, cleanup_stale_jobs handles it (already exists)
- No cascading failures: one slow job does not block the worker from dispatching others

### Edge Cases Handled

- **Generation function crashes**: The 5-minute `timeout_at` + `cleanup_stale_jobs` catches it and refunds credits (already works)
- **Partial success (freestyle multi-image)**: Generation function handles refund logic directly
- **Concurrent jobs**: No change -- `claim_next_job` uses `FOR UPDATE SKIP LOCKED`

