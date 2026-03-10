

## Build Shopify OAuth Integration

### What we're building
Replace the manual token-paste flow with a one-click "Connect Shopify Store" button. Users enter their store domain, get redirected to Shopify's consent screen, and come back connected.

### Changes

**1. Database — `shopify_connections` table**
```sql
CREATE TABLE public.shopify_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shop_domain text NOT NULL,
  access_token text NOT NULL,
  scope text NOT NULL DEFAULT 'read_products',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, shop_domain)
);
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON public.shopify_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.shopify_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.shopify_connections FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.shopify_connections FOR UPDATE USING (auth.uid() = user_id);
```

**2. Secrets** — Add `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` via the secrets tool.

**3. New edge function — `shopify-oauth/index.ts`**
- `?action=authorize&shop=xxx` — builds Shopify OAuth URL, passes user JWT as `state`, redirects browser to Shopify consent screen
- `?action=disconnect` — deletes the connection row (requires auth)

**4. New edge function — `shopify-oauth-callback/index.ts`**
- Receives Shopify redirect with `?code=&shop=&state=`
- Exchanges code for permanent access token via `POST https://{shop}/admin/oauth/access_token`
- Validates the JWT from `state`, saves token to `shopify_connections`
- Redirects to `https://vovvai.lovable.app/app/products?shopify=connected`

**5. Update `shopify-sync/index.ts`**
- When `access_token` is missing from request body, look it up from `shopify_connections` using authenticated user's ID + shop domain
- Existing list/import logic stays unchanged

**6. Update `ShopifyImportTab.tsx`**
- On mount, query `shopify_connections` for existing connection
- **Connected state**: show store domain + "Disconnect" button, auto-load products
- **Not connected state**: show store domain input + "Connect Shopify Store" button that opens OAuth URL
- Listen for `?shopify=connected` URL param to refresh connection state
- Remove the manual access token input field entirely

**7. Config** — Add both new functions to `config.toml` with `verify_jwt = false`

### Technical details

OAuth flow:
```text
Browser → shopify-oauth?action=authorize&shop=store.myshopify.com
  ↓ 302 redirect
Shopify consent screen (read_products scope)
  ↓ 302 redirect  
shopify-oauth-callback?code=xxx&shop=store.myshopify.com&state=jwt
  ↓ exchange code → token, save to DB
302 → https://vovvai.lovable.app/app/products?shopify=connected
```

| Component | Action |
|---|---|
| Database | New `shopify_connections` table + RLS |
| Secrets | `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` |
| Edge function (new) | `shopify-oauth` — authorize + disconnect |
| Edge function (new) | `shopify-oauth-callback` — token exchange |
| Edge function (edit) | `shopify-sync` — DB token fallback |
| Frontend (edit) | `ShopifyImportTab` — OAuth connect button |

