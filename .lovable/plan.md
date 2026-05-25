# Fix `catalog_auth_bypass` in `generate-catalog`

## Problem

`supabase/functions/generate-catalog/index.ts` (line 366) decides "internal vs user" purely from the header `x-queue-internal: true`. When that header is present, it skips all auth and proceeds to expensive Gemini calls, storage writes, and credit/queue updates. Any anonymous caller can spoof the header and bypass auth.

The user path (`!isQueueInternal`) already validates a JWT correctly. Only the internal path is unprotected.

## Fix

In `supabase/functions/generate-catalog/index.ts`, replace the header-only check with the same pattern `process-queue` uses: trust `x-queue-internal` only when paired with a valid service-role bearer token.

```ts
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const authHeader = req.headers.get("authorization") ?? "";
const hasQueueHeader = req.headers.get("x-queue-internal") === "true";
const isQueueInternal = hasQueueHeader && authHeader === `Bearer ${serviceRoleKey}`;

if (hasQueueHeader && !isQueueInternal) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

The existing `if (!isQueueInternal) { ...verify user JWT... }` block stays unchanged — non-queue callers still need a valid user JWT.

## Why safe

- The legitimate caller of the internal path is `process-queue`, which already sends `Authorization: Bearer <SERVICE_ROLE_KEY>` together with `x-queue-internal: true` (see `dispatchGenerationFunction` in `process-queue/index.ts`). Real queue dispatch keeps working.
- Repo grep confirms no other caller sets `x-queue-internal` besides `process-queue` and `retry-queue` (which only triggers `process-queue`).
- User-initiated calls go through `!isQueueInternal` and are unaffected.
- Anonymous callers spoofing only the header now get 401 before any Gemini/storage/credit work.
- No DB, RLS, cron, `config.toml`, or frontend changes needed.

## Steps

1. Edit `supabase/functions/generate-catalog/index.ts` — replace the `isQueueInternal` derivation (line 366) and add the service-role check before the existing validation block.
2. Deploy `generate-catalog`.
3. Tail `generate-catalog` logs briefly to confirm queue jobs still complete cleanly.
4. Mark `catalog_auth_bypass` as fixed in the security scanner.
