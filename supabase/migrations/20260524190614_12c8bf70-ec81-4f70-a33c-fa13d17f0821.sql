
CREATE TABLE public.brand_scene_stock_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  sub_family text,
  image_url text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_scene_stock_products_lookup
  ON public.brand_scene_stock_products (module, sub_family, is_active, sort_order);

ALTER TABLE public.brand_scene_stock_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stock products"
  ON public.brand_scene_stock_products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert stock products"
  ON public.brand_scene_stock_products
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update stock products"
  ON public.brand_scene_stock_products
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete stock products"
  ON public.brand_scene_stock_products
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_brand_scene_stock_products_updated_at
  BEFORE UPDATE ON public.brand_scene_stock_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
