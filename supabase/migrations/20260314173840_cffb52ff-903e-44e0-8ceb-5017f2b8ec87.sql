CREATE TABLE public.hidden_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id text NOT NULL UNIQUE,
  hidden_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hidden_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage hidden scenes"
  ON public.hidden_scenes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read hidden scenes"
  ON public.hidden_scenes FOR SELECT TO authenticated
  USING (true);