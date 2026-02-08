ALTER TABLE public.brand_profiles
  ADD COLUMN IF NOT EXISTS color_palette text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS brand_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_scenes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_audience text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS photography_reference text NOT NULL DEFAULT '';