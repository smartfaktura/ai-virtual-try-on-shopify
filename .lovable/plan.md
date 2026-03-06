

## Show All Multi-Product Jobs in Workflows Activity

### Problem
When starting a multi-product Virtual Try-On (e.g., 2 products), only 1 job appears in the Workflows Activity section. This is because the current architecture enqueues products **sequentially** — only the first product's job is sent to the database. The next product is enqueued client-side only after the first completes. If the user navigates away from the Generate page, pending products are lost.

### Solution: Enqueue All Products Upfront
Change the multi-product flow to enqueue **all products' jobs at once** when the user clicks Generate. The server's existing concurrency limits will process them one at a time, but all jobs will be visible in the `generation_queue` table immediately.

### Changes

**1. `src/pages/Generate.tsx` — Multi-product enqueue logic (~lines 750-806)**

Replace the single-product `handleTryOnConfirmGenerate` flow in multi-product mode:
- When `isMultiProductMode`, loop through **all** products in `productQueue` and call `enqueue-generation` for each (using direct fetch, not the hook's `enqueue` which tracks only one job)
- Store all returned job IDs in a new state: `multiProductJobIds: Map<string, string>` (product ID → job ID)
- Reserve credits for all products upfront (the edge function already handles per-job credit reservation)
- For single-product mode, keep the existing flow unchanged

**2. `src/pages/Generate.tsx` — Results collection (~lines 808-870)**

Replace the sequential auto-advance logic:
- Instead of watching a single `activeJob`, poll all job IDs in `multiProductJobIds`
- When each job completes, store its results in `multiProductResults`
- When ALL jobs are completed (or failed), aggregate and show results
- Remove the `setTimeout` auto-advance logic and `multiProductAutoAdvancing` state

**3. `src/hooks/useGenerationQueue.ts` — No changes needed**

The hook continues to work for single-product mode. Multi-product mode will use direct API calls to enqueue and a separate polling mechanism.

**4. `src/pages/Generate.tsx` — New multi-product polling**

Add a `useEffect` that polls all `multiProductJobIds` every 3 seconds when in multi-product generating mode:
- Query `generation_queue` for all job IDs in one request
- Update `multiProductResults` as each completes
- Track progress: `completedCount / totalCount` for the progress bar
- Handle failures gracefully (skip failed, continue collecting completed)

### What this fixes
- All product jobs appear immediately in Workflows Activity (each with its own product name)
- Jobs are persisted in the database, so navigating away doesn't lose the queue
- The batch grouping in `batchGrouping.ts` will naturally group them since they share the same `workflow_id` but have different `product_name` values — each product gets its own activity card

### Credit handling
Each `enqueue-generation` call reserves credits independently. If the user doesn't have enough credits for all products, the later enqueue calls will return 402 and we'll show which products couldn't be queued.

