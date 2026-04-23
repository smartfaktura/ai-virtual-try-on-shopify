ALTER TABLE public.discover_submissions
  ADD COLUMN IF NOT EXISTS workflow_slug text,
  ADD COLUMN IF NOT EXISTS workflow_name text,
  ADD COLUMN IF NOT EXISTS scene_name text,
  ADD COLUMN IF NOT EXISTS model_name text,
  ADD COLUMN IF NOT EXISTS scene_image_url text,
  ADD COLUMN IF NOT EXISTS model_image_url text;