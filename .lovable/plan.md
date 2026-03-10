

## Shopify Import Security Audit — All Clear with 3 Minor Hardening Items

After examining every file in the pipeline (`shopify-oauth`, `shopify-oauth-callback`, `shopify-sync`, `ShopifyImportTab.tsx`, all migrations, and config), here is the full security picture:

### What is already secure

| Layer | Status |
|---|---|
| **Authentication** | `getUser(token)` validates JWT server-side in both `shopify-sync` and `shopify-oauth-callback` — no spoofing possible |
| **Access token storage** | Stored in `shopify_connections` with RLS (select/insert/update/delete scoped to `auth.uid() = user_id`). Edge function reads token from DB using service role — never accepted from request body |
| **OAuth callback** | HMAC validation against `SHOPIFY_CLIENT_SECRET`, timing-safe comparison, dynamic redirect via state param |
| **Shopify scope** | Only `read_products` — cannot modify store data |
| **Image storage** | Uploaded to `product-uploads` bucket under `{userId}/` path. Storage RLS enforces folder-scoped access per user |
| **Database isolation** | `user_products` and `product_images` both have RLS policies scoped to `auth.uid() = user_id` — User A cannot see User B's products |
| **Duplicate prevention** | Title+user_id check before insert prevents re-importing same product |
| **Rate limiting** | `shopifyFetch` handles 429 with Retry-After, 500ms delay between products |
| **Input validation** | `product_ids` validated as positive finite numbers, shop domain sanitized |
| **Unique constraint** | `UNIQUE (user_id, shop_domain)` on `shopify_connections` prevents duplicate rows |

### 3 remaining hardening items (low priority)

**1. OAuth `state` param passes JWT in URL query string**

In `shopify-oauth/index.ts` line 37, the user's JWT is passed as a URL query parameter (`&token=...`). This means the JWT appears in server logs, browser history, and Shopify's server logs. It works correctly but is a minor exposure vector.

**Fix**: Encrypt or HMAC-wrap the state value, or store a short-lived nonce in the DB and pass only the nonce as state.

**2. `shopify-oauth` authorize action has no auth check**

The `authorize` action (line 19-43) accepts `shop` and `token` from query params but doesn't validate the JWT before redirecting to Shopify. An attacker could trigger the OAuth flow with a stolen/expired JWT. The callback does validate the JWT, so this isn't exploitable, but validating earlier would be cleaner.

**Fix**: Add a quick `getUser` check before constructing the Shopify auth URL.

**3. `access_token` column is stored as plain text**

The Shopify access token in `shopify_connections.access_token` is stored unencrypted. RLS protects it from other users, but anyone with DB access (or a SQL injection elsewhere) could read all tokens.

**Fix**: Encrypt the token using `pgcrypto` or Vault before storing, decrypt in the edge function.

### Summary

The system is production-ready and secure for its purpose (securely importing product images, titles, and descriptions for a specific authenticated user). The 3 items above are defense-in-depth improvements, not exploitable bugs.

| Priority | Item | Risk |
|---|---|---|
| Low | Encrypt/nonce the OAuth state param | JWT visible in logs |
| Low | Validate JWT in authorize action | No exploit, but cleaner |
| Low | Encrypt access_token at rest | Defense-in-depth |

