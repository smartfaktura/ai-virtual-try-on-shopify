
CREATE TABLE public.model_sort_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.model_sort_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read model sort order"
  ON public.model_sort_order FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage model sort order"
  ON public.model_sort_order FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
