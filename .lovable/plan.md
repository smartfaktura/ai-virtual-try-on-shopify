

## Fix: Add JWT auth to `ai-shot-planner` edge function

### Root cause
`supabase/functions/ai-shot-planner/index.ts` accepts requests with no auth check, then calls Lovable AI using `LOVABLE_API_KEY`. Anyone with the function URL can burn paid API quota anonymously.

### Fix (one file)

**`supabase/functions/ai-shot-planner/index.ts`** — add JWT verification block immediately after the OPTIONS handler, before any request body parsing or AI call. Use the standard `getClaims()` pattern already used across the codebase (`analyze-product-image`, `studio-chat`, `kling-lip-sync`, etc.).

```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);
const token = authHeader.replace('Bearer ', '');
const { data: claims, error: authError } = await supabase.auth.getClaims(token);
if (authError || !claims?.claims) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
const userId = claims.claims.sub;
```

Add the `createClient` import from `@supabase/supabase-js` if not present. Log `userId` alongside existing console logs for traceability.

### Why this is safe
- `verify_jwt = false` in `config.toml` stays as-is (matches platform pattern) — auth is enforced in code.
- Frontend callers using `supabase.functions.invoke('ai-shot-planner', ...)` automatically attach the user's JWT, so no client changes are needed.
- Pattern is identical to `analyze-product-image` and `studio-chat`, which the Product Images flow already calls successfully.
- Mark security finding `open_ai_shot_planner` as fixed after deploy.

### Out of scope
- No changes to AI prompt logic, response shape, or any caller code.
- No changes to other edge functions.
- The separate `image-proxy` SSRF finding is tracked separately and not addressed here.

### Result
Anonymous calls to `ai-shot-planner` return 401. Authenticated app users continue to work unchanged. Paid AI quota is protected.

