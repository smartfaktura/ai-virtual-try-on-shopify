

## Security Hardening Plan

### Vulnerability 1: Spoofable `x-queue-internal` Header
**Files:** `generate-freestyle/index.ts`, `generate-tryon/index.ts`, `generate-workflow/index.ts`

Currently, anyone can add `x-queue-internal: true` to bypass JWT auth and pass an arbitrary `user_id`. The fix: verify that the `Authorization` header carries the `SERVICE_ROLE_KEY` when `x-queue-internal` is set.

```typescript
// Replace the simple header check with service role verification
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const authHeader = req.headers.get("authorization");
const isQueueInternal = req.headers.get("x-queue-internal") === "true"
  && authHeader === `Bearer ${serviceRoleKey}`;
```

This is already how `process-queue` authenticates — the generation functions just need to verify it.

### Vulnerability 2: Unverified JWT in `enqueue-generation` and `trigger-creative-drop`
**Files:** `enqueue-generation/index.ts`, `trigger-creative-drop/index.ts`

The `getUserIdFromJwt` helper decodes the JWT payload with `atob` without signature verification. An attacker can craft a fake JWT with any `sub` to impersonate users and drain their credits.

Fix: Replace with `getClaims()` (already used in `describe-image`):

```typescript
const authHeader = req.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, ... });
}
const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
  global: { headers: { Authorization: authHeader } },
});
const token = authHeader.replace("Bearer ", "");
const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
if (claimsError || !claimsData?.claims) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, ... });
}
const userId = claimsData.claims.sub;
```

### Vulnerability 3: No Auth on AI-calling Functions
**Files:** `describe-discover-metadata/index.ts`, `generate-scene-previews/index.ts`

These call the Lovable AI gateway (costing API credits) with zero authentication. Anyone with the function URL can call them freely.

Fix: Add the same `getClaims()` pattern used in `describe-image`.

### Summary of Changes

| File | Fix |
|------|-----|
| `generate-freestyle/index.ts` | Verify service role key for queue-internal calls |
| `generate-tryon/index.ts` | Verify service role key for queue-internal calls |
| `generate-workflow/index.ts` | Verify service role key for queue-internal calls |
| `enqueue-generation/index.ts` | Replace `getUserIdFromJwt` with `getClaims()` |
| `trigger-creative-drop/index.ts` | Replace `getUserIdFromJwt` with `getClaims()` |
| `describe-discover-metadata/index.ts` | Add `getClaims()` auth guard |
| `generate-scene-previews/index.ts` | Add `getClaims()` auth guard |

All 7 functions will be deployed after changes.

