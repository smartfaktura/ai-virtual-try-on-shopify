

## Fix: Suppress User-Facing Errors from Queue Internals

### Problem
Two runtime errors are surfacing to users as scary error banners:

1. **429 "Too many requests"** from `enqueue-generation` — the burst rate limit (60/min for pro) fires when batch workflows try to enqueue 10+ jobs rapidly within 60 seconds
2. **500 "Signal timed out"** from `retry-queue` — it awaits `process-queue` with a 5-second timeout, but process-queue is busy (held by the singleton lock), so it times out and returns 500

### Root Causes & Fixes

**Fix 1: `retry-queue` — fire-and-forget, never return 500**

The retry-queue function doesn't need the process-queue response. It should fire the request and immediately return 200. This eliminates the timeout error entirely.

```ts
// Before: awaits with 5s timeout → 500 on timeout
const res = await fetch(..., { signal: AbortSignal.timeout(5000) });

// After: fire-and-forget, always return 200
fetch(...).catch(() => {});
return Response(JSON.stringify({ triggered: true }), ...);
```

**Fix 2: `enqueue-generation` — increase burst limit for batch workflows**

The burst limits are too tight for batch workflows (e.g., 10 products × multiple models). Increase them so batch enqueueing doesn't hit the wall:

| Plan | Current | New |
|------|---------|-----|
| enterprise | 100 | 200 |
| pro | 60 | 120 |
| growth | 40 | 80 |
| starter | 20 | 40 |
| free | 10 | 15 |

This is done in the `enqueue_generation` DB function via a migration.

**Fix 3: Client-side — suppress retry-queue errors from error reporting**

The `useGenerationQueue` hook already uses `.catch(() => {})` on retry-queue calls, but the runtime error panel still picks them up. Add explicit error swallowing so these don't propagate.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/retry-queue/index.ts` | Fire-and-forget process-queue call, always return 200 |
| **New migration** | Update `enqueue_generation` function with higher burst limits |

### Impact
- Users will never see "Signal timed out" errors from retry-queue
- Batch workflows (10-20 products) will enqueue without hitting burst limits
- No functional behavior changes — retry-queue is a best-effort trigger, not a critical path

