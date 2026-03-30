

## Generation Queue Audit — Findings

After reviewing `useGenerationQueue.ts`, `useGenerationBatch.ts`, `enqueueGeneration.ts`, `enqueue-generation/index.ts`, `process-queue/index.ts`, and `retry-queue/index.ts`, here is a summary of issues found and their severity.

---

### Bug 1: `restoreActiveJob` runs on every `pollJobStatus` reference change (Medium)

**File:** `src/hooks/useGenerationQueue.ts` (line 382-424)

The `restoreActiveJob` effect depends on `[user, pollJobStatus]`. Since `pollJobStatus` is a `useCallback` that depends on `handleTerminalJob` (which depends on `onGenerationFailed`, `onContentBlocked`), it gets a new identity on every render if those callbacks aren't stable. This causes `restoreActiveJob` to re-run repeatedly, firing extra REST calls on every render cycle — especially noticeable on mobile where renders are frequent.

**Fix:** Guard `restoreActiveJob` with a `hasRestoredRef` that is set once, or remove `pollJobStatus` from the dependency array and access it via a ref.

---

### Bug 2: Batch polling uses `setInterval` — no stale-token handling (Medium)

**File:** `src/hooks/useGenerationBatch.ts` (line 79-158)

The batch poller uses `setInterval(poll, 3000)` with `getAuthToken()` inside each tick. If the token expires mid-batch (JWT lifetime is ~1 hour), the poll silently fails (`!res.ok` returns early with no retry or token refresh). On mobile, where sessions can go idle, this means batch progress silently stops updating.

**Fix:** Add token refresh logic or fallback to `supabase.auth.getSession()` on 401 responses inside the poll loop.

---

### Bug 3: Self-healing only checks `freestyle_generations` table (Low-Medium)

**File:** `src/hooks/useGenerationQueue.ts` (line 327-352)

The self-healing logic for stuck processing jobs checks `freestyle_generations` for saved images. But this same hook is used for `workflow`, `tryon`, `upscale`, and `video` job types — those save results to different tables (`generation_jobs`, `tryon-images` bucket, etc.). A stuck workflow job will never trigger the "images already saved" fast-completion path.

**Fix:** Make the self-heal image check job-type-aware, or rely solely on the 10-minute hard timeout (which already works).

---

### Bug 4: `onCreditRefresh` not called on successful completion (Low)

**File:** `src/hooks/useGenerationQueue.ts` (line 106-139)

`handleTerminalJob` calls `onCreditRefresh` only in the hard-timeout and self-healing paths (lines 308, 347), but NOT in the normal `handleTerminalJob` callback for regular completions/failures. Credits shown in the UI may be stale until the next periodic refresh.

**Fix:** Call `onCreditRefresh?.()` at the end of `handleTerminalJob` for all terminal states (completed, failed, cancelled).

---

### Bug 5: Position calculation query is wrong (Low)

**File:** `src/hooks/useGenerationQueue.ts` (line 261-277)

The position query fetches jobs with `priority_score <= current` and counts them as "ahead", but doesn't filter by `user_id` or `status=queued`. It counts ALL queued jobs across all users with lower-or-equal priority, and includes the current job's own row (`id=neq` excludes itself, but other users' jobs inflate the count). This isn't a functional bug but shows inaccurate position numbers.

---

### Bug 6: No `onCreditRefresh` in batch hook (Low)

**File:** `src/hooks/useGenerationBatch.ts`

The batch hook has no `onCreditRefresh` callback. After a large batch completes, the credit balance shown in the header stays stale until the user navigates or the periodic sync triggers.

---

### Not a Bug — Confirmed Working Well

- **Retry logic (enqueueWithRetry):** 6 retries with exponential backoff, handles 429/502/503 correctly
- **Sliding window grouping:** Properly handles large batch grouping with 120s window
- **Singleton dispatch lock:** Prevents duplicate dispatchers
- **Fire-and-forget dispatch:** process-queue dispatches without blocking
- **Hard timeout (10 min):** Prevents infinite stuck states
- **Miss-count self-healing:** 3 consecutive misses triggers fallback check
- **Cancellation:** Properly checks status before cancel, uses RPC

---

### Recommended Fix Priority

| # | Bug | Severity | Fix Effort |
|---|-----|----------|------------|
| 1 | restoreActiveJob re-runs on every render | Medium | Small — add `hasRestoredRef` guard |
| 2 | Batch polling ignores expired tokens | Medium | Small — handle 401 in poll loop |
| 4 | Credits not refreshed on normal completion | Low | Trivial — add `onCreditRefresh?.()` call |
| 3 | Self-heal only checks freestyle table | Low-Medium | Small — make job-type-aware or remove |
| 5 | Position count includes other users | Low | Small — add status filter |
| 6 | No credit refresh after batch completes | Low | Small — add callback param |

### Plan

**File: `src/hooks/useGenerationQueue.ts`**
1. Add a `hasRestoredRef` to prevent `restoreActiveJob` from re-running on callback identity changes
2. Call `onCreditRefresh?.()` in `handleTerminalJob` for all terminal states (completed, failed, cancelled)
3. Remove the freestyle-only self-heal image check (the 10-min hard timeout already covers all job types)

**File: `src/hooks/useGenerationBatch.ts`**
4. Handle 401 responses in `pollAllJobs` by refreshing the token via `supabase.auth.getSession()`
5. Accept an `onCreditRefresh` callback and invoke it when `allDone` becomes true

