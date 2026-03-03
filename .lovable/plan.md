

## Fix: `getClaims is not a function` Breaking All Edge Functions

### Root Cause
The security hardening introduced `supabase.auth.getClaims(token)` across 15 edge functions, but **`getClaims()` does not exist** in the `@supabase/supabase-js` versions used in these functions (most pin `@2.49.1`, some use `@2`). This breaks all generation, authentication, and AI-calling functions.

### Fix
Replace all `getClaims(token)` calls with `getUser(token)` — which is universally available, does **server-side cryptographic JWT verification**, and returns the user object.

The pattern change is mechanical across all files:

```typescript
// BEFORE (broken)
const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
if (claimsError || !claimsData?.claims) { /* 401 */ }
const userId = claimsData.claims.sub;

// AFTER (working)
const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
if (userError || !user) { /* 401 */ }
const userId = user.id;
```

### Additionally: Remove insecure `getUserIdFromJwt` fallback
`generate-freestyle` and `generate-tryon` still use the insecure `atob`-based `getUserIdFromJwt` as fallback for direct (non-queue) calls. Replace those with `getUser()` too.

### All 15 Files to Update

| File | Change |
|------|--------|
| `enqueue-generation/index.ts` | `getClaims` → `getUser` |
| `generate-freestyle/index.ts` | `getClaims` → `getUser` + remove `getUserIdFromJwt`, add `getUser` for direct calls |
| `generate-tryon/index.ts` | `getClaims` → `getUser` + remove `getUserIdFromJwt`, add `getUser` for direct calls |
| `generate-workflow/index.ts` | Add `getUser` auth for direct (non-queue) calls |
| `trigger-creative-drop/index.ts` | `getClaims` → `getUser` |
| `retry-queue/index.ts` | `getClaims` → `getUser` |
| `describe-discover-metadata/index.ts` | `getClaims` → `getUser` |
| `generate-scene-previews/index.ts` | `getClaims` → `getUser` |
| `describe-image/index.ts` | `getClaims` → `getUser` |
| `studio-chat/index.ts` | `getClaims` → `getUser` |
| `analyze-product-image/index.ts` | `getClaims` → `getUser` |
| `create-model-from-image/index.ts` | `getClaims` → `getUser` |
| `create-scene-from-image/index.ts` | `getClaims` → `getUser` |
| `check-subscription/index.ts` | `getClaims` → `getUser` |
| `create-checkout/index.ts` | `getClaims` → `getUser` |
| `mobile-upload/index.ts` | `getClaims` → `getUser` (2 occurrences) |
| `import-product/index.ts` | `getClaims` → `getUser` |

All 15+ functions will be redeployed after the fix.

