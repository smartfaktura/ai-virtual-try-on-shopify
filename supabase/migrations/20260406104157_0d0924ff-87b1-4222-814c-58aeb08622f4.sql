
CREATE TABLE public.user_saved_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hex text,
  gradient_from text,
  gradient_to text,
  label text DEFAULT 'Custom',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_saved_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own colors"
  ON public.user_saved_colors FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
