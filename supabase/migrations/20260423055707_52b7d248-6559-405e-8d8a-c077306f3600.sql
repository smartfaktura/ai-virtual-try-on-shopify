ALTER TABLE public.discover_presets
  ADD COLUMN IF NOT EXISTS subcategory text;

CREATE INDEX IF NOT EXISTS idx_discover_presets_subcategory
  ON public.discover_presets (subcategory);