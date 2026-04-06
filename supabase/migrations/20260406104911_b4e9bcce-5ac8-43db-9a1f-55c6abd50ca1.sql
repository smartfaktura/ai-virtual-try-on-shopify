
CREATE TABLE public.product_image_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  prompt_template text NOT NULL DEFAULT '',
  trigger_blocks text[] NOT NULL DEFAULT '{}',
  is_global boolean NOT NULL DEFAULT false,
  category_collection text,
  scene_type text NOT NULL DEFAULT 'packshot',
  exclude_categories text[] NOT NULL DEFAULT '{}',
  preview_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_image_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read active scenes"
  ON public.product_image_scenes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert scenes"
  ON public.product_image_scenes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scenes"
  ON public.product_image_scenes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scenes"
  ON public.product_image_scenes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
