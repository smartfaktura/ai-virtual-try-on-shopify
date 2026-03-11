

## Fix: Allow Cancelling Stuck/Processing Generations

### Problem
Users cannot cancel a generation once it starts processing. The cancel button only appears while queued, and the backend trigger only handles `queued → cancelled` refunds. If a generation gets stuck in "processing" (as seen at 241s elapsed), the user must wait up to 5 minutes for the watchdog.

### Root Causes
1. **`useGenerationQueue.ts` line 346**: `cancel()` exits early unless `status === 'queued'`
2. **DB trigger**: Only fires on `queued → cancelled`, not `processing → cancelled` — so no credit refund
3. **`Generate.tsx` lines 3713, 3722**: Only passes `onCancel` when `status === 'queued'`
4. **`Freestyle.tsx` line 629**: Calls `resetQueue()` instead of `cancel()` — doesn't actually cancel the DB job
5. **`QueuePositionIndicator.tsx`**: No cancel button in the ProcessingState component

### Plan (3 files + 1 migration)

**1. Database migration** — Extend the cancellation trigger to also handle `processing → cancelled`:
```sql
-- Update trigger to fire on both queued→cancelled AND processing→cancelled
-- Update function to handle both old statuses
```

**2. `src/hooks/useGenerationQueue.ts`** — Allow cancelling processing jobs:
- Line 346: Change guard from `activeJob.status !== 'queued'` to check for both `queued` and `processing`

**3. `src/pages/Generate.tsx`** — Always pass `onCancel` for active jobs (not just queued):
- Lines 3713, 3722: Remove the `activeJob.status === 'queued'` condition

**4. `src/pages/Freestyle.tsx`** — Call `cancel()` instead of `resetQueue()`:
- Line 629: Change `onCancel={() => resetQueue()}` to `onCancel={() => cancel()}`

**5. `src/components/app/QueuePositionIndicator.tsx`** — Add cancel button to ProcessingState:
- Pass `onCancel` into `ProcessingState` and render a cancel button below the progress bar

