# Fix `generate-video` Worker Authentication Bypass

## Problem
`supabase/functions/generate-video/index.ts` (line 419) enters worker mode when `x-queue-internal: true` is present without verifying the `Authorization` header contains the real `SUPABASE_SERVICE_ROLE_KEY`. This allows any unauthenticated caller to forge the header and trigger Kling AI generation or manipulate `generated_videos` rows.

## Root Cause
```
const isQueueInternal = req.headers.get("x-queue-internal") === "true";
```
Only the custom header is checked. The `Authorization: Bearer <service_role_key>` header sent by `process-queue` is ignored.

## Fix

### 1. `supabase/functions/generate-video/index.ts` — Add strict service-role verification

**Location:** Lines 418-437 (worker mode entry gate)

**Change:** Replace the single `x-queue-internal` check with a two-factor guard that also validates the `Authorization` header:

```text
Before:
  const isQueueInternal = req.headers.get("x-queue-internal") === "true";
  if (isQueueInternal && body.job_id) { ... }

After:
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader     = req.headers.get("authorization");
  const isQueueInternal =
    req.headers.get("x-queue-internal") === "true" &&
    authHeader === `Bearer ${serviceRoleKey}`;

  // Reject forged internal requests
  if (req.headers.get("x-queue-internal") === "true" && !isQueueInternal) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (isQueueInternal && body.job_id) { ... }
```

**Why this is safe:**
- `process-queue` already dispatches with BOTH headers (confirmed at `process-queue/index.ts` lines 38-47).
- No client-side UI code ever sends `x-queue-internal`; user-facing video actions use the `getUserId(req)` branch below (line 440), which is untouched.
- The exact same guard pattern is already deployed and working in `generate-freestyle`, `generate-tryon`, `generate-workflow`, `upscale-worker`, and `process-queue` itself.

### 2. Deploy and verify

1. Trigger a video generation from `/app` UI.
2. Confirm `generated_videos` row is created and Kling polling completes normally.
3. Re-run security scanner → finding `generate_video_no_auth` should clear.

## Out of scope
- Other open findings (`poll-stuck-videos` auth, credit checks, image-proxy SSRF, storage policies, etc.) are NOT addressed in this plan.
- No database or frontend changes required.