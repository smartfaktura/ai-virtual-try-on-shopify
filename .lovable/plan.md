
Root cause confirmed: this is not related to the site being published or unpublished. The issue is in the client enqueue logic.

What I found:
- `src/pages/Generate.tsx` has multiple workflow enqueue paths.
- Only one of them has partial retry logic.
- The main multi-product workflow path still sends repeated `enqueue-generation` requests with no shared pacing and no single-batch wake pattern.
- `src/hooks/useGenerationBatch.ts` also enqueues workflow jobs with no pacing/retry helper.
- So when a workflow creates 10+ jobs, some paths still hit the backend too aggressively and can trigger rate-limit / failure / cancel cascades.

Plan

1. Create one shared enqueue helper for all multi-job flows
- Add a small shared utility that:
  - retries transient errors (`429`, `502`, `503`, network failures)
  - uses exponential backoff + jitter
  - enforces a minimum gap between requests (use the existing try-on pattern as the baseline, around 300ms)
  - supports `skipWake: true` for batched requests
  - returns structured failure info without spamming toasts mid-batch

2. Apply it to every workflow-related multi-job path
- Update the multi-product workflow path in `Generate.tsx` that currently uses raw `fetch`
- Update the multi-combo workflow path in `Generate.tsx` so it also gets pacing, not just retry
- Update `useGenerationBatch.ts` so chunked workflow batches use the same helper instead of raw `fetch`
- Update multi-image upscale path too, since it follows the same burst-risk pattern

3. Use one wake after the whole batch
- For batched workflow requests, enqueue each job with `skipWake: true`
- After the loop completes, send a single `wakeOnly: true` request
- This prevents repeated queue wake-ups during large batches

4. Keep user feedback calm during batching
- Do not show toast errors for intermediate retryable failures
- Only show one final actionable toast if the batch truly cannot enqueue more jobs
- Preserve the current progress UI instead of bouncing users back unnecessarily

5. Add consistent pacing rules
- Never use parallel enqueueing for workflow jobs
- Keep explicit sequential enqueueing
- Add the same timing guard across all workflow-style flows so “10+ jobs” behaves predictably everywhere

Files to update
- `src/pages/Generate.tsx`
- `src/hooks/useGenerationBatch.ts`
- likely a new shared utility file such as `src/lib/enqueueGeneration.ts`

Expected result
- Workflow batches will enqueue more slowly but much more reliably
- No burst of 10+ near-simultaneous requests
- Fewer failed/cancelled jobs from rate-limit pressure
- More consistent behavior across product workflow, chunked workflow batches, and other multi-job flows

Technical note
- The key bug is not the queue worker itself; it is that not all frontend workflow paths are using the same throttled enqueue strategy.
- I would standardize all multi-job generation paths around:
  - sequential enqueue
  - ~300ms minimum spacing
  - retry with backoff
  - `skipWake` per job
  - one final `wakeOnly` call
