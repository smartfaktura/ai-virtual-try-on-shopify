ALTER TABLE public.custom_scenes
  ADD COLUMN IF NOT EXISTS subcategory text;

CREATE INDEX IF NOT EXISTS idx_discover_presets_subcategory
  ON public.discover_presets (subcategory)
  WHERE subcategory IS NOT NULL;