CREATE TABLE public.scene_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scene_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read scene categories"
  ON public.scene_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage scene categories"
  ON public.scene_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));