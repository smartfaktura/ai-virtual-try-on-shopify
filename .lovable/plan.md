

## Upscale System Audit — Issues Found

### What Works Well
- **Edge function security**: `upscale-worker` correctly validates `x-queue-internal` + service role key
- **Credit calculation**: Correct in both `enqueue-generation` (server) and `useUpscaleImages` (client) — 4 for 2K, 8 for 4K
- **Payload flow**: `enqueue-generation` stores payload (with imageUrl, sourceType, sourceId, resolution) in queue → `process-queue` enriches with user_id/job_id/credits_reserved → `upscale-worker` receives all fields
- **Error handling**: Worker refunds credits on failure, has abort timeout (90s)
- **Batch cap**: Client enforces max 10, server burst-rate limits prevent abuse
- **Storage**: Upsert prevents duplicate upload conflicts

### Issues Found

**1. GlobalGenerationBar shows "Generation" instead of "Upscaling" for upscale jobs**
The bar displays `group.workflow_name ?? 'Generation'` for all job types. Upscale jobs have no `workflow_name` in payload, so they show as generic "Generation". Should show "Upscaling to 2K" or "Upscaling to 4K".

**Fix**: In `GlobalGenerationBar.tsx` (line 149), check `job_type === 'upscale'` and display appropriate label. Also update `batchGrouping.ts` grouping to read resolution from payload.

**2. Upscale jobs not visible on Freestyle page**
`HIDDEN_PATHS` in `GlobalGenerationBar` includes `/app/freestyle`, so if user triggers upscale from Library then navigates to Freestyle, the bar is hidden. However upscale results don't appear in Freestyle — they update the source record in-place. The Freestyle page has its own generation tracking (`useGenerationQueue`), which would track the upscale job if triggered there. This is acceptable behavior — upscale jobs show in the GlobalGenerationBar on all other pages.

**3. No "Upscaling..." label in the generation bar detail panel**
Line 157: shows `Generating… ${elapsed}` for processing jobs. Upscale jobs should say `Upscaling…`.

**Fix**: Check `group.job_type === 'upscale'` to show "Upscaling…" instead of "Generating…".

**4. Double credit refund risk (minor)**
In `upscale-worker`, on failure: credits are refunded via `refund_credits` RPC (line 279). But the `handle_queue_cancellation` trigger also refunds when status goes to `cancelled`. Since the worker sets status to `failed` (not `cancelled`), this is fine — no double refund. However, the `cleanup_stale_jobs` function ALSO refunds for timed-out processing jobs. If the worker fails AND the cleanup runs simultaneously, there could be a race. The worker sets `completed_at` before cleanup runs, so cleanup won't match it. This is safe.

**5. `useUpscaleImages` doesn't pass `resolution` at top level to `enqueue-generation`**
Looking at line 87 of `useUpscaleImages`: `resolution` IS passed at the top level of the request body. And in `enqueue-generation` line 80: `resolution` is destructured from `body`. This is correct.

### Summary of Required Fixes

1. **`src/components/app/GlobalGenerationBar.tsx`**: Show "Upscaling to 2K/4K" label for upscale jobs instead of "Generation", and "Upscaling…" instead of "Generating…" in the detail panel
2. **`src/components/app/GlobalGenerationBar.tsx`**: Extract resolution from payload for display

These are cosmetic/UX fixes only — the core function logic, security, credit handling, and queue integration are all correct.

