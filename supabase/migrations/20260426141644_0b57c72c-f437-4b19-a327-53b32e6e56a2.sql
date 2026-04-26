CREATE TABLE public.seo_page_visuals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_route text NOT NULL,
  slot_key text NOT NULL,
  scene_id text NOT NULL,
  preview_image_url text NOT NULL,
  alt_text text,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_route, slot_key)
);

ALTER TABLE public.seo_page_visuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read seo visual overrides"
  ON public.seo_page_visuals
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage seo visual overrides"
  ON public.seo_page_visuals
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX seo_page_visuals_route_idx ON public.seo_page_visuals (page_route);

CREATE TRIGGER update_seo_page_visuals_updated_at
  BEFORE UPDATE ON public.seo_page_visuals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();