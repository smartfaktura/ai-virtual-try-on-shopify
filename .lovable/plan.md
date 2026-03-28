

# Remove Shopify OAuth Infrastructure

## Summary
Remove the Shopify OAuth tables, edge functions, and related database functions since you're not using Shopify integration. The ShopifyImportTab (CSV-based Shopify export import) is a separate feature — we can keep or remove it based on your preference.

## What gets removed

### Database (migration)
- Drop table `shopify_oauth_nonces`
- Drop table `shopify_connections`
- Drop function `encrypt_shopify_token`
- Drop function `decrypt_shopify_token`
- Drop function `cleanup_expired_nonces`

### Edge Functions (delete)
- `supabase/functions/shopify-oauth/index.ts`
- `supabase/functions/shopify-oauth-callback/index.ts`
- `supabase/functions/shopify-sync/index.ts`

### Secrets (can be removed manually)
- `SHOPIFY_CLIENT_ID`
- `SHOPIFY_CLIENT_SECRET`

## What stays (no functional impact)
- `ShopifyImportTab.tsx` — this is a local CSV parser for Shopify product exports, has no OAuth dependency. We can keep it or remove it separately.
- Blog/landing page text mentions of "Shopify" — purely marketing copy, no code dependency.
- `StoreImportTab.tsx` — URL-based product import, unrelated to Shopify OAuth.

## Files changed
- 3 edge function directories deleted
- 1 new database migration (drop tables + functions)
- `supabase/config.toml` — remove any Shopify function config blocks if present

