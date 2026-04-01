

# Catalog Studio Debug — Round 4

## Status: Pipeline is solid

After reviewing all three files end-to-end, the catalog pipeline is in good shape. Queue routing, credit pricing, prompt flow, polling, base64 handling, timer logic, download, and metadata are all correct. Only two minor issues remain.

## Bugs Found

### Bug 1: Fatal error handler uses `req.clone().json()` after body already consumed (Severity: Medium)

In `generate-catalog/index.ts` line 423, the `catch` block tries `req.clone().json()` to recover `job_id` for cleanup. But the request body was already consumed at line 292 (`await req.json()`). In Deno, `req.clone()` after consumption will fail silently, meaning the `completeQueueJob` call never fires — the job stays stuck in `processing` until `cleanup_stale_jobs` catches it 5+ minutes later.

**Fix**: Capture the parsed `body` into a variable at the top of the `try` block, then reference it in the `catch`. No need for `req.clone()`.

### Bug 2: Dead code — `waitForJobCompletion` never called (Severity: Low)

In `useCatalogGenerate.ts` lines 222-242, `waitForJobCompletion` is defined but never used anywhere. It was designed for anchor-then-derivative sequential flow but the current implementation fires all jobs in parallel and relies on polling. Dead code adds confusion.

**Fix**: Remove the function.

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/generate-catalog/index.ts` | Move body parsing before try, reference parsed body in catch for cleanup |
| `src/hooks/useCatalogGenerate.ts` | Remove unused `waitForJobCompletion` function |

## Detailed Changes

**1. `generate-catalog/index.ts` — Fix fatal error cleanup**

Restructure so that `body` is available in the catch block:

```typescript
serve(async (req) => {
  if (req.method === "OPTIONS") { ... }
  const isQueueInternal = req.headers.get("x-queue-internal") === "true";
  let body: CatalogPayload = {} as CatalogPayload;
  try {
    body = await req.json();
    // ... rest of logic unchanged ...
  } catch (error) {
    console.error("[generate-catalog] Fatal error:", error);
    if (isQueueInternal && body.job_id) {
      try {
        await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], 1, [error instanceof Error ? error.message : "Unknown error"], body as unknown as Record<string, unknown>);
      } catch { /* best effort */ }
    }
    return new Response(...);
  }
});
```

**2. `useCatalogGenerate.ts` — Remove dead code**

Delete `waitForJobCompletion` (lines 221-242).

