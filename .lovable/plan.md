## Fix: Remove unsigned-JWT auth bypass in queue-internal edge functions

### The vulnerability

Four edge functions accept any JWT whose base64-decoded payload contains `role: "service_role"` — **without verifying the signature**. An attacker forges `eyJhbGciOiJub25lIn0.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.` plus `x-queue-internal: true` and bypasses auth.

### Why the fix is 100% safe (verified)

I audited every internal caller. Each one already sends the real service-role key as the bearer token:

| Caller | Header sent |
|---|---|
| `enqueue-generation` → `process-queue` (line 103, 207) | `Bearer ${serviceRoleKey}` + `x-queue-internal: true` |
| `process-queue` self-dispatch (line 41) | `Bearer ${serviceRoleKey}` + `x-queue-internal: true` |
| `retry-queue` → `process-queue` (line 46) | `Bearer ${serviceRoleKey}` + `x-queue-internal: true` |
| `run-scheduled-drops` → `trigger-creative-drop` (line 66) | `Bearer ${serviceRoleKey}` + `x-queue-internal: true` |

The strict comparison `authHeader === \`Bearer ${serviceRoleKey}\`` already accepts all four. The base64-decode `else if` branch is **dead code** — it can only ever be reached by tokens that DON'T equal the real key, i.e. forgeries.

For reference: `generate-tryon` and `generate-text-product` already implement this correctly today (they require BOTH `x-queue-internal` AND `authHeader === Bearer serviceRoleKey`).

### Changes

In each file below, delete the entire `else if (isQueueInternal && authHeader?.startsWith("Bearer "))` block (the base64 JWT parser). Keep only the strict equality check.

1. `supabase/functions/process-queue/index.ts` — delete lines ~80-93 (the `else if` JWT-payload block); also drop the now-unused `isQueueInternal` local and the "x-queue-internal header" wording in the comment.
2. `supabase/functions/generate-freestyle/index.ts` — same pattern around lines 1150-1170.
3. `supabase/functions/generate-workflow/index.ts` — same pattern around lines 1049-1070.
4. `supabase/functions/upscale-worker/index.ts` — same pattern around lines 43-60.

After the edit, each guard reduces to:

```ts
const authHeader = req.headers.get("authorization");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
if (authHeader !== `Bearer ${serviceRoleKey}`) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

### Verification after deploy

- Trigger a normal image generation from `/app/workflows` → confirms `enqueue-generation → process-queue → generate-workflow` still completes.
- Trigger a freestyle generation → confirms `generate-freestyle` path.
- Trigger an upscale from the library → confirms `upscale-worker`.
- Re-run security scan; `jwt_bypass_queue_internal` should clear.

### Out of scope

The other findings in the security panel (open redirect in `create-checkout`, image-proxy SSRF, storage bucket policies, leaked-password protection, RLS warnings on checkout_sessions / generation_queue / etc.) — separate plans.