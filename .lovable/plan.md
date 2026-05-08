# Fix: upscale silently fails (was working before signing-keys rotation)

## Why it broke "out of nowhere"
Supabase recently rotated the project to the new **signing-keys** auth system (visible in secrets: `SUPABASE_SECRET_KEYS`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`). After that rotation, the bearer token `process-queue` forwards to a worker is no longer the same literal string the worker reads from `SUPABASE_SERVICE_ROLE_KEY`.

When this happened, every other worker (`generate-freestyle`, `generate-workflow`, `process-queue`) was updated with a fallback: if strict-equality fails, decode the JWT and accept any token whose payload `role === 'service_role'`.

`upscale-worker` was the only worker that never got that fallback. So:

```
process-queue → upscale-worker → 403 "queue-only"
process-queue → marks job 'failed', refunds credits
GlobalGenerationBar → sees job leave the active list → shows "Upscaled to 2K" success ✗
```

Confirmed in edge logs — every single upscale job over the last hour:
```
[process-queue] Dispatch rejected: 403 {"error":"This function is queue-only..."}
[process-queue] Dispatch of job <id> rejected with status 403 — failing job and refunding
```

No code change to upscale was the cause; the *infrastructure* changed underneath an outdated check.

## Fix

### 1. `supabase/functions/upscale-worker/index.ts` — add JWT fallback (auth only)
Replace the strict-equality block with the same tolerant check used by the other workers:

```ts
const authHeaderRaw = req.headers.get("authorization");
const hasQueueHeader = req.headers.get("x-queue-internal") === "true";
let isQueueInternal = hasQueueHeader && authHeaderRaw === `Bearer ${serviceRoleKey}`;

// Fallback for signing-keys rotation: accept any valid service_role JWT
if (!isQueueInternal && hasQueueHeader && authHeaderRaw?.startsWith("Bearer ")) {
  try {
    const payloadB64 = authHeaderRaw.slice(7).split(".")[1];
    if (payloadB64) {
      const payload = JSON.parse(atob(payloadB64));
      if (payload.role === "service_role") isQueueInternal = true;
    }
  } catch { /* invalid JWT */ }
}

if (!isQueueInternal) {
  console.warn(`[upscale-worker] Auth REJECTED — headerLen=${authHeaderRaw?.length ?? 0}, hasQueueHeader=${hasQueueHeader}`);
  return new Response(
    JSON.stringify({ error: "Direct access not allowed. Use the generation queue." }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
```

Deploy `upscale-worker` immediately after.

### 2. `src/components/app/GlobalGenerationBar.tsx` — stop showing failed jobs as "completed"
Today, when a group leaves `activeGroups`, it's auto-mirrored into `completedGroups` with `allCompleted: true, failedCount: 0` — no inspection of the actual row status. Fix:
- Carry the underlying jobs' final `status`/`error_message` into the snapshot, compute a real `failedCount` and `hasFailures` flag.
- For groups with `hasFailures`:
  - Title in `text-destructive`, swap check icon for `AlertCircle`.
  - Subtitle becomes "Upscale failed — credits refunded. Try again."
- Fire one `toast.error('Upscale failed — credits refunded. Please try again.')` per failed group key (track shown keys in a `Set` ref to avoid duplicate toasts from the 4 s poll).

### 3. `src/hooks/useUpscaleImages.ts` — soften optimistic toast
Change the success-shaped toast `Upscaling N images to 2K…` to an info toast like `Upscale started — you'll see it in your Library when ready`, so the message no longer reads like completion.

## Verification
1. Deploy `upscale-worker`.
2. Tail its logs while the user clicks Upscale on one image:
   - Expect `[upscale-worker] Job <id>: upscaling to 2K…` instead of the 403.
   - Expect a row written into `freestyle_generations` (or `generation_jobs`) with `quality = upscaled_2k` within ~30–60 s.
3. Confirm the upscaled image now appears in Library.
4. To exercise the failure UI safely: set one queued upscale row to `status='failed'` via the migration tool and confirm the bar shows the destructive copy + a single toast — no false "completed".

## Out of scope
- No changes to credit pricing, refund logic, `process-queue`, queue dispatcher, or any other worker (their auth already supports the fallback).
- No redesign of the floating bar beyond the failed-state styling.
