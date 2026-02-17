

## Fix: One Image Per Queue Job for Workflows

### Problem

Currently, the batch system groups up to 4 variations into a single queue job. Each job then generates those 4 images sequentially inside one edge function call. With the Pro model, this takes 3-5 minutes per image, meaning a 4-image job can easily hit the 5-minute timeout and get killed by the watchdog.

### Solution

Change `MAX_IMAGES_PER_JOB` from `4` to `1` in the batch hook. This means each variation becomes its own independent queue job. Each job only needs to generate 1 image, so it completes well within the timeout.

Benefits:
- No more timeout issues -- each job finishes in 1-2 minutes
- Better progress visibility -- the batch activity UI shows "1 of 4 complete", "2 of 4 complete", etc.
- Partial failures are isolated -- one bad image doesn't kill the whole batch
- The existing batch grouping UI we just built will show clear per-image progress

### Changes

| File | Change |
|------|--------|
| `src/hooks/useGenerationBatch.ts` | Line 6: change `MAX_IMAGES_PER_JOB = 4` to `MAX_IMAGES_PER_JOB = 1` |

That is the only change needed. The rest of the system (enqueue, process-queue, generate-workflow, batch grouping UI) all handle N jobs naturally already.

