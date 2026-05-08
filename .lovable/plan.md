## What's happening now

Product Visuals already sends 1 image per queue job (this hasn't changed). But the frontend sends them in **chunks of 4** with a 300ms delay between chunks. So 12 images = 3 sequential rounds, taking ~1 second just in pacing overhead before the queue even starts processing.

The backend burst limits are generous (pro: 200/min, growth: 80/min), so we're being unnecessarily conservative on the client side.

## Plan

### 1. `src/pages/ProductImages.tsx` — Increase CONCURRENCY and reduce pacing

- Change `CONCURRENCY` from `4` to `20`
- Remove the `paceDelay` between chunks (the server-side burst limiter + `enqueueWithRetry` backoff already handle rate protection)
- Keep `skipWake: true` on individual calls and single `sendWake` at the end (already in place)

This means a typical 6-12 image batch fires all requests simultaneously in one round, and even large 30+ image batches complete in 2 rounds instead of 8+.

### No backend changes needed

The `enqueue_generation` RPC already has per-plan burst limits and `FOR UPDATE` row locking. The `enqueueWithRetry` wrapper handles 429s with exponential backoff. Everything is already protected server-side.
