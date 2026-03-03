

## Security Assessment: DDoS & Mass Generation Attack Vectors

### Current Protections (Working Well)

1. **Authentication**: All generation functions use cryptographic `getUser()` verification -- attackers cannot generate without a valid account
2. **Credit system**: Atomic SQL deduction via `enqueue_generation()` -- no generation without credits
3. **Hourly rate limits**: Free=10, Starter=50, Growth=100, Pro=999 per hour
4. **Concurrent job limits**: Free=1, Starter=2, Growth=3, Pro=4, Enterprise=6
5. **Queue architecture**: Jobs go through `enqueue-generation` → `process-queue` → worker, preventing direct AI API abuse
6. **Service role verification**: Internal queue calls verify `SERVICE_ROLE_KEY` in Authorization header

### Vulnerabilities Found

#### 1. CRITICAL: Direct bypass of queue via `generate-freestyle` (and `generate-tryon`, `generate-workflow`)

The generation functions still accept **direct calls** (non-queue) from any authenticated user. When called directly:
- **No credit deduction** -- the function generates images for free
- **No rate limiting** -- the hourly/concurrent checks only exist in `enqueue-generation`
- **No imageCount cap** -- direct calls allow up to 4 images per request vs 1 in queue mode

An attacker with a valid account (even free tier with 0 credits) could call `generate-freestyle` directly, bypassing all queue protections, and generate unlimited images using your Lovable AI credits.

**Fix**: Make generation functions **queue-only** -- reject any request that isn't from the internal queue (i.e., require `isQueueInternal === true`). The direct-call fallback path should be removed entirely.

#### 2. MEDIUM: Unused `useGenerateFreestyle` hook calls `generate-freestyle` directly

The hook at `src/hooks/useGenerateFreestyle.ts` calls `generate-freestyle` directly with the **anon key** (not the user's session token), which means:
- It bypasses the queue entirely
- It sends the anon key as auth, which `getUser()` will reject (anon key isn't a user JWT)

This hook is not currently imported anywhere, but it's dead code that could be accidentally used.

**Fix**: Delete `src/hooks/useGenerateFreestyle.ts` entirely.

#### 3. MEDIUM: No per-minute burst rate limit

The hourly rate limit (10/hour for free) doesn't prevent burst attacks. An attacker could fire 10 requests in 1 second, each consuming edge function resources and AI API calls simultaneously.

**Fix**: Add a short-window burst limit (e.g., max 3 jobs per 60 seconds for free users) inside the `enqueue_generation` SQL function.

#### 4. LOW: CORS allows all origins

`Access-Control-Allow-Origin: *` means any website can make requests to your edge functions. Combined with a stolen/leaked JWT, this enables cross-site attacks.

**Fix**: Restrict CORS to your actual domains (`vovvai.lovable.app` and the preview URL). This is a lower priority since auth is required anyway.

### Implementation Plan

| Priority | Change | Files |
|----------|--------|-------|
| **Critical** | Make generation functions queue-only (reject non-internal calls) | `generate-freestyle/index.ts`, `generate-tryon/index.ts`, `generate-workflow/index.ts` |
| **Medium** | Delete unused direct-call hook | `src/hooks/useGenerateFreestyle.ts` |
| **Medium** | Add 60-second burst rate limit in SQL | DB migration for `enqueue_generation` function |
| **Low** | Restrict CORS origins | All edge functions (optional, deferred) |

The critical fix is straightforward: in each generation function's request handler, if `!isQueueInternal`, return 403 immediately. This closes the direct-bypass vector completely and ensures all generations must go through the credit/rate-limit/concurrency checks in `enqueue-generation`.

