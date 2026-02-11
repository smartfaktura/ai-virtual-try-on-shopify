

## Fix: Prevent API Timeouts in Freestyle Generations

### Root Cause

The 504 errors happen because of a **double edge-function timeout chain**:

1. `process-queue` (edge function, ~60s limit) calls `generate-freestyle` (another edge function, ~60s limit) via HTTP
2. `generate-freestyle` calls the AI API, which can take 30-60+ seconds per image
3. With retries (up to 3 attempts per image) and multiple images, a single job can easily need 90-180 seconds
4. Neither the process-queue fetch nor the AI API fetch has an explicit timeout -- they just hang until the infrastructure kills them with a 504

### Solution: Three-Layer Timeout Protection

#### 1. AI API call timeout (`generate-freestyle/index.ts`)

Add `AbortSignal.timeout(50000)` (50s) to the AI gateway fetch call. This ensures a single AI call never exceeds the edge function's wall-clock limit. If it times out, the retry logic catches it and tries again (or moves to the next image).

```text
// Line ~315: Add signal to fetch
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  signal: AbortSignal.timeout(50000),  // 50s hard cutoff per AI call
  headers: { ... },
  body: ...
});
```

Also reduce retry delays from exponential (1s, 2s) to flat 500ms to save time budget.

#### 2. Downstream function call timeout (`process-queue/index.ts`)

Add `AbortSignal.timeout(55000)` (55s) to the fetch that calls generate-freestyle. This prevents process-queue from hanging indefinitely waiting for a downstream function.

```text
// Line ~90: Add signal to fetch
const response = await fetch(functionUrl, {
  method: "POST",
  signal: AbortSignal.timeout(55000),  // 55s hard cutoff
  headers: { ... },
  body: ...
});
```

#### 3. Single-image-per-attempt for queue jobs (`generate-freestyle/index.ts`)

When called from the queue (detected via `x-queue-internal` header), force `imageCount = 1`. The queue system already handles multi-image requests by reserving credits proportionally -- we just need process-queue to enqueue separate jobs for each image, OR generate one at a time to stay within timeout.

The simplest approach: cap to 1 image per queue invocation. For multi-image requests, process-queue loops and calls generate-freestyle N times (one image per call), each with its own 55s timeout. If one fails, the others can still succeed (partial success).

#### 4. Reduce retry attempts for queue calls

When called from the queue, reduce `maxRetries` from 2 to 1 (total 2 attempts max instead of 3). The queue itself can retry the whole job if it fails, so aggressive per-image retries just waste time budget.

### Changes

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Add `AbortSignal.timeout(50000)` to AI fetch; reduce retry delays; when `x-queue-internal` header present, cap imageCount to 1 and maxRetries to 1 |
| `supabase/functions/process-queue/index.ts` | Add `AbortSignal.timeout(55000)` to downstream fetch; for multi-image freestyle jobs, loop N calls (1 image each) instead of one call for all |

### Timeout Budget

```text
AI API call:     50s max (AbortSignal)
generate-freestyle edge fn: ~58s (infrastructure limit)
process-queue fetch:        55s max (AbortSignal)
process-queue edge fn:      ~58s (infrastructure limit)
```

Each image gets its own 50s window. If the AI responds in time, great. If not, abort cleanly, refund credits for that image, and move on.

