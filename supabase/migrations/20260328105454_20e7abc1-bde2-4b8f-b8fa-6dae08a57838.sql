
DROP TABLE IF EXISTS public.shopify_oauth_nonces;
DROP TABLE IF EXISTS public.shopify_connections;
DROP FUNCTION IF EXISTS public.encrypt_shopify_token(text, text);
DROP FUNCTION IF EXISTS public.decrypt_shopify_token(text, text);
DROP FUNCTION IF EXISTS public.cleanup_expired_nonces();
