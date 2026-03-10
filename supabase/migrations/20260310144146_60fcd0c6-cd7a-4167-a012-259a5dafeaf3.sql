
-- Create encrypt/decrypt helper functions using pgcrypto (extensions schema)
CREATE OR REPLACE FUNCTION public.encrypt_shopify_token(p_token text, p_key text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT encode(extensions.pgp_sym_encrypt(p_token, p_key), 'base64')
$$;

CREATE OR REPLACE FUNCTION public.decrypt_shopify_token(p_encrypted text, p_key text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT extensions.pgp_sym_decrypt(decode(p_encrypted, 'base64'), p_key)
$$;
