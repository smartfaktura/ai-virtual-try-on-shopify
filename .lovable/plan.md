

# Recommendation: Parallel Chunk Enqueuing

## What changes

**One file:** `src/pages/ProductImages.tsx` (~30 lines modified)

Replace the current sequential loop (where each job waits for the previous one to finish) with a chunked parallel approach:

1. **Build all job payloads first** — collect every product/scene/variant/ratio combination into an array without making any network calls
2. **Send in chunks of 4** — use `Promise.allSettled` to fire 4 requests simultaneously, then move to the next chunk
3. **One pacing delay per chunk** (300ms between chunks, not between individual jobs)
4. **Keep all existing safety** — each request still has its own retry/backoff logic, `skipWake` is already used, and a single `sendWake` fires at the end

## Expected improvement

| Scenes | Current time | After fix |
|--------|-------------|-----------|
| 36     | ~22s        | ~6s       |
| 12     | ~7s         | ~2.5s     |

## Why this is safe for your setup

- The backend locks credits **per user row** (`FOR UPDATE`), so parallel requests from the same user are serialized at the database level — no double-spending
- Burst limits are generous (40–200 per 60s depending on plan) — 4 concurrent requests won't trigger them
- If one request in a chunk fails (e.g. credits run out), the others return clean errors — no side effects
- At 10,000 users: each user's requests only contend with their own row lock, not other users'

## No backend changes needed

The `enqueue-generation` edge function and `enqueue_generation` database function already handle concurrent requests correctly. This is purely a client-side optimization.

