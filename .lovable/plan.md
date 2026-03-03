

## Security Audit: Generation System — Final Check

### Current Status: Well Protected at the Edge Function Level

The three generation worker functions (`generate-freestyle`, `generate-tryon`, `generate-workflow`) are now properly locked down:
- They reject all non-queue calls with a 403 ("Direct access not allowed")
- Internal queue calls require `SERVICE_ROLE_KEY` in the Authorization header
- `enqueue-generation` uses cryptographic `getUser()` JWT verification
- SQL-level atomic credit deduction, concurrent job limits, hourly rate limits, and 60-second burst limits are all in place

### Remaining Issue: Dead Client-Side Hooks Calling Workers Directly

Three client-side hooks still attempt to call generation functions **directly** (not through the queue). These calls will now always fail with 403 since the workers reject direct access, but they represent broken code paths and should be cleaned up:

| Hook | Calls Directly | Used By |
|------|---------------|---------|
| `src/hooks/useGenerateTryOn.ts` | `generate-tryon` | Not imported in any component |
| `src/hooks/useGenerateWorkflow.ts` | `generate-workflow` | Not imported in any component |
| `src/hooks/useBulkGeneration.ts` | `generate-tryon` (with anon key!) | `BulkGenerate.tsx` |

**`useBulkGeneration`** is the most concerning — it's actively used and calls `generate-tryon` directly with the **anon key** (not even a user JWT). This path is now blocked by the 403 guard, meaning **bulk generation is currently broken** for users.

### Plan

1. **Delete `src/hooks/useGenerateTryOn.ts`** — dead code, direct calls now blocked
2. **Delete `src/hooks/useGenerateWorkflow.ts`** — dead code, direct calls now blocked  
3. **Fix `src/hooks/useBulkGeneration.ts`** — rewrite to use `enqueue-generation` queue with the user's session token instead of calling `generate-tryon` directly. Each bulk item should be enqueued as a separate queue job with proper credit deduction and rate limiting.

### Security Summary

After these changes, every generation path will be:
- Authenticated with cryptographic JWT verification
- Credit-checked and deducted atomically in SQL
- Rate-limited (hourly + 60-second burst)
- Concurrent-job-limited per plan tier
- Routed exclusively through the queue — no direct worker access possible

No additional vulnerabilities found in the generation pipeline.

