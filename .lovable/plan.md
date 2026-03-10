

## Further Shopify Import Improvements

After reviewing the full pipeline (edge function, callback, and frontend), here are additional improvements:

### 1. OAuth Callback: Hardcoded redirect URL (Bug)

The `shopify-oauth-callback` function (line 90) has a hardcoded redirect URL: `https://vovvai.lovable.app/app/products/add?tab=shopify&shopify=connected`. This breaks in the preview environment. It should dynamically construct the redirect using `SUPABASE_URL` or pass the origin via the OAuth state.

### 2. OAuth Callback: No unique constraint for upsert

The upsert uses `onConflict: "user_id,shop_domain"` but the `shopify_connections` table has no unique constraint on `(user_id, shop_domain)`. This means every re-connect creates a duplicate row instead of updating the existing one. Need to add a unique constraint or switch to delete-then-insert.

### 3. Edge function: Shopify API version is outdated

Using `2024-01` which will be deprecated. Should upgrade to `2024-10` or `2025-01` for longer support.

### 4. Edge function: No validation on `product_ids` values

The `import` action accepts `product_ids` array but doesn't validate that values are numbers. A malformed request could cause unexpected Shopify API calls.

### 5. Frontend: Tags search not included in filter

The search bar filters by `title` and `product_type` but not by `tags`. Since tags are now displayed, users would expect to search by them.

### 6. Frontend: No error recovery during import

If a batch fails mid-import, there's no way to retry just the failed products. The user must start over and re-import (duplicates are caught, but it's a poor UX).

### 7. OAuth Callback: Missing HMAC validation

Shopify sends an `hmac` parameter with the callback to verify the request is authentic. The callback function doesn't validate it, allowing potential CSRF attacks.

### Summary of changes

| Priority | Issue | File |
|---|---|---|
| High | Fix hardcoded redirect URL in OAuth callback | `shopify-oauth-callback/index.ts` |
| High | Add unique constraint or fix upsert logic for `shopify_connections` | DB migration + `shopify-oauth-callback/index.ts` |
| Medium | Upgrade Shopify API version to `2025-01` | `shopify-sync/index.ts` |
| Medium | Add tag-based search filtering | `ShopifyImportTab.tsx` |
| Medium | Validate `product_ids` are numbers | `shopify-sync/index.ts` |
| Low | Add HMAC validation to OAuth callback | `shopify-oauth-callback/index.ts` |
| Low | Add retry-failed-only button on done screen | `ShopifyImportTab.tsx` |

