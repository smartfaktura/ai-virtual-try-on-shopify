

## Shopify Security Hardening — 3 Items

### Overview
Three defense-in-depth improvements to the Shopify OAuth and import pipeline.

### 1. Replace JWT in OAuth state with DB nonce

**Database migration** — Create `shopify_oauth_nonces` table:
- Columns: `id`, `nonce` (unique), `user_id`, `user_token`, `app_origin`, `created_at`, `expires_at` (10 min TTL)
- RLS enabled, no policies (service role only)
- Add `cleanup_expired_nonces()` function

**`shopify-oauth/index.ts`** — In the `authorize` action:
- Validate the JWT with `getUser()` before redirecting (fixes item #2 as well)
- Generate a `crypto.randomUUID()` nonce
- Store nonce + user token + origin in `shopify_oauth_nonces` table
- Pass only the nonce as `state` to Shopify (JWT never in URL)

**`shopify-oauth-callback/index.ts`** — Replace state parsing:
- Look up nonce from `shopify_oauth_nonces` table using service role
- Check expiry, delete nonce immediately (single-use)
- Extract `user_token` and `app_origin` from the nonce row
- Validate the stored JWT is still valid
- Remove all legacy state-parsing logic

**`ShopifyImportTab.tsx`** — Update `handleConnectOAuth` (line ~161-168):
- Pass `token` and `origin` as separate query params instead of JSON state
- URL becomes: `?action=authorize&shop=...&token=...&origin=...`

### 2. Validate JWT in authorize action
Covered by item #1 above — the `getUser()` check is added before generating the nonce.

### 3. Encrypt Shopify access_token at rest

Uses the existing `SHOPIFY_CLIENT_SECRET` as the encryption key (already securely stored, no new secret needed).

**`shopify-oauth-callback/index.ts`** — Before storing:
- Call `supabaseAdmin.rpc("encrypt_shopify_token", { p_token: accessToken, p_key: clientSecret })`
- Store the encrypted value in `shopify_connections.access_token`

**`shopify-sync/index.ts`** — When reading the token (line ~325-338):
- After fetching `conn.access_token`, decrypt it:
  ```typescript
  const { data: decrypted } = await supabaseAdmin.rpc(
    "decrypt_shopify_token",
    { p_encrypted: conn.access_token, p_key: Deno.env.get("SHOPIFY_CLIENT_SECRET")! }
  );
  const access_token = decrypted;
  ```

### Files changed — 4 files + 1 migration

| File | Change |
|---|---|
| Migration SQL | Create `shopify_oauth_nonces` table + cleanup function |
| `shopify-oauth/index.ts` | JWT validation + nonce generation (replaces raw JWT in URL) |
| `shopify-oauth-callback/index.ts` | Nonce lookup + encrypt token before storage |
| `shopify-sync/index.ts` | Decrypt token after reading from DB |
| `ShopifyImportTab.tsx` | Pass token + origin as separate params |

### Security note
The `encrypt_shopify_token` / `decrypt_shopify_token` functions already exist from a previous migration. They use `pgcrypto` (`pgp_sym_encrypt` / `pgp_sym_decrypt`). Using `SHOPIFY_CLIENT_SECRET` as the key means no additional secret is needed — if the client secret is ever rotated, you'd need to re-encrypt existing tokens.

