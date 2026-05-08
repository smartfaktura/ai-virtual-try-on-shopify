## Problem

`process-queue` dispatches generation jobs **one at a time**, awaiting the full HTTP response from `generate-workflow` before moving to the next job. Since `generate-workflow` takes ~30s per image, a batch of 8 jobs takes ~4 minutes instead of ~30 seconds.

The enqueue side is fine — all 8 jobs in your last batch were queued within 1 second.

## Solution

Modify `process-queue/index.ts` to dispatch jobs in **parallel batches** instead of sequentially:

1. **Claim multiple jobs at once** — claim up to 6 jobs in a loop (without awaiting dispatch), then fire all dispatches concurrently using `Promise.allSettled`.

2. **Don't await the generation response** — change `dispatchGenerationFunction` to only wait for the HTTP connection to be accepted (a brief 5-second timeout for immediate rejections like 403/500), not for the full generation to complete. The generation functions already self-complete by updating the queue directly.

3. **Reduce stagger** — drop the 1-second sleep between dispatches to 200ms (just enough to avoid thundering herd on the AI gateway).

### Technical changes

**`supabase/functions/process-queue/index.ts`**:
- Claim jobs in a batch loop (up to 6 at a time)
- Fire all dispatches with `Promise.allSettled` — no sequential awaiting
- Use a 5s `AbortController` timeout on the dispatch fetch so we only wait for connection acceptance, not full generation
- Reduce stagger from 1000ms to 200ms between individual fetch calls within a batch
- After dispatching a batch, immediately loop to claim the next batch (within the 55s runtime window)

No changes needed to `generate-workflow` or `enqueue-generation` — the generation functions already update queue status independently.

### Expected result

8 jobs dispatched in ~2 seconds (instead of ~4 minutes), all running concurrently on the AI gateway. Total batch completion time drops from ~4 min to ~30-40 seconds.
