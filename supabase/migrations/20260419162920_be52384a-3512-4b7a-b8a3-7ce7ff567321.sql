CREATE TABLE public.user_outfit_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text,
  gender text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_outfit_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own outfit presets"
  ON public.user_outfit_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own outfit presets"
  ON public.user_outfit_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own outfit presets"
  ON public.user_outfit_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own outfit presets"
  ON public.user_outfit_presets FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_outfit_presets_user ON public.user_outfit_presets(user_id, created_at DESC);

CREATE TRIGGER update_user_outfit_presets_updated_at
  BEFORE UPDATE ON public.user_outfit_presets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();