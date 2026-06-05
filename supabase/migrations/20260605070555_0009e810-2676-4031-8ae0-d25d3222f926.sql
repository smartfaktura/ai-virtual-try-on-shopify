
CREATE TABLE public.user_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Material',
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_materials TO authenticated;
GRANT ALL ON public.user_materials TO service_role;

ALTER TABLE public.user_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own materials" ON public.user_materials
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materials" ON public.user_materials
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON public.user_materials
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON public.user_materials
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX user_materials_user_created_idx ON public.user_materials(user_id, created_at DESC);
