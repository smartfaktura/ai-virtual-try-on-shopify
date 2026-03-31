

## Fix: Bulletproof Freestyle Generation — Zero User-Visible Failures

### The Real Problem (4 layers deep)

```text
Layer 1 — Bad timeout math:
  PRIMARY = 120s, BUDGET = 145s → fallback gets 20s → always fails

Layer 2 — Platform kill with no recovery:
  Edge fn killed at ~150s → no code runs → no completion, no refund
  timeout_at set to 10 MINUTES → cleanup won't find it for 10 min
  User stares at spinner for 10 min, then gets "failed"

Layer 3 — No auto-retry:
  Job fails → credits refunded → user must manually retry
  Even though the AI provider was just temporarily slow

Layer 4 — No internal safety deadline:
  Function has no awareness of approaching platform kill
  Can't gracefully abort and re-queue before being terminated
```

### Solution: 4-Layer Defense System

**Goal: The user should virtually never see a generation error for timeouts.**

---

#### Change 1: Rebalance Timeout Budget
**File: `supabase/functions/generate-freestyle/index.ts`** (lines 802-804)

```typescript
const PRIMARY_ATTEMPT_TIMEOUT_MS = 75_000;   // 75s (was 120s) — generous for any single AI call
const WALL_CLOCK_BUDGET_MS = 140_000;         // 140s (was 145s) — 10s safety before platform kill
const MIN_ATTEMPT_BUDGET_MS = 15_000;         // 15s (was 25s) — allow more fallback attempts
```

**Effect:** Primary times out at 75s → 60s left for fallback → Seedream/NanoBanana has a real window.

---

#### Change 2: Reduce timeout_at from 10min to 3min
**File: `supabase/functions/generate-freestyle/index.ts`** (line 1280)

Change `10 * 60 * 1000` → `3 * 60 * 1000`. If the platform kills the function, cleanup_stale_jobs catches it in 3 minutes instead of 10. User waits 3 min max for recovery, not 10.

---

#### Change 3: Add Auto-Retry on Timeout (Database)
**Migration:** Add `retry_count` column to `generation_queue` and update `cleanup_stale_jobs` to re-queue timed-out jobs once instead of failing them.

- Add column: `retry_count INTEGER NOT NULL DEFAULT 0`
- Modify `cleanup_stale_jobs`: when a job has `retry_count = 0` and `0 images generated`, instead of marking failed, reset to `queued` with `retry_count = 1` and refund nothing (credits stay reserved). The job gets picked up again by process-queue automatically.
- On second failure (`retry_count >= 1`): mark failed + refund as today.

---

#### Change 4: Internal Safety Deadline at 135s
**File: `supabase/functions/generate-freestyle/index.ts`**

Add a `requestStartTime` check before entering the generation loop. If elapsed time exceeds 135s at any checkpoint (before starting a new image, before upload), gracefully complete with partial results or re-queue via the DB instead of letting the platform kill the function silently.

The function already tracks `requestStartTime` — add wall-clock checks at key points:
- Before each image generation loop iteration
- Before upload to storage
- In the fallback executor's loop

---

### Timeline Comparison

```text
BEFORE (current):
  0s ── primary attempt ── 120s TIMEOUT ── 20s fallback ── FAIL
  Platform kills at 150s → job stuck "processing" for 10 min
  User sees error after 10+ minutes

AFTER (with all 4 layers):
  0s ── primary ── 75s TIMEOUT ── 60s fallback ── likely SUCCESS
  If both fail → 135s safety abort → graceful re-queue
  cleanup_stale_jobs at 3min → auto-retry (1 attempt)
  If retry also fails → fail + refund + friendly message
  User almost never sees an error
```

### Files Changed
1. `supabase/functions/generate-freestyle/index.ts` — timeout constants, timeout_at, safety deadline
2. Database migration — `retry_count` column + updated `cleanup_stale_jobs` function

### Risk Assessment
- **Low risk**: Constants are just numbers, no logic change
- **Low risk**: retry_count column is additive, default 0
- **Medium risk**: cleanup_stale_jobs re-queue logic — but it's guarded by retry_count < 1, worst case it fails on retry and refunds normally

