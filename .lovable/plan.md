

## Security Audit: Generation Pipeline — Final Verification

### VERDICT: SECURE

All generation paths are properly protected. Here is the complete security analysis:

### Layer 1: Worker Functions (generate-freestyle, generate-tryon, generate-workflow)
- All three **reject direct calls** with 403 ("Direct access not allowed")
- Internal queue calls require both `x-queue-internal: true` header AND `Authorization: Bearer SERVICE_ROLE_KEY`
- No client-side code calls these functions directly anymore

### Layer 2: Queue Entry (enqueue-generation)
- Uses cryptographic `getUser(token)` JWT verification — no anonymous access
- Validates `jobType` against whitelist (`tryon`, `freestyle`, `workflow`)
- All three client-side callers (`useGenerationQueue`, `useGenerationBatch`, `useBulkGeneration`) pass the user's session token

### Layer 3: SQL-Level Protection (enqueue_generation function)
- **Credit check**: Atomic `FOR UPDATE` lock prevents race conditions; rejects if balance < cost
- **Burst rate limit**: Max jobs per 60 seconds (Free=3, Starter=4, Growth=6, Pro=10, Enterprise=20)
- **Concurrent job limit**: Free=1, Starter=2, Growth=3, Pro=4, Enterprise=6
- **Hourly rate limit**: Free=10, Starter=50, Growth=100, Pro=999 (checked in edge function)
- **Atomic credit deduction**: Credits deducted in same transaction as job insert — no double-spend

### Layer 4: Queue Processing (process-queue)
- Only accepts calls with `SERVICE_ROLE_KEY` in Authorization header
- Stale job cleanup with 5-minute timeout + automatic credit refund
- Fire-and-forget dispatch prevents queue blocking

### Layer 5: Database RLS
- `generation_queue`: Users can only SELECT their own jobs and UPDATE only `queued` status jobs (cancel)
- Users cannot INSERT directly into generation_queue (must go through RPC)
- `profiles.credits_balance` modifications happen only in SECURITY DEFINER functions

### Attack Scenarios — All Blocked

| Attack | Protection |
|--------|-----------|
| Free user spams generations | Burst limit (3/min), hourly limit (10/hr), concurrent limit (1), credit check (20 credits total) |
| Direct call to generate-freestyle | 403 rejected — queue-only |
| Replay/forge JWT | `getUser()` does server-side cryptographic verification |
| Race condition on credits | `FOR UPDATE` row lock in SQL |
| Bypass via anon key | `getUser()` rejects non-user tokens |
| Client-side credit manipulation | Credits deducted server-side in SECURITY DEFINER function |
| DDoS via bulk requests | Burst + hourly + concurrent limits all enforced atomically |

### No Issues Found

The generation pipeline has comprehensive defense-in-depth security. No changes needed.

