

## Phase 3 Audit: Process-Queue Worker -- Generation Function Compatibility

### Summary: 2 Critical Issues, 1 Architectural Concern

---

### Issue 1: `generate-tryon` Will Reject Queue Calls (Critical)

The `generate-tryon` function (line 228-234) extracts the user ID from the JWT via `getUserIdFromJwt()`. When `process-queue` calls it, the `Authorization` header carries the **service role key**, which is a JWT without a `sub` claim. This means:

- `getUserIdFromJwt()` returns `null`
- The function returns HTTP 401 "Authentication required"
- The job fails and credits are refunded, but no images are generated

**Fix**: Add a check for the `x-queue-internal` header. When present, skip auth and accept `user_id` from the payload instead:

```typescript
const isQueueInternal = req.headers.get("x-queue-internal") === "true";
let userId: string | null;

if (isQueueInternal) {
  // Called from process-queue worker -- user_id is in the payload
  const body = await req.json();
  userId = body.user_id || null;
} else {
  userId = getUserIdFromJwt(req.headers.get("authorization"));
}
```

This also means `process-queue` must include `user_id` in the payload it sends to `generate-tryon`. Currently the payload is passed through as-is from the queue row — so the `enqueue-generation` endpoint must ensure `user_id` is embedded in the payload, OR `process-queue` must inject it before calling the downstream function.

**Recommended approach**: Have `process-queue` inject `user_id` into the payload before calling any downstream function:

```typescript
const enrichedPayload = { ...payload, user_id: userId };
body: JSON.stringify(enrichedPayload),
```

**Files**: `supabase/functions/generate-tryon/index.ts`, `supabase/functions/process-queue/index.ts`

---

### Issue 2: `generate-video` Is Incompatible with Queue Model (Critical)

The `generate-video` function has two fundamental incompatibilities:

**2a. Auth breaks**: It uses `supabase.auth.getUser(token)` (line 46-59) to validate the user. The service role key is NOT a user token, so `getUser()` will fail, throwing "Unauthorized".

**2b. Response format mismatch**: Video generation is asynchronous (create task, then poll for status). It returns `{ task_id, status }`, NOT `{ images, generatedCount }`. The `process-queue` worker expects `result.images` and `result.generatedCount` (lines 116-133), so:
- `generatedCount` will be `0` (no `images` array, no `generatedCount`)
- No `generation_jobs` record will be created
- No partial refund logic will apply correctly

**Fix options**:

- **Option A (Recommended)**: Remove `video` from the queue system entirely. Video is async by nature (Kling API polling) and doesn't fit the synchronous process-queue model. Remove `video: "generate-video"` from `JOB_TYPE_TO_FUNCTION` and remove `"video"` from the `validJobTypes` list in `enqueue-generation`. Keep video as a direct call.

- **Option B**: Build a separate async video queue handler that creates the Kling task and then polls, but this is significant complexity for a different phase.

**Files**: `supabase/functions/process-queue/index.ts`, `supabase/functions/enqueue-generation/index.ts`

---

### Issue 3: Frontend Hooks Bypass the Queue Entirely (Architectural)

All 5 generation hooks call edge functions **directly**, never through `enqueue-generation`:

| Hook | Calls directly |
|------|---------------|
| `useGenerateProduct.ts` | `generate-product` |
| `useGenerateFreestyle.ts` | `generate-freestyle` |
| `useGenerateWorkflow.ts` | `generate-workflow` |
| `useGenerateTryOn.ts` | `generate-tryon` |
| `useGenerateVideo.ts` | `generate-video` |
| `useBulkGeneration.ts` | `generate-tryon` |

Only `useGenerationQueue.ts` calls `enqueue-generation`, but nothing in the UI currently uses it. This means the queue, rate limiting, credit deduction, and concurrency controls are all bypassed in practice.

**Note**: This is likely a Phase 4/5 task (wiring the frontend), not a Phase 3 bug. But it's important to flag: until the frontend hooks are updated to go through `enqueue-generation`, the queue system is unused.

---

### Functions That Work Correctly via Queue

| Function | Auth | Response format | Status |
|----------|------|----------------|--------|
| `generate-product` | None | `{ images, generatedCount }` | Works |
| `generate-freestyle` | None | `{ images, generatedCount }` | Works |
| `generate-workflow` | None | `{ images, generatedCount }` | Works |
| `generate-tryon` | JWT auth (blocks queue) | `{ images, generatedCount }` | **Broken** |
| `generate-video` | `getUser()` auth (blocks queue) + async model | `{ task_id, status }` | **Broken** |

---

### Recommended Implementation Order

1. **Fix `generate-tryon`**: Add `x-queue-internal` bypass + inject `user_id` from `process-queue`
2. **Remove `video` from queue**: Delete from `JOB_TYPE_TO_FUNCTION` and `validJobTypes` in enqueue
3. **Inject `user_id` in process-queue**: Enrich payload with `user_id` before calling any downstream function (future-proofs other functions that may add auth)

| Priority | Issue | Files |
|----------|-------|-------|
| Critical | `generate-tryon` auth blocks queue calls | `generate-tryon/index.ts`, `process-queue/index.ts` |
| Critical | `generate-video` incompatible with queue | `process-queue/index.ts`, `enqueue-generation/index.ts` |
| Info | Frontend bypasses queue entirely | All `useGenerate*.ts` hooks (Phase 4+) |

