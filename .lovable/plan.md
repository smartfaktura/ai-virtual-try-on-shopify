
Do I know what the issue is? Yes.

### What is actually broken
1. **Only ~28/32 jobs are being enqueued**: your backend `enqueue_generation` SQL has a **burst limit of 25/min (Pro)**, so large batches get rate-limited.
2. **Wrong progress text** (“27 of 2 products”): progress is counting completed **jobs**, but label says **products**.
3. **Only 1 image shown in results**: after multi-job aggregation finishes, a single `activeJob` completion effect can overwrite `generatedImages` with one job’s result.
4. **Grouping metadata is fragile**: parsing composite keys with `_` breaks for values like `close_up` (and IDs containing `_`), so grouping labels become unreliable.
5. **No finalizing handoff UX** between “done” and results.

### Implementation plan
1. **Fix enqueue rate-limit behavior (backend)**
   - Update `enqueue_generation` SQL (new migration):
     - Raise Pro burst threshold (so 32-image batches are supported).
     - Return `retry_after_seconds` when burst-limited.
   - Update `supabase/functions/enqueue-generation/index.ts`:
     - Treat “Too many requests” as **429** (not 402 credit-like error).

2. **Make client enqueue fully resilient**
   - In `src/pages/Generate.tsx` retry logic:
     - Use `retry_after_seconds` + jitter for silent retries.
     - Keep retrying until queued (or safe overall timeout), so batch doesn’t stop at 20-something.
     - Never show “not enough credits” for rate-limit responses.

3. **Replace brittle composite-key parsing**
   - In `Generate.tsx`, store per-job metadata by `jobId` (`productId`, `productName`, `ratio`, `framing`, etc.).
   - Build result labels and groups from metadata, not `split('_')`.

4. **Fix result overwrite + progress correctness**
   - In `Generate.tsx`:
     - Prevent single-job watcher from running during/after multi-product completion handoff.
     - Clear/reset queue watcher state before applying aggregated multi-job results.
   - In `MultiProductProgressBanner.tsx`:
     - Show both **jobs progress** and **products progress** correctly (no more “27 of 2 products”).

5. **Add completion handoff state**
   - Add a short “Finalizing results, redirecting…” stage (1–2s) before showing results.
   - Keep UI stable and avoid abrupt state jumps.

6. **Scale behavior for many users**
   - Queue architecture is correct (`SKIP LOCKED` claim pattern).
   - Add a small dispatch cap in `process-queue` per run to avoid worker stampedes under multi-user bursts while keeping throughput stable.

### Files to update
- `src/pages/Generate.tsx`
- `src/components/app/MultiProductProgressBanner.tsx`
- `supabase/functions/enqueue-generation/index.ts`
- `supabase/functions/process-queue/index.ts`
- `supabase/migrations/<new_migration>.sql`

### Technical details
- Verified from backend data: the affected run enqueued **28 try-on jobs** for the workflow, not 32.
- Root cause chain: burst-limit throttling + UI state race (multi-job aggregation vs single activeJob effect) + key parsing fragility.
