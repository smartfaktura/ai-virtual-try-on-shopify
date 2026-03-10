

## Shopify OAuth — Issues Found and Fixes

### Issues Identified

1. **`auth.getClaims()` does not exist** — Both `shopify-oauth` (disconnect) and `shopify-oauth-callback` use `supabaseUser.auth.getClaims(jwt)` which is not a real Supabase JS method. Must use `auth.getUser(token)` instead.

2. **Disconnect flow is broken** — The frontend calls `supabase.functions.invoke('shopify-oauth', ...)` which sends a POST request, but the edge function reads `action` from URL query params (`url.searchParams.get("action")`). The disconnect action will never match.

3. **Store domain input** — User wants to enter only the store name (e.g. `mystore`) with `.myshopify.com` suffix shown as a fixed label, instead of typing the full domain.

### Fix Plan

| File | Change |
|---|---|
| `shopify-oauth-callback/index.ts` | Replace `auth.getClaims(state)` with `auth.getUser(state)`, extract `user.id` |
| `shopify-oauth/index.ts` | Replace `auth.getClaims(jwt)` with `auth.getUser(jwt)`. Also handle disconnect via POST body (`req.json()`) in addition to query params, so the frontend invoke works |
| `ShopifyImportTab.tsx` | Change store domain input: show `.myshopify.com` as a fixed suffix, user only types the prefix. Auto-append `.myshopify.com` when building the OAuth URL and when querying. Fix disconnect to pass `action` in query params or switch to body-based approach |

### Technical Details

**Auth fix (both edge functions):**
```typescript
// Before (broken):
const { data: claimsData, error: claimsErr } = await supabaseUser.auth.getClaims(jwt);
const userId = claimsData.claims.sub;

// After (working):
const { data: { user }, error: userErr } = await supabaseUser.auth.getUser(jwt);
const userId = user.id;
```

**Input UX:** The store domain input becomes a prefix-only field with a fixed `.myshopify.com` suffix displayed inline, preventing full-domain entry mistakes.

