
## What’s actually wrong (based on logs + DB)
- We have **queue rows stuck in `processing`** (example: `b4bffd24-...`), while `generate-freestyle` logs show it **generated a fallback image and saved it**, but the queue row **never got marked `completed`**.
- That means the generation function can **finish the expensive part** (AI + upload + DB insert) but still **fail to run the final “completeQueueJob” update**—likely due to:
  1) **Edge runtime shutdown / time limit** happening right after image generation, before the final queue update runs
  2) **429 retry/fallback path** not finalizing early, so completion happens “later” and is vulnerable to shutdown

Also, the start delay is amplified by:
- `enqueue-generation` calling `process-queue` with **2× 5s timeouts**, which frequently times out on cold starts and leaves jobs idle longer.

“nanobanan” note:
- There is **no “nanobanan” model** referenced anywhere in the frontend or `generate-freestyle`. The image model selection is internal (Gemini Flash/Pro). The issue is not “sending the wrong model,” it’s **queue finalization reliability**.

---

## Goal (final fix)
Make Freestyle queue jobs **always** transition out of `processing`:
- If an image gets generated (primary or fallback), the queue row must be updated **immediately** (not at the end).
- Increase queue timeout headroom so cleanup doesn’t kill legitimate slow runs.
- Remove trigger timeouts that delay queue pickup.

---

## Implementation plan

### 1) Fix slow start: make queue trigger fire-and-forget
**File:** `supabase/functions/enqueue-generation/index.ts`

- Replace the current `triggerQueue()` retry loop (2 attempts with `AbortSignal.timeout(5000)`) with **one fire-and-forget fetch** that is not awaited and has no timeout.
- Reason: the goal is only to “wake” the dispatcher; waiting for a response is unnecessary and fails during cold boots.

**Expected effect:** “Your job is next in queue…” should start faster and more consistently.

---

### 2) Fix “generation happens but queue never completes” (core reliability patch)
**File:** `supabase/functions/generate-freestyle/index.ts`

#### 2.1 Extend timeout_at at the start of a queue job
- When `isQueueInternal && body.job_id`, immediately update `generation_queue.timeout_at` to **now + 10–12 minutes**.
- Reason: current DB function `claim_next_job()` sets `timeout_at = now() + 5 minutes`, which is too tight for cold boots + 429 + fallback.

#### 2.2 Finalize early for queue mode (especially since queue caps to 1 image)
Queue mode already forces:
- `effectiveImageCount = 1`
- `maxRetries = 1`

So we should:
- After the **first successful upload** (whether primary model or fallback), call:
  - `completeQueueJob(job_id, user_id, credits_reserved, images, requestedCount=1, errors, payload, ...)`
  - and then **return immediately** (or break out and finalize right away).
  
This removes reliance on “end-of-function” completion, which is the part most likely to be skipped if the runtime shuts down.

#### 2.3 Add a progress/heartbeat queue update after upload (belt-and-suspenders)
Even before marking completed, after each successful upload:
- Update `generation_queue.result` with partial progress:
  - `{ images: [...], generatedCount, requestedCount }`
- This makes the system resilient even if it dies before final completion—`cleanup_stale_jobs()` already has logic to treat partial results as partial success.

#### 2.4 Fix the 429 fallback success path to also finalize immediately
Right now fallback success logs show the image gets saved, but the queue row can remain `processing`.
- In the `status===429` catch block, when fallback succeeds, in queue mode:
  - immediately call `completeQueueJob(...)` and exit.

#### 2.5 Reduce 429 backoff to switch models faster
In `generateImage()`, change:
- `setTimeout(3000 * (attempt + 1))`
to:
- a flat **1500ms** (or even 0–500ms for queue mode)
Reason: rate limits are often per-model; waiting longer doesn’t help as much as switching models.

#### 2.6 Add correlation logs (job_id + queue internal)
Add logs at start:
- `job_id`, `user_id`, chosen model, refCount
Add logs when:
- uploading finished
- queue updated (completed/failed)

This makes future debugging immediate.

---

### 3) Verify end-to-end with real queue rows (no UI guessing)
Use backend queries/logs to confirm the fix:

1. Create a Freestyle generation from the UI (product + scene is fine).
2. Confirm the queue row transitions:
   - `queued → processing → completed`
3. Confirm `generation_queue.result.images[0]` exists and matches an entry in `freestyle_generations.image_url`.
4. Force a few runs quickly to increase chance of 429 and verify fallback still completes the queue row.

---

## Files to change
- `supabase/functions/enqueue-generation/index.ts`
- `supabase/functions/generate-freestyle/index.ts`

No database migrations required (we’ll extend `timeout_at` from the generation function itself).

---

## Why this solves “not generating”
Even if the AI call succeeds and the image is uploaded, the user currently sees “stuck” because the **queue status never flips**. Early completion + heartbeat updates ensure:
- If image exists → queue completes (or at least has partial result)
- No more “generated but UI never receives completion”
