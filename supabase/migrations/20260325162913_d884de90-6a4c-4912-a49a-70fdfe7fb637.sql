
CREATE TABLE public.user_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL DEFAULT 'female',
  body_type text NOT NULL DEFAULT 'average',
  ethnicity text NOT NULL DEFAULT '',
  age_range text NOT NULL DEFAULT 'adult',
  image_url text NOT NULL,
  source_image_url text NOT NULL,
  credits_used integer NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.user_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own models" ON public.user_models
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
