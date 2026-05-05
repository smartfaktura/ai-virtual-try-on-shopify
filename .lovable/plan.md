
## Changes

### 1. Increase pro burst limit (database migration)

Update the `enqueue_generation` RPC function to raise the `pro` plan burst limit from 120 to 200:

```
WHEN 'pro' THEN 200
```

This ensures batches of up to 200 scenes go through without hitting the burst wall.

### 2. Add client-side wave pacing

In `src/hooks/useGenerationBatch.ts`, change the sequential enqueue loop to send jobs in waves of 30 with a 2-second pause between waves. This stays well under the burst window and avoids 429 errors even for very large batches.

The existing `paceDelay` (300ms between individual calls) remains, but after every 30th job a longer 2-second cooldown is inserted.

### 3. Increase hourly limit for pro (edge function)

In `supabase/functions/enqueue-generation/index.ts`, the `HOURLY_LIMITS` for `pro` is already 999, which is sufficient. No change needed there.

---

### Technical details

- **Migration**: `ALTER FUNCTION` / `CREATE OR REPLACE FUNCTION` to update `enqueue_generation` with the new burst limit value.
- **Client pacing**: Add a `WAVE_SIZE = 30` constant and insert `await new Promise(r => setTimeout(r, 2000))` after every 30th enqueue call in the `startBatch` loop.
