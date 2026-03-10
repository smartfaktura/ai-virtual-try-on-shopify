
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
