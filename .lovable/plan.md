
Root cause confirmed: the generation was not actually slow; it finished in backend quickly, but the Freestyle UI got stuck on an old local `processing` state.

What I verified:
- Recent job `631c2337...` completed in ~25s (backend timestamps).
- During the stuck UI period, global active-job polling kept returning `[]` (no queued/processing jobs).
- The per-job polling request (`generation_queue?id=eq.<jobId>`) was no longer firing, so local `activeJob` never transitioned to `completed`.

Why this happens in code:
1) `useGenerationQueue` uses `setInterval(async poll, 3000)` with no overlap protection.
2) Overlapping polls can resolve out-of-order (older “processing” response can overwrite newer terminal state).
3) `stopPolling()` may run, but stale `activeJob` can remain `processing`.
4) Early returns on `!res.ok` / `rows.length === 0` do not trigger reconciliation, so UI can remain stale indefinitely.

Implementation plan:
1. Harden polling in `src/hooks/useGenerationQueue.ts`
   - Replace `setInterval` with a single-flight recursive `setTimeout` loop.
   - Add poll-session/version guard so stale async responses are ignored.
   - Add `try/catch` around poll body and controlled retry/backoff.

2. Add self-healing reconciliation in the same hook
   - If polling misses terminal transition (or row is temporarily unavailable), run fallback checks:
     - Query active jobs for the user.
     - If no active jobs remain, fetch terminal state for tracked job (or infer completion) and update `activeJob`.
   - Never leave `processing` forever without live backend confirmation.

3. UX safety for client trust
   - Add stale-state guard (e.g., after N failed sync cycles while showing `processing`): show “Re-syncing status…” and auto-refresh state.
   - Trigger `onCreditRefresh` and completion flow after recovered terminal state.

4. Keep fix global
   - Because all generation pages use `useGenerationQueue`, this single hook fix protects Freestyle + Generate + other queue consumers.

Files to update:
- `src/hooks/useGenerationQueue.ts` (primary fix)
- (Optional small UX text state where queue status is shown) `src/components/app/QueuePositionIndicator.tsx`

Validation plan:
- Reproduce with simulated delayed/out-of-order poll responses.
- Verify terminal status is eventually reflected even if one poll fails/misses.
- Verify no case remains stuck in `processing` when backend shows completed.
- Verify credits/result refresh still behaves correctly on complete/failed/cancelled.
