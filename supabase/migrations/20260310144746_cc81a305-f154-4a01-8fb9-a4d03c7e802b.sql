
-- Create shopify_oauth_nonces table for secure OAuth state management
CREATE TABLE public.shopify_oauth_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  user_token text NOT NULL,
  app_origin text NOT NULL DEFAULT 'https://vovvai.lovable.app',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- RLS enabled, no policies (service role only)
ALTER TABLE public.shopify_oauth_nonces ENABLE ROW LEVEL SECURITY;

-- Cleanup function for expired nonces
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.shopify_oauth_nonces WHERE expires_at < now();
$$;
