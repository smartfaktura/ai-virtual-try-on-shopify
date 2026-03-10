

## Fix & Final Review

### 1. Input Focus Ring Bug (UI)

The screenshot shows the browser's default focus outline wrapping around just the input portion of the compound input (input + `.myshopify.com` suffix), creating an ugly disconnected highlight. 

**Fix**: Wrap the input+suffix in a `group` container with a shared focus-within ring, and remove the individual input's focus ring:

```tsx
<div className="flex items-center w-fit rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
  <Input
    className="rounded-r-none border-r-0 w-44 focus-visible:ring-0 focus-visible:ring-offset-0"
    ...
  />
  <span className="... rounded-r-md">
    .myshopify.com
  </span>
</div>
```

This makes the entire compound input highlight as one unit on focus.

### 2. Remaining Pipeline Review — All Clear

After examining all files (`shopify-oauth`, `shopify-oauth-callback`, `shopify-sync`, `ShopifyImportTab.tsx`):

- **Nonce-based OAuth state** — implemented, single-use, 10-min TTL
- **HMAC validation** — implemented with timing-safe comparison
- **JWT validation** — checked in both authorize and callback
- **Token encryption at rest** — encrypt on store, decrypt on read, fallback for pre-migration tokens
- **RLS** — all user tables scoped to `auth.uid()`
- **Input validation** — product IDs validated, shop domain sanitized
- **Unique constraint** — `(user_id, shop_domain)` on `shopify_connections`
- **API version** — upgraded to `2025-01`
- **Scope** — `read_products` only

No further issues identified. The pipeline is production-ready.

### Files to change

| File | Change |
|---|---|
| `ShopifyImportTab.tsx` | Fix focus ring on compound input (lines 333-345) |

