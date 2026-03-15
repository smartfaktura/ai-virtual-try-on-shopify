
CREATE TABLE public.scene_sort_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scene_sort_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scene sort order"
  ON public.scene_sort_order FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can read scene sort order"
  ON public.scene_sort_order FOR SELECT
  TO authenticated
  USING (true);
