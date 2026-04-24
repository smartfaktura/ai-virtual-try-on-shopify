CREATE POLICY "Public can read active scenes"
  ON public.product_image_scenes FOR SELECT TO anon
  USING (is_active = true);